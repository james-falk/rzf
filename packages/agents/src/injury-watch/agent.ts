import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import type { InjuryWatchInput, InjuryWatchOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent, type InjectedContent } from '../content-injector.js'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'

// Default source injection config for this agent
const DEFAULTS = {
  recencyWindowHours: 48,
  maxContentItems: 10,
  allowedTiers: [1, 2, 3],
  allowedPlatforms: ['rss', 'youtube'],
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

  const userRoster = await SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId)
  if (!userRoster) {
    throw new Error(`No roster found for user ${sleeperProfile.sleeperId} in league ${leagueId}`)
  }

  const starterIds = new Set(userRoster.starters ?? [])
  const rosterPlayerIds = (userRoster.players ?? []).filter((id) => !id.match(/^[A-Z]{2,3}$/) && id !== 'DEF')

  const players = await db.player.findMany({
    where: { sleeperId: { in: rosterPlayerIds } },
  })

  // ── Rule-based severity classification (always runs) ──────────────────────
  const alerts = players
    .filter((p) => starterIds.has(p.sleeperId))
    .map((p) => {
      const severity = toSeverity(p.injuryStatus, p.status)
      return {
        playerId: p.sleeperId,
        playerName: `${p.firstName} ${p.lastName}`.trim(),
        position: p.position ?? 'UNKNOWN',
        team: p.team ?? null,
        status: p.status ?? null,
        injuryStatus: p.injuryStatus ?? null,
        severity,
        summary: p.injuryStatus
          ? `${p.firstName} ${p.lastName} is listed as ${p.injuryStatus}.`
          : `${p.firstName} ${p.lastName} has no listed injury status.`,
        recommendation:
          severity === 'high'
            ? 'Prepare a backup option immediately and monitor final game-day inactive reports.'
            : severity === 'medium'
              ? 'Track final practice reports and be ready with a contingency starter.'
              : 'No immediate action required; continue normal lineup planning.',
      }
    })
    .filter((a) => a.severity !== 'low')
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.severity] - rank[b.severity]
    })

  const starterCount = players.filter((p) => starterIds.has(p.sleeperId)).length

  // ── Content injection ──────────────────────────────────────────────────────
  const alertPlayerIds = alerts.map((a) => a.playerId)
  const injection = await injectContent(alertPlayerIds, {
    agentType: 'injury_watch',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  // ── LLM enhancement (only when news is available) ─────────────────────────
  if (injection.items.length === 0 || alerts.length === 0) {
    return {
      alerts,
      riskyStarters: alerts.length,
      healthyStarters: Math.max(0, starterCount - alerts.length),
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

    const alertContexts = alerts.map((a) => ({
      playerId: a.playerId,
      playerName: a.playerName,
      position: a.position,
      team: a.team,
      injuryStatus: a.injuryStatus,
      status: a.status,
      severity: a.severity,
    }))

    const systemPrompt = buildSystemPrompt(config?.systemPromptOverride)
    const userPrompt = buildUserPrompt(alertContexts, newsSnippets)

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
      riskyStarters: mergedAlerts.length,
      healthyStarters: Math.max(0, starterCount - mergedAlerts.length),
      tokensUsed,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  } catch (err) {
    // If LLM enrichment fails, fall back to rule-based output gracefully
    console.warn('[injury-watch] LLM enrichment failed, using rule-based output:', err instanceof Error ? err.message : String(err))
    return {
      alerts,
      riskyStarters: alerts.length,
      healthyStarters: Math.max(0, starterCount - alerts.length),
      tokensUsed: 0,
      confidenceScore: injection.confidenceScore,
      sourcesUsed: injection.sourcesUsed,
    }
  }
}
