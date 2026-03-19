import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerScoutOutputSchema } from '@rzf/shared/types'
import type { PlayerScoutInput, PlayerScoutOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, getAnchorValue, getAnchorTrend, classifyTrend } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'

// All tiers + all platforms: deep-dive scouting needs maximum coverage.
// Tier 3 niche channels can surface unique insights on specific players.
const DEFAULTS = {
  recencyWindowHours: 168, // 7 days
  maxContentItems: 15,
  allowedTiers: [1, 2, 3],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runPlayerScoutAgent(input: PlayerScoutInput, config?: AgentRuntimeConfig): Promise<PlayerScoutOutput> {
  const { userId, playerId, context, focusNote } = input
  console.log(`[player-scout] Starting — userId=${userId} playerId=${playerId}`)

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

  // ── 2. Load player + supporting data in parallel ───────────────────────────
  const nflState = await SleeperConnector.getNFLState()
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const [player, marketValuesMap, ranking, recentTradeCount, ddTrades, injection, sessionContext] = await Promise.all([
    db.player.findUnique({ where: { sleeperId: playerId } }),
    getMultiMarketValues([playerId]),
    db.playerRanking.findFirst({
      where: { playerId, source: 'fantasypros', week, season },
    }),
    db.tradeTransaction.count({
      where: {
        OR: [
          { adds: { path: [playerId], not: undefined } as never },
        ],
      },
    }).catch(() => 0),
    (async () => {
      try {
        const p = await db.player.findUnique({
          where: { sleeperId: playerId },
          select: { firstName: true, lastName: true, position: true },
        })
        if (!p) return null
        const nameId = DynastyDaddyConnector.nameIdFromPlayer(p.firstName, p.lastName, p.position ?? '')
        return await DynastyDaddyConnector.getPlayerTrades(nameId)
      } catch {
        return null
      }
    })(),
    injectContent([playerId], {
      agentType: 'player_scout',
      recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
      maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
      allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
      allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
    }),
    buildSessionContext(userId, config?.sessionId),
  ])

  const marketValues = marketValuesMap.get(playerId) ?? { ktc: null, fantasycalc: null, dynastyprocess: null, dynastysuperflex: null }

  if (!player) {
    throw new Error(`Player not found: ${playerId}`)
  }

  // Fallback trade count using raw query for JSON field search
  let tradeCount = recentTradeCount
  try {
    const rawCount = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM trade_transactions
      WHERE adds::jsonb ? ${playerId} OR drops::jsonb ? ${playerId}
    `
    tradeCount = Number(rawCount[0]?.count ?? 0)
  } catch {
    // use the fallback count
  }

  // Build recentNews from injection (tiered, time-filtered)
  const recentNews = injection.items.map((item) => `[${item.sourceName}] ${item.title}`)

  // Build structured news items for UI display (with links + source attribution)
  const newsItems = injection.items.slice(0, 5).map((item) => ({
    title: item.title,
    url: item.sourceUrl ?? null,
    sourceName: item.sourceName,
    publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : null,
  }))

  const communityTradeCount = ddTrades?.trades?.length ?? 0
  const weeklyTradeVolume =
    ddTrades?.tradeVolume?.find((v: { week_interval: number; count: number }) => v.week_interval === 1)?.count ?? 0

  // ── 3. Compute dynasty positional rank (using KTC as anchor) ────────────────
  let dynastyRank: number | null = null
  let dynastyPositionRank: number | null = null
  const ktcDynastyValue = marketValues.ktc?.dynasty1qb ?? marketValues.fantasycalc?.dynasty1qb ?? null
  if (ktcDynastyValue != null && player.position) {
    try {
      const [overallHigher, positionHigher] = await Promise.all([
        db.playerTradeValue.count({
          where: { source: 'ktc', dynasty1qb: { gt: ktcDynastyValue }, player: { team: { not: null } } },
        }).catch(() => db.playerTradeValue.count({
          where: { source: 'fantasycalc', dynasty1qb: { gt: ktcDynastyValue }, player: { team: { not: null } } },
        })),
        db.playerTradeValue.count({
          where: { source: 'ktc', dynasty1qb: { gt: ktcDynastyValue }, player: { team: { not: null }, position: player.position } },
        }).catch(() => db.playerTradeValue.count({
          where: { source: 'fantasycalc', dynasty1qb: { gt: ktcDynastyValue }, player: { team: { not: null }, position: player.position } },
        })),
      ])
      dynastyRank = overallHigher + 1
      dynastyPositionRank = positionHigher + 1
    } catch { /* non-critical */ }
  }

  // ── 4. Determine trend ─────────────────────────────────────────────────────
  const leaguePrefs = await db.userPreferences.findUnique({ where: { userId }, select: { leagueStyle: true } }).catch(() => null)
  const leagueStyle = ((leaguePrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft') as 'dynasty' | 'redraft'

  const playerContext = {
    name: `${player.firstName} ${player.lastName}`.trim(),
    position: player.position,
    team: player.team,
    injuryStatus: player.injuryStatus,
    practiceParticipation: player.practiceParticipation,
    depthChartOrder: player.depthChartOrder,
    age: player.age,
    yearsExp: player.yearsExp,
    marketValues,
    rankOverall: ranking?.rankOverall ?? null,
    rankPosition: ranking?.rankPosition ?? null,
    recentNews,
    recentTrades: tradeCount,
    communityTradeCount,
    weeklyTradeVolume,
    context,
    sessionContext: sessionContext || undefined,
    leagueStyle,
  }

  // ── 5. LLM call ────────────────────────────────────────────────────────────
  console.log(`[player-scout] Calling LLM — ${player.firstName} ${player.lastName} news=${injection.items.length} confidence=${injection.confidenceScore}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(playerContext, focusNote)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => PlayerScoutOutputSchema.omit({
      playerId: true, playerName: true, position: true, team: true,
      injuryStatus: true, rankOverall: true, rankPosition: true,
      dynasty1qbValue: true, redraftValue: true, recentTradesCount: true,
      dynastyRank: true, dynastyPositionRank: true, newsItems: true,
      tokensUsed: true, confidenceScore: true, sourcesUsed: true,
    }).parse(raw),
  )

  console.log(`[player-scout] Complete — tokens=${tokensUsed} dynastyRank=${dynastyRank} posRank=${dynastyPositionRank}`)

  return {
    playerId,
    playerName: playerContext.name,
    position: player.position,
    team: player.team,
    injuryStatus: player.injuryStatus,
    rankOverall: ranking?.rankOverall ?? null,
    rankPosition: ranking?.rankPosition ?? null,
    dynastyRank,
    dynastyPositionRank,
    dynasty1qbValue: getAnchorValue(marketValues, 'dynasty'),
    redraftValue: getAnchorValue(marketValues, 'redraft'),
    newsItems: newsItems.length > 0 ? newsItems : undefined,
    recentTradesCount: Math.max(tradeCount, communityTradeCount),
    ...llmOutput,
    trend: classifyTrend(getAnchorTrend(marketValues)),
    tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
