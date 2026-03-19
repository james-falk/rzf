import { db } from '@rzf/db'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerCompareOutputSchema } from '@rzf/shared/types'
import type { PlayerCompareInput, PlayerCompareOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, getAnchorValue, getAnchorTrend, classifyTrend, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'

const agentContext = loadAgentContext(import.meta.url)

const DEFAULTS = {
  recencyWindowHours: 168,
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runPlayerCompareAgent(
  input: PlayerCompareInput,
  config?: AgentRuntimeConfig,
): Promise<PlayerCompareOutput> {
  const { userId, playerIds, focusNote } = input
  console.log(`[player-compare] Starting — userId=${userId} players=${playerIds.join(',')}`)

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
  const leagueStyle =
    (userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft'

  const tools = {
    player_data: async (): Promise<string> => {
      const [players, marketValuesMap, rankings, tradeVolumes] = await Promise.all([
        db.player.findMany({ where: { sleeperId: { in: playerIds } } }),
        getMultiMarketValues(playerIds),
        db.playerRanking.findMany({
          where: { playerId: { in: playerIds }, source: 'fantasypros' },
          orderBy: { fetchedAt: 'desc' },
          take: playerIds.length,
        }),
        db.playerTradeVolume.findMany({ where: { sleeperId: { in: playerIds } } }),
      ])

      const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
      const rankMap = new Map(rankings.map((r) => [r.playerId, r]))
      const volumeMap = new Map(tradeVolumes.map((v) => [v.sleeperId, v]))

      // Compute dynasty ranks
      const dynastyRankMap = new Map<
        string,
        { dynastyRank: number | null; dynastyPositionRank: number | null }
      >()
      await Promise.all(
        playerIds.map(async (pid) => {
          const p = playerMap.get(pid)
          const mvals = marketValuesMap.get(pid)
          const ktcValue = mvals?.ktc?.dynasty1qb ?? mvals?.fantasycalc?.dynasty1qb ?? null
          if (!p || !ktcValue) {
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
                where: {
                  source,
                  dynasty1qb: { gt: ktcValue },
                  player: { team: { not: null }, position: p.position ?? undefined },
                },
              }),
            ])
            dynastyRankMap.set(pid, {
              dynastyRank: overallHigher + 1,
              dynastyPositionRank: positionHigher + 1,
            })
          } catch {
            dynastyRankMap.set(pid, { dynastyRank: null, dynastyPositionRank: null })
          }
        }),
      )

      const lines = [`[Player Comparison — ${leagueStyle === 'dynasty' ? 'Dynasty' : 'Redraft'} League]`]

      playerIds.forEach((pid, i) => {
        const p = playerMap.get(pid)
        const r = rankMap.get(pid)
        const vol = volumeMap.get(pid)
        const ranks = dynastyRankMap.get(pid)
        const mvals = marketValuesMap.get(pid) ?? {
          ktc: null,
          fantasycalc: null,
          dynastyprocess: null,
          dynastysuperflex: null,
        }
        const name = p ? `${p.firstName} ${p.lastName}`.trim() : pid

        lines.push(`\nPLAYER ${i + 1}:`)
        lines.push(`  Player ID: ${pid}`)
        lines.push(`  Name: ${name} (${p?.position ?? '?'}, ${p?.team ?? 'FA'})`)
        lines.push(`  Age: ${p?.age ?? 'N/A'} | Experience: ${p?.yearsExp ?? 'N/A'} years`)
        lines.push(formatMarketValuesForPrompt(name, mvals, leagueStyle))
        lines.push(
          `  FP Overall: ${r?.rankOverall ?? 'unranked'} | FP Position: ${r?.rankPosition ?? 'unranked'} | Dynasty Rank: ${ranks?.dynastyRank ?? 'N/A'} | Dynasty Pos Rank: ${ranks?.dynastyPositionRank ?? 'N/A'}`,
        )
        const trend = getAnchorTrend(mvals)
        if (trend !== null) lines.push(`  30d Trend: ${trend > 0 ? `+${trend}` : String(trend)}`)
        if (p?.injuryStatus) lines.push(`  ⚠ Injury: ${p.injuryStatus}`)
        if (vol?.count1w != null)
          lines.push(`  Community trade vol (1w): ${vol.count1w} | (4w): ${vol.count4w ?? 'N/A'}`)
      })

      return lines.join('\n')
    },

    recent_news: async (): Promise<string> => {
      const injection = await injectContent(playerIds, {
        agentType: 'player_compare',
        recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
        maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
        allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
        allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
      })
      if (injection.items.length === 0) return 'No recent news.'
      return injection.items
        .slice(0, 6)
        .map((item) => `[${item.sourceName}] ${item.title}`)
        .join('\n')
    },

    trade_activity: async (): Promise<string> => {
      const players = await db.player.findMany({ where: { sleeperId: { in: playerIds } } })
      const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
      const lines: string[] = ['[Community Trade Activity]']

      await Promise.all(
        playerIds.map(async (pid) => {
          const p = playerMap.get(pid)
          if (!p) return
          try {
            const nameId = DynastyDaddyConnector.nameIdFromPlayer(
              p.firstName,
              p.lastName,
              p.position ?? '',
            )
            const ddData = await DynastyDaddyConnector.getPlayerTrades(nameId)
            const count = ddData.trades?.length ?? 0
            lines.push(`${p.firstName} ${p.lastName}: DD trade count=${count}`)
          } catch {
            lines.push(`${p.firstName} ${p.lastName}: DD data unavailable`)
          }
        }),
      )
      return lines.join('\n')
    },

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, config?.sessionId)
      return ctx || 'No prior session context.'
    },
  }

  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  if (focusNote?.trim()) extraParts.push(`USER FOCUS: ${focusNote.trim()}`)
  extraParts.push(
    'Compare these players and determine who is more valuable to own. Provide your own RosterMind determination.',
  )

  const outputSchema = PlayerCompareOutputSchema.omit({
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['player_data', 'recent_news'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext: extraParts.join('\n\n'),
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'sonnet',
    maxOutputTokens: 1500,
  })

  console.log(
    `[player-compare] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations} winner=${llmOutput.winnerName ?? 'even'}`,
  )

  // Enrich output players with computed market values
  const valuesMap = await getMultiMarketValues(playerIds)
  const enrichedPlayers = llmOutput.players.map((p) => {
    const mvals = valuesMap.get(p.playerId)
    if (!mvals) return p
    return {
      ...p,
      dynastyValue: p.dynastyValue ?? getAnchorValue(mvals, 'dynasty'),
      redraftValue: p.redraftValue ?? getAnchorValue(mvals, 'redraft'),
      trend: p.trend ?? classifyTrend(getAnchorTrend(mvals)),
    }
  })

  const injection = await injectContent(playerIds, {
    agentType: 'player_compare',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: 5,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  return {
    ...llmOutput,
    players: enrichedPlayers,
    tokensUsed: metadata.tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
