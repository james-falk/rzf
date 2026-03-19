import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import type { InjuryWatchInput, InjuryWatchOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent, type InjectedContent } from '../content-injector.js'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { getMultiMarketValues } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'

// Tier 1 RSS only: injury watch needs high-signal, time-critical beat reports.
// YouTube and Tier 3 add noise for this time-sensitive agent.
const DEFAULTS = {
  recencyWindowHours: 48,
  maxContentItems: 10,
  allowedTiers: [1],
  allowedPlatforms: ['rss'],
}

function toSeverity(injuryStatus: string | null, status: string | null): 'high' | 'medium' | 'low' {
  const injury = (injuryStatus ?? '').toLowerCase()
  const playerStatus = (status ?? '').toLowerCase()

  if (
    injury.includes('out') ||
    injury.includes('doubtful') ||
    injury.includes('ir') ||
    playerStatus.includes('inactive')
  ) {
    return 'high'
  }
  if (injury.includes('questionable') || injury.includes('limited')) {
    return 'medium'
  }
  return 'low'
}

export async function runInjuryWatchAgent(
  input: InjuryWatchInput,
  config?: AgentRuntimeConfig,
): Promise<InjuryWatchOutput> {
  const { userId, leagueId } = input

  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected. Visit /account/sleeper to link your account.')
  }

  // ── Fetch user roster + all league rosters (for league-wide injury scope) ──
  const [userRoster, allLeagueRosters] = await Promise.all([
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getRosters(leagueId).catch(() => []),
  ])

  if (!userRoster) {
    throw new Error(`No roster found for user ${sleeperProfile.sleeperId} in league ${leagueId}`)
  }

  const starterIds = new Set(userRoster.starters ?? [])
  const ownRosterIds = (userRoster.players ?? []).filter((id: string) => !id.match(/^[A-Z]{2,3}$/) && id !== 'DEF')

  // Collect league-wide player IDs (opponents' starters) for broader injury scan
  const opponentStarterIds = new Set<string>()
  for (const roster of allLeagueRosters) {
    if (roster.roster_id === userRoster.roster_id) continue
    for (const id of roster.starters ?? []) {
      if (!id.match(/^[A-Z]{2,3}$/) && id !== 'DEF') opponentStarterIds.add(id)
    }
  }

  const allMonitoredIds = Array.from(new Set([...ownRosterIds, ...opponentStarterIds]))

  const players = await db.player.findMany({
    where: { sleeperId: { in: allMonitoredIds } },
  })

  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))

  // ── Rule-based severity classification (always runs) ──────────────────────
  // Own starters: full alerts. Own bench: monitor alerts. Opponent starters: waiver-opportunity alerts.
  const buildAlert = (id: string, context: 'own_starter' | 'own_bench' | 'opponent_starter') => {
    const p = playerMap.get(id)
    if (!p) return null
    const severity = toSeverity(p.injuryStatus, p.status)
    if (severity === 'low') return null
    return {
      playerId: p.sleeperId,
      playerName: `${p.firstName} ${p.lastName}`.trim(),
      position: p.position ?? 'UNKNOWN',
      team: p.team ?? null,
      status: p.status ?? null,
      injuryStatus: p.injuryStatus ?? null,
      severity,
      context,
      summary: p.injuryStatus
        ? `${p.firstName} ${p.lastName} is listed as ${p.injuryStatus}.`
        : `${p.firstName} ${p.lastName} has no listed injury status.`,
      recommendation:
        context === 'opponent_starter'
          ? `Opponent player. If this injury is confirmed, check your waiver wire — their backup may be a valuable add.`
          : severity === 'high'
            ? 'Prepare a backup option immediately and monitor final game-day inactive reports.'
            : 'Track final practice reports and be ready with a contingency starter.',
    }
  }

  const rawAlerts = [
    ...ownRosterIds.filter((id: string) => starterIds.has(id)).map((id: string) => buildAlert(id, 'own_starter')),
    ...ownRosterIds.filter((id: string) => !starterIds.has(id)).map((id: string) => buildAlert(id, 'own_bench')),
    ...Array.from(opponentStarterIds).map((id) => buildAlert(id, 'opponent_starter')),
  ].filter(Boolean) as NonNullable<ReturnType<typeof buildAlert>>[]

  const alerts = rawAlerts.sort((a, b) => {
    const ctxRank = { own_starter: 0, own_bench: 1, opponent_starter: 2 }
    const sevRank = { high: 0, medium: 1, low: 2 }
    return ctxRank[a.context] - ctxRank[b.context] || sevRank[a.severity] - sevRank[b.severity]
  })

  const ownStarterCount = ownRosterIds.filter((id: string) => starterIds.has(id)).length

  // ── Trade values for flagged players (high-severity own starters) ──────────
  const highSeverityOwnIds = alerts
    .filter((a) => a.context === 'own_starter' && a.severity === 'high')
    .map((a) => a.playerId)

  // ── Content injection ──────────────────────────────────────────────────────
  const alertPlayerIds = alerts.filter((a) => a.context !== 'opponent_starter').map((a) => a.playerId)
  const [injection, marketValues, sessionContext] = await Promise.all([
    injectContent(alertPlayerIds, {
      agentType: 'injury_watch',
      recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
      maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
      allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
      allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
    }),
    getMultiMarketValues(highSeverityOwnIds),
    buildSessionContext(userId, config?.sessionId),
  ])

  // ── LLM enhancement (only when news is available) ─────────────────────────
  const ownAlerts = alerts.filter((a) => a.context !== 'opponent_starter')
  if (injection.items.length === 0 || ownAlerts.length === 0) {
    return {
      alerts,
      riskyStarters: ownAlerts.length,
      healthyStarters: Math.max(0, ownStarterCount - ownAlerts.length),
      tokensUsed: 0,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  }

  console.log(`[injury-watch] Calling LLM to enrich ${alerts.length} alert(s) with ${injection.items.length} news item(s)`)

  try {
    const newsSnippets = injection.items.map((item: InjectedContent) => ({
      playerId: item.playerId,
      sourceName: item.sourceName,
      sourceTier: item.sourceTier,
      title: item.title,
      snippet: item.snippet,
      publishedAt: item.publishedAt,
    }))

    const alertContexts = ownAlerts.map((a) => ({
      playerId: a.playerId,
      playerName: a.playerName,
      position: a.position,
      team: a.team,
      injuryStatus: a.injuryStatus,
      status: a.status,
      severity: a.severity,
      context: a.context,
      marketValues: marketValues.get(a.playerId) ?? null,
    }))

    const systemPrompt = buildSystemPrompt(config?.systemPromptOverride)
    const userPrompt = buildUserPrompt(alertContexts, newsSnippets, input.focusNote, sessionContext || undefined)

    const { data: enriched, tokensUsed } = await LLMConnector.completeJSON(
      { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
      (raw) => {
        if (!Array.isArray(raw)) throw new Error('Expected JSON array from LLM')
        return raw as Array<{
          playerId: string
          summary: string
          recommendation: string
          handcuffSuggestion?: string | null
        }>
      },
    )

    // Merge LLM-enriched fields into rule-based alerts
    const enrichedMap = new Map(enriched.map((e) => [e.playerId, e]))
    const mergedAlerts = alerts.map((alert) => {
      const llm = enrichedMap.get(alert.playerId)
      if (!llm) return alert
      return {
        ...alert,
        summary: llm.summary || alert.summary,
        recommendation: llm.recommendation || alert.recommendation,
        handcuffSuggestion: llm.handcuffSuggestion ?? undefined,
      }
    })

    return {
      alerts: mergedAlerts,
      riskyStarters: mergedAlerts.filter((a) => (a as typeof a & { context?: string }).context === 'own_starter').length,
      healthyStarters: Math.max(0, ownStarterCount - mergedAlerts.filter((a) => (a as typeof a & { context?: string }).context === 'own_starter').length),
      tokensUsed,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  } catch (err) {
    // If LLM enrichment fails, fall back to rule-based output gracefully
    console.warn('[injury-watch] LLM enrichment failed, using rule-based output:', err instanceof Error ? err.message : String(err))
    return {
      alerts,
      riskyStarters: ownAlerts.length,
      healthyStarters: Math.max(0, ownStarterCount - ownAlerts.length),
      tokensUsed: 0,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  }
}
