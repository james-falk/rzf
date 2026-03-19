import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { buildUserContext } from '@rzf/shared'
import { TradeAnalysisOutputSchema } from '@rzf/shared/types'
import type { TradeAnalysisInput, TradeAnalysisOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { isDraftPick, parseDraftPickId, formatDraftPickForPrompt, estimateDraftPickValue } from '../draft-picks.js'

// Tier 1 only, all platforms: trade analysis needs authoritative sources.
// Tightened from Tier 1+2 to keep signal quality high for value reasoning.
const DEFAULTS = {
  recencyWindowHours: 168, // 7 days
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runTradeAnalysisAgent(input: TradeAnalysisInput, config?: AgentRuntimeConfig): Promise<TradeAnalysisOutput> {
  const { userId, leagueId, giving, receiving, focusNote } = input
  console.log(`[trade-analysis] Starting — userId=${userId} giving=${giving.join(',')} receiving=${receiving.join(',')}`)

  // ── 1. Load user preferences ───────────────────────────────────────────────
  const userPrefs = await db.userPreferences.findUnique({ where: { userId } })
  const userContext = buildUserContext(
    userPrefs
      ? {
          leagueStyle: userPrefs.leagueStyle,
          scoringPriority: userPrefs.scoringPriority,
          playStyle: userPrefs.playStyle,
          reportFormat: userPrefs.reportFormat,
          priorityPositions: userPrefs.priorityPositions,
          customInstructions: userPrefs.customInstructions,
        }
      : null,
  )

  // Separate player IDs from draft pick IDs
  const allIds = [...giving, ...receiving]
  const allPlayerIds = allIds.filter((id) => !isDraftPick(id))
  const givingPicks = giving.filter(isDraftPick).map((id) => parseDraftPickId(id)).filter(Boolean)
  const receivingPicks = receiving.filter(isDraftPick).map((id) => parseDraftPickId(id)).filter(Boolean)

  // ── 2. Fetch all player data + content in parallel ─────────────────────────
  const [players, marketValues, rankings, injection, sessionContext] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
    getMultiMarketValues(allPlayerIds),
    db.playerRanking.findMany({
      where: { playerId: { in: allPlayerIds }, source: 'fantasypros' },
      orderBy: { fetchedAt: 'desc' },
      take: allPlayerIds.length,
    }),
    injectContent(allPlayerIds, {
      agentType: 'trade_analysis',
      recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
      maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
      allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
      allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
    }),
    buildSessionContext(userId, config?.sessionId),
  ])

  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))

  // ── 2b. Fetch league standings if a league was provided ───────────────────
  let leagueStandings: Array<{ teamName: string; wins: number; losses: number }> = []
  if (leagueId) {
    try {
      const rosters = await SleeperConnector.getRosters(leagueId)
      leagueStandings = rosters
        .filter((r) => r.settings)
        .map((r) => ({
          teamName: `Roster ${r.roster_id}`,
          wins: r.settings?.wins ?? 0,
          losses: r.settings?.losses ?? 0,
        }))
        .sort((a, b) => b.wins - a.wins)
        .slice(0, 12)
    } catch {
      // Non-critical — standings just add context
    }
  }

  // Build newsMap from injection result: playerId → formatted headlines
  const newsMap = new Map<string, string[]>()
  for (const item of injection.items) {
    const existing = newsMap.get(item.playerId) ?? []
    if (existing.length < 3) {
      existing.push(`[${item.sourceName}] ${item.title}`)
    }
    newsMap.set(item.playerId, existing)
  }

  // ── 3. Get community trade context from Dynasty Daddy ─────────────────────
  const communityTradeData = new Map<string, { recentCount: number; weeklyVolume: number }>()
  // Collect raw trade examples per player to surface in the report
  const rawTradeExamples: Array<{ sideA: string[]; sideB: string[]; transaction_date: string }> = []

  await Promise.all(
    allPlayerIds.map(async (playerId) => {
      const player = playerMap.get(playerId)
      if (!player) return
      try {
        const nameId = DynastyDaddyConnector.nameIdFromPlayer(
          player.firstName,
          player.lastName,
          player.position ?? '',
        )
        const ddData = await DynastyDaddyConnector.getPlayerTrades(nameId)
        const recentCount = ddData.trades?.length ?? 0
        const weeklyVolume = ddData.tradeVolume?.find((v: { week_interval: number; count: number }) => v.week_interval === 1)?.count ?? 0
        communityTradeData.set(playerId, { recentCount, weeklyVolume })
        // Collect first 3 trade examples for this player
        if (ddData.trades?.length) {
          rawTradeExamples.push(...ddData.trades.slice(0, 3))
        }
      } catch {
        communityTradeData.set(playerId, { recentCount: 0, weeklyVolume: 0 })
      }
    }),
  )

  // Resolve trade example name_ids to display names.
  // Collect all name_ids referenced in raw trade examples, then query DB in one shot.
  const allTradeNameIds = new Set<string>()
  for (const t of rawTradeExamples) {
    for (const id of [...t.sideA, ...t.sideB]) allTradeNameIds.add(id)
  }

  const nameIdToDisplay = new Map<string, string>()
  if (allTradeNameIds.size > 0) {
    // Build a reverse lookup from our full player table for the name_ids we actually need
    const allPlayersForLookup = await db.player.findMany({
      select: { firstName: true, lastName: true, position: true },
      where: { team: { not: null } },
    })
    for (const p of allPlayersForLookup) {
      const nameId = DynastyDaddyConnector.nameIdFromPlayer(p.firstName, p.lastName, p.position ?? '')
      if (allTradeNameIds.has(nameId)) {
        nameIdToDisplay.set(nameId, `${p.firstName} ${p.lastName}`.trim())
      }
    }
  }

  const resolvedTrades = rawTradeExamples.slice(0, 5).map((t) => ({
    sideA: t.sideA.map((id) => nameIdToDisplay.get(id) ?? id),
    sideB: t.sideB.map((id) => nameIdToDisplay.get(id) ?? id),
    date: t.transaction_date,
  }))

  // ── 4. Build enriched player context ──────────────────────────────────────
  const enrichPlayer = (id: string) => {
    if (isDraftPick(id)) return null
    const p = playerMap.get(id)
    const r = rankMap.get(id)
    return {
      playerId: id,
      name: p ? `${p.firstName} ${p.lastName}`.trim() : id,
      position: p?.position ?? 'UNKNOWN',
      team: p?.team ?? null,
      marketValues: marketValues.get(id) ?? null,
      rankOverall: r?.rankOverall ?? null,
      injuryStatus: p?.injuryStatus ?? null,
      recentNews: newsMap.get(id) ?? [],
      recentTradeCount: communityTradeData.get(id)?.recentCount ?? 0,
      weeklyTradeVolume: communityTradeData.get(id)?.weeklyVolume ?? 0,
    }
  }

  const givingContext = giving.filter((id) => !isDraftPick(id)).map(enrichPlayer).filter(Boolean) as NonNullable<ReturnType<typeof enrichPlayer>>[]
  const receivingContext = receiving.filter((id) => !isDraftPick(id)).map(enrichPlayer).filter(Boolean) as NonNullable<ReturnType<typeof enrichPlayer>>[]

  const leagueStyle = (userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft'

  // ── 5. LLM call ────────────────────────────────────────────────────────────
  console.log(`[trade-analysis] Calling LLM — news=${injection.items.length} confidence=${injection.confidenceScore}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(
    givingContext,
    receivingContext,
    focusNote,
    resolvedTrades,
    givingPicks as NonNullable<ReturnType<typeof parseDraftPickId>>[],
    receivingPicks as NonNullable<ReturnType<typeof parseDraftPickId>>[],
    leagueStyle,
    leagueStandings,
    sessionContext || undefined,
  )

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'sonnet' },
    (raw) => TradeAnalysisOutputSchema.omit({ tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw),
  )

  console.log(`[trade-analysis] Complete — tokens=${tokensUsed} verdict=${llmOutput.verdict}`)

  return {
    ...llmOutput,
    recentTrades: resolvedTrades.length > 0 ? resolvedTrades : undefined,
    tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
