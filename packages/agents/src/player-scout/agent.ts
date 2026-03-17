import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerScoutOutputSchema } from '@rzf/shared/types'
import type { PlayerScoutInput, PlayerScoutOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'

const DEFAULTS = {
  recencyWindowHours: 168, // 7 days
  maxContentItems: 10,
  allowedTiers: [1, 2, 3],
  // Scout explicitly includes youtube for deep-dive analysis
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

  const [player, tradeValue, ranking, recentTradeCount, ddTrades, injection] = await Promise.all([
    db.player.findUnique({ where: { sleeperId: playerId } }),
    db.playerTradeValue.findFirst({ where: { sleeperId: playerId, source: 'fantasycalc' } }),
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
  ])

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

  const communityTradeCount = ddTrades?.trades?.length ?? 0
  const weeklyTradeVolume =
    ddTrades?.tradeVolume?.find((v: { week_interval: number; count: number }) => v.week_interval === 1)?.count ?? 0

  // ── 3. Determine trend ─────────────────────────────────────────────────────
  const determineTrend = (): 'rising' | 'falling' | 'stable' | 'unknown' => {
    if (!tradeValue?.trend30d) return 'unknown'
    if (tradeValue.trend30d > 50) return 'rising'
    if (tradeValue.trend30d < -50) return 'falling'
    return 'stable'
  }

  const playerContext = {
    name: `${player.firstName} ${player.lastName}`.trim(),
    position: player.position,
    team: player.team,
    injuryStatus: player.injuryStatus,
    practiceParticipation: player.practiceParticipation,
    depthChartOrder: player.depthChartOrder,
    age: player.age,
    yearsExp: player.yearsExp,
    dynasty1qbValue: tradeValue?.dynasty1qb ?? null,
    dynastySfValue: tradeValue?.dynastySf ?? null,
    redraftValue: tradeValue?.redraft ?? null,
    trend30d: tradeValue?.trend30d ?? null,
    rankOverall: ranking?.rankOverall ?? null,
    rankPosition: ranking?.rankPosition ?? null,
    recentNews,
    recentTrades: tradeCount,
    communityTradeCount,
    weeklyTradeVolume,
    context,
  }

  // ── 4. LLM call ────────────────────────────────────────────────────────────
  console.log(`[player-scout] Calling LLM — ${player.firstName} ${player.lastName} news=${injection.items.length} confidence=${injection.confidenceScore}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(playerContext, focusNote)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => PlayerScoutOutputSchema.omit({
      playerId: true, playerName: true, position: true, team: true,
      injuryStatus: true, rankOverall: true, rankPosition: true,
      dynasty1qbValue: true, redraftValue: true, recentTradesCount: true,
      tokensUsed: true, confidenceScore: true, sourcesUsed: true,
    }).parse(raw),
  )

  console.log(`[player-scout] Complete — tokens=${tokensUsed} trend=${determineTrend()}`)

  return {
    playerId,
    playerName: playerContext.name,
    position: player.position,
    team: player.team,
    injuryStatus: player.injuryStatus,
    rankOverall: ranking?.rankOverall ?? null,
    rankPosition: ranking?.rankPosition ?? null,
    dynasty1qbValue: tradeValue?.dynasty1qb ?? null,
    redraftValue: tradeValue?.redraft ?? null,
    recentTradesCount: Math.max(tradeCount, communityTradeCount),
    ...llmOutput,
    tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
