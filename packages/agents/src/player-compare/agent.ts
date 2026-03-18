import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerCompareOutputSchema } from '@rzf/shared/types'
import type { PlayerCompareInput, PlayerCompareOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, getAnchorValue, getAnchorTrend, classifyTrend } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'

// Tier 1 RSS + YouTube: deep comparison benefits from quality matchup/dynasty context
const DEFAULTS = {
  recencyWindowHours: 168,
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runPlayerCompareAgent(input: PlayerCompareInput, config?: AgentRuntimeConfig): Promise<PlayerCompareOutput> {
  const { userId, playerIds, focusNote } = input
  console.log(`[player-compare] Starting — userId=${userId} players=${playerIds.join(',')}`)

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

  // ── 2. Load all players + data in parallel ─────────────────────────────────
  const [players, marketValuesMap, rankings, tradeVolumes, injection, sessionContext] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: playerIds } } }),
    getMultiMarketValues(playerIds),
    db.playerRanking.findMany({
      where: { playerId: { in: playerIds }, source: 'fantasypros' },
      orderBy: { fetchedAt: 'desc' },
      take: playerIds.length,
    }),
    db.playerTradeVolume.findMany({ where: { sleeperId: { in: playerIds } } }),
    injectContent(playerIds, {
      agentType: 'player_compare',
      recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
      maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
      allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
      allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
    }),
    buildSessionContext(userId, config?.sessionId),
  ])

  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))
  const volumeMap = new Map(tradeVolumes.map((v) => [v.sleeperId, v]))

  // Build newsMap from content injection
  const newsMap = new Map<string, string[]>()
  for (const item of injection.items) {
    const existing = newsMap.get(item.playerId) ?? []
    if (existing.length < 2) existing.push(`[${item.sourceName}] ${item.title}`)
    newsMap.set(item.playerId, existing)
  }

  // ── 3. Compute positional dynasty ranks for each player (using KTC anchor) ─
  const dynastyRankMap = new Map<string, { dynastyRank: number | null; dynastyPositionRank: number | null }>()
  await Promise.all(playerIds.map(async (pid) => {
    const player = playerMap.get(pid)
    const mvals = marketValuesMap.get(pid)
    const ktcValue = mvals?.ktc?.dynasty1qb ?? mvals?.fantasycalc?.dynasty1qb ?? null
    if (!player || !ktcValue) {
      dynastyRankMap.set(pid, { dynastyRank: null, dynastyPositionRank: null })
      return
    }
    try {
      const source = mvals?.ktc?.dynasty1qb != null ? 'ktc' : 'fantasycalc'
      const [overallHigher, positionHigher] = await Promise.all([
        db.playerTradeValue.count({
          where: { source, dynasty1qb: { gt: ktcValue }, player: { team: { not: null } } },
        }),
        db.playerTradeValue.count({
          where: { source, dynasty1qb: { gt: ktcValue }, player: { team: { not: null }, position: player.position ?? undefined } },
        }),
      ])
      dynastyRankMap.set(pid, {
        dynastyRank: overallHigher + 1,
        dynastyPositionRank: positionHigher + 1,
      })
    } catch {
      dynastyRankMap.set(pid, { dynastyRank: null, dynastyPositionRank: null })
    }
  }))

  // ── 4. Fetch Dynasty Daddy trade counts ────────────────────────────────────
  const ddTradeCountMap = new Map<string, number>()
  await Promise.all(playerIds.map(async (pid) => {
    const player = playerMap.get(pid)
    if (!player) { ddTradeCountMap.set(pid, 0); return }
    try {
      const nameId = DynastyDaddyConnector.nameIdFromPlayer(player.firstName, player.lastName, player.position ?? '')
      const ddData = await DynastyDaddyConnector.getPlayerTrades(nameId)
      ddTradeCountMap.set(pid, ddData.trades?.length ?? 0)
    } catch {
      ddTradeCountMap.set(pid, 0)
    }
  }))

  // ── 5. Build player context objects ───────────────────────────────────────
  const leagueStyle = (userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft'

  const playerContexts = playerIds.map((pid) => {
    const p = playerMap.get(pid)
    const r = rankMap.get(pid)
    const ranks = dynastyRankMap.get(pid)
    const mvals = marketValuesMap.get(pid) ?? { ktc: null, fantasycalc: null, dynastyprocess: null, dynastysuperflex: null }
    const vol = volumeMap.get(pid)

    return {
      name: p ? `${p.firstName} ${p.lastName}`.trim() : pid,
      position: p?.position ?? null,
      team: p?.team ?? null,
      injuryStatus: p?.injuryStatus ?? null,
      age: p?.age ?? null,
      yearsExp: p?.yearsExp ?? null,
      marketValues: mvals,
      dynastyPositionRank: ranks?.dynastyPositionRank ?? null,
      dynastyRank: ranks?.dynastyRank ?? null,
      rankOverall: r?.rankOverall ?? null,
      rankPosition: r?.rankPosition ?? null,
      recentNews: newsMap.get(pid) ?? [],
      recentTrades: ddTradeCountMap.get(pid) ?? 0,
      tradeVolume1w: vol?.count1w ?? null,
      tradeVolume4w: vol?.count4w ?? null,
      _trend: classifyTrend(getAnchorTrend(mvals)),
    }
  })

  // ── 6. LLM call ────────────────────────────────────────────────────────────
  console.log(`[player-compare] Calling LLM — players=${playerIds.length} news=${injection.items.length}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(playerContexts, playerIds, focusNote, leagueStyle, sessionContext || undefined)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'sonnet' },
    (raw) => PlayerCompareOutputSchema.omit({ tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw),
  )

  console.log(`[player-compare] Complete — tokens=${tokensUsed} winner=${llmOutput.winnerName ?? 'even'}`)

  // Ensure each player in the output has dynasty/redraft values from market data
  const enrichedPlayers = llmOutput.players.map((p) => {
    const mvals = marketValuesMap.get(p.playerId)
    if (!mvals) return p
    return {
      ...p,
      dynastyValue: p.dynastyValue ?? getAnchorValue(mvals, 'dynasty'),
      redraftValue: p.redraftValue ?? getAnchorValue(mvals, 'redraft'),
      trend: p.trend ?? classifyTrend(getAnchorTrend(mvals)),
    }
  })

  return {
    ...llmOutput,
    players: enrichedPlayers,
    tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
