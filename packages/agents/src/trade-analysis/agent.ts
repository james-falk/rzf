import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { TradeAnalysisOutputSchema } from '@rzf/shared/types'
import type { TradeAnalysisInput, TradeAnalysisOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'

const DEFAULTS = {
  recencyWindowHours: 168, // 7 days
  maxContentItems: 10,
  allowedTiers: [1, 2, 3],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runTradeAnalysisAgent(input: TradeAnalysisInput, config?: AgentRuntimeConfig): Promise<TradeAnalysisOutput> {
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

  // ── 2. Fetch all player data + content in parallel ─────────────────────────
  const [players, tradeValues, rankings, injection] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
    db.playerTradeValue.findMany({ where: { sleeperId: { in: allPlayerIds }, source: 'fantasycalc' } }),
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
  ])

  const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
  const valueMap = new Map(tradeValues.map((v) => [v.sleeperId, v]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))

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
      } catch {
        communityTradeData.set(playerId, { recentCount: 0, weeklyVolume: 0 })
      }
    }),
  )

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
      recentTradeCount: communityTradeData.get(id)?.recentCount ?? 0,
      weeklyTradeVolume: communityTradeData.get(id)?.weeklyVolume ?? 0,
    }
  }

  const givingContext = giving.map(enrichPlayer)
  const receivingContext = receiving.map(enrichPlayer)

  // ── 5. LLM call ────────────────────────────────────────────────────────────
  console.log(`[trade-analysis] Calling LLM — news=${injection.items.length} confidence=${injection.confidenceScore}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(givingContext, receivingContext)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'sonnet' },
    (raw) => TradeAnalysisOutputSchema.omit({ tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw),
  )

  console.log(`[trade-analysis] Complete — tokens=${tokensUsed} verdict=${llmOutput.verdict}`)

  return { ...llmOutput, tokensUsed, confidenceScore: injection.confidenceScore, sourcesUsed: injection.sourcesUsed }
}
