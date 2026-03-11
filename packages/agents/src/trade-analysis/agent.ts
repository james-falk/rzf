import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { TradeAnalysisOutputSchema } from '@rzf/shared/types'
import type { TradeAnalysisInput, TradeAnalysisOutput } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'

export async function runTradeAnalysisAgent(input: TradeAnalysisInput): Promise<TradeAnalysisOutput> {
  const { userId, leagueId, giving, receiving } = input
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

  const allPlayerIds = [...giving, ...receiving]

  // ── 2. Fetch all player data in parallel ───────────────────────────────────
  const [players, tradeValues, rankings, recentMentions] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
    db.playerTradeValue.findMany({ where: { sleeperId: { in: allPlayerIds }, source: 'fantasycalc' } }),
    db.playerRanking.findMany({
      where: { playerId: { in: allPlayerIds }, source: 'fantasypros' },
      orderBy: { fetchedAt: 'desc' },
      take: allPlayerIds.length,
    }),
    db.contentPlayerMention.findMany({
      where: { playerId: { in: allPlayerIds } },
      include: { content: { select: { title: true, fetchedAt: true } } },
      orderBy: { content: { fetchedAt: 'desc' } },
      take: 50,
    }),
  ])

  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
  const valueMap = new Map(tradeValues.map((v) => [v.sleeperId, v]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))

  const newsMap = new Map<string, string[]>()
  for (const mention of recentMentions) {
    const existing = newsMap.get(mention.playerId) ?? []
    if (existing.length < 3) existing.push(mention.content.title)
    newsMap.set(mention.playerId, existing)
  }

  // ── 3. Count recent trades for each player across all leagues ─────────────
  const tradeCounts = new Map<string, number>()
  for (const playerId of allPlayerIds) {
    // Count how many TradeTransaction records contain this player in adds or drops
    // Using raw query since we need to search inside JSON
    const count = await db.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM trade_transactions
      WHERE league_id = ${leagueId}
        AND (adds::jsonb ? ${playerId} OR drops::jsonb ? ${playerId})
    `
    tradeCounts.set(playerId, Number(count[0]?.count ?? 0))
  }

  // ── 4. Build enriched player context ──────────────────────────────────────
  const enrichPlayer = (id: string) => {
    const p = playerMap.get(id)
    const v = valueMap.get(id)
    const r = rankMap.get(id)
    return {
      playerId: id,
      name: p ? `${p.firstName} ${p.lastName}`.trim() : id,
      position: p?.position ?? 'UNKNOWN',
      team: p?.team ?? null,
      dynasty1qbValue: v?.dynasty1qb ?? null,
      redraftValue: v?.redraft ?? null,
      rankOverall: r?.rankOverall ?? null,
      injuryStatus: p?.injuryStatus ?? null,
      recentNews: newsMap.get(id) ?? [],
      recentTradeCount: tradeCounts.get(id) ?? 0,
    }
  }

  const givingContext = giving.map(enrichPlayer)
  const receivingContext = receiving.map(enrichPlayer)

  // ── 5. LLM call ────────────────────────────────────────────────────────────
  console.log(`[trade-analysis] Calling LLM`)
  const systemPrompt = buildSystemPrompt(userContext)
  const userPrompt = buildUserPrompt(givingContext, receivingContext)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: 'sonnet' },
    (raw) => TradeAnalysisOutputSchema.omit({ tokensUsed: true }).parse(raw),
  )

  console.log(`[trade-analysis] Complete — tokens=${tokensUsed} verdict=${llmOutput.verdict}`)

  return { ...llmOutput, tokensUsed }
}
