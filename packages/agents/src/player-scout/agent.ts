import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerScoutOutputSchema } from '@rzf/shared/types'
import type { PlayerScoutInput, PlayerScoutOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'

export async function runPlayerScoutAgent(input: PlayerScoutInput, config?: AgentRuntimeConfig): Promise<PlayerScoutOutput> {
  const { userId, playerId, context } = input
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

  const [player, tradeValue, ranking, recentMentions, recentTradeCount, ddTrades] = await Promise.all([
    db.player.findUnique({ where: { sleeperId: playerId } }),
    db.playerTradeValue.findFirst({ where: { sleeperId: playerId, source: 'fantasycalc' } }),
    db.playerRanking.findFirst({
      where: { playerId, source: 'fantasypros', week, season },
    }),
    db.contentPlayerMention.findMany({
      where: { playerId },
      include: { content: { select: { title: true, fetchedAt: true, sourceUrl: true } } },
      orderBy: { content: { fetchedAt: 'desc' } },
      take: 10,
    }),
    db.tradeTransaction.count({
      where: {
        OR: [
          { adds: { path: [playerId], not: undefined } as never },
        ],
      },
    }).catch(() => 0), // Graceful fallback if JSON query fails
    // Community trade data from Dynasty Daddy (query-time, graceful fallback)
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

  const recentNews = recentMentions.map((m: { content: { title: string } }) => m.content.title).slice(0, 8)

  // Community trade volume from Dynasty Daddy (last 7 days)
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
  console.log(`[player-scout] Calling LLM — ${player.firstName} ${player.lastName}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(playerContext)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => PlayerScoutOutputSchema.omit({
      playerId: true, playerName: true, position: true, team: true,
      injuryStatus: true, rankOverall: true, rankPosition: true,
      dynasty1qbValue: true, redraftValue: true, recentTradesCount: true, tokensUsed: true,
    }).parse(raw),
  )

  console.log(`[player-scout] Complete — tokens=${tokensUsed} trend=${llmOutput.trend}`)

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
  }
}
