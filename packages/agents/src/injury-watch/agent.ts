import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import type { InjuryWatchInput, InjuryWatchOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent, type InjectedContent } from '../content-injector.js'
import { getMultiMarketValues, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'
import { z } from 'zod'

const agentContext = loadAgentContext(import.meta.url)

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
  )
    return 'high'
  if (injury.includes('questionable') || injury.includes('limited')) return 'medium'
  return 'low'
}

const EnrichedAlertSchema = z.array(
  z.object({
    playerId: z.string(),
    summary: z.string(),
    recommendation: z.string(),
    handcuffSuggestion: z.string().nullable().optional(),
  }),
)

export async function runInjuryWatchAgent(
  input: InjuryWatchInput,
  config?: AgentRuntimeConfig,
): Promise<InjuryWatchOutput> {
  const { userId, leagueId } = input

  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected. Visit /account/sleeper to link your account.')
  }

  // ── Rule-based alert generation (always runs, no LLM needed) ─────────────
  const [userRoster, allLeagueRosters] = await Promise.all([
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getRosters(leagueId).catch(() => []),
  ])
  if (!userRoster) {
    throw new Error(`No roster found for user ${sleeperProfile.sleeperId} in league ${leagueId}`)
  }

  const starterIds = new Set(userRoster.starters ?? [])
  const ownRosterIds = (userRoster.players ?? []).filter(
    (id: string) => !id.match(/^[A-Z]{2,3}$/) && id !== 'DEF',
  )

  const opponentStarterIds = new Set<string>()
  for (const roster of allLeagueRosters) {
    if (roster.roster_id === userRoster.roster_id) continue
    for (const id of roster.starters ?? []) {
      if (!id.match(/^[A-Z]{2,3}$/) && id !== 'DEF') opponentStarterIds.add(id)
    }
  }

  const allMonitoredIds = Array.from(new Set([...ownRosterIds, ...opponentStarterIds]))
  const players = await db.player.findMany({ where: { sleeperId: { in: allMonitoredIds } } })
  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))

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
          ? 'Opponent player. If this injury is confirmed, check your waiver wire — their backup may be a valuable add.'
          : severity === 'high'
            ? 'Prepare a backup option immediately and monitor final game-day inactive reports.'
            : 'Track final practice reports and be ready with a contingency starter.',
    }
  }

  const rawAlerts = [
    ...ownRosterIds
      .filter((id: string) => starterIds.has(id))
      .map((id: string) => buildAlert(id, 'own_starter')),
    ...ownRosterIds
      .filter((id: string) => !starterIds.has(id))
      .map((id: string) => buildAlert(id, 'own_bench')),
    ...Array.from(opponentStarterIds).map((id) => buildAlert(id, 'opponent_starter')),
  ].filter(Boolean) as NonNullable<ReturnType<typeof buildAlert>>[]

  const alerts = rawAlerts.sort((a, b) => {
    const ctxRank = { own_starter: 0, own_bench: 1, opponent_starter: 2 }
    const sevRank = { high: 0, medium: 1, low: 2 }
    return ctxRank[a.context] - ctxRank[b.context] || sevRank[a.severity] - sevRank[b.severity]
  })

  const ownStarterCount = ownRosterIds.filter((id: string) => starterIds.has(id)).length
  const ownAlerts = alerts.filter((a) => a.context !== 'opponent_starter')

  // Fetch news + market values for enrichment
  const alertPlayerIds = ownAlerts.map((a) => a.playerId)
  const highSeverityOwnIds = ownAlerts
    .filter((a) => a.severity === 'high')
    .map((a) => a.playerId)

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

  // If no news or no alerts to enrich, return rule-based output
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

  // ── LLM enrichment via loop engine ───────────────────────────────────────
  console.log(
    `[injury-watch] Enriching ${ownAlerts.length} alert(s) with ${injection.items.length} news item(s)`,
  )

  const tools = {
    roster_alerts: async (): Promise<string> => {
      const lines = ['[Injured Players — Enrich Summaries]']
      for (const alert of ownAlerts) {
        const contextLabel =
          alert.context === 'own_bench'
            ? ' [Bench]'
            : alert.context === 'opponent_starter'
              ? ' [Opponent]'
              : ' [Starter]'
        lines.push(
          `Player: ${alert.playerName} (${alert.position}, ${alert.team ?? 'FA'})${contextLabel}`,
          `Severity: ${alert.severity}`,
          `Status: ${alert.injuryStatus ?? alert.status ?? 'none listed'}`,
        )
        const vals = marketValues.get(alert.playerId)
        if (vals) lines.push(formatMarketValuesForPrompt(alert.playerName, vals))
        const playerNews = injection.items.filter(
          (item: InjectedContent) => item.playerId === alert.playerId,
        )
        if (playerNews.length > 0) {
          lines.push('News:')
          for (const n of playerNews) {
            const tierLabel = n.sourceTier === 1 ? 'Tier 1' : n.sourceTier === 2 ? 'Tier 2' : 'Tier 3'
            lines.push(`  [${n.sourceName} | ${tierLabel}]: "${n.title}"`)
          }
        } else {
          lines.push('News: none available — use status field only.')
        }
        lines.push('')
      }
      return lines.join('\n')
    },

    session_history: async (): Promise<string> => {
      return sessionContext || 'No prior session context.'
    },
  }

  const extraParts: string[] = []
  if (input.focusNote?.trim()) extraParts.push(`USER FOCUS: ${input.focusNote.trim()}`)
  extraParts.push('Return a JSON array with one entry per player listed above.')

  try {
    const { output: enriched, metadata } = await runAgentLoop({
      context: agentContext,
      tools,
      initialTools: ['roster_alerts'],
      outputValidator: (raw) => EnrichedAlertSchema.parse(raw),
      extraContext: extraParts.length > 0 ? extraParts.join('\n\n') : undefined,
      model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku',
      maxOutputTokens: 2000,
      maxIterations: 3,
    })

    console.log(
      `[injury-watch] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations}`,
    )

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
      riskyStarters: mergedAlerts.filter((a) => a.context === 'own_starter').length,
      healthyStarters: Math.max(
        0,
        ownStarterCount - mergedAlerts.filter((a) => a.context === 'own_starter').length,
      ),
      tokensUsed: metadata.tokensUsed,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  } catch (err) {
    console.warn(
      '[injury-watch] LLM enrichment failed, using rule-based output:',
      err instanceof Error ? err.message : String(err),
    )
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
