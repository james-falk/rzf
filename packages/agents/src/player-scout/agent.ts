import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { buildUserContext } from '@rzf/shared'
import { PlayerScoutOutputSchema } from '@rzf/shared/types'
import type { PlayerScoutInput, PlayerScoutOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, getAnchorValue, getAnchorTrend, classifyTrend, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { loadTierZeroPlayerRankings, formatTierZeroRankingsForPrompt } from '../tier0-rankings.js'
import { findRecentTradesForPlayers, formatRecentTradesForPrompt } from '../recent-trades-prompt.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'

// Load context once at module init — works in src/ (dev) and dist/ (prod after copy-assets)
const agentContext = loadAgentContext(import.meta.url)

// All tiers + all platforms: deep-dive scouting needs maximum coverage.
const DEFAULTS = {
  recencyWindowHours: 168,
  maxContentItems: 15,
  allowedTiers: [1, 2, 3],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runPlayerScoutAgent(
  input: PlayerScoutInput,
  config?: AgentRuntimeConfig,
): Promise<PlayerScoutOutput> {
  const { userId, playerId, context, focusNote } = input
  console.log(`[player-scout] Starting — userId=${userId} playerId=${playerId}`)

  // ── 1. Load user preferences (always needed, fetch upfront) ────────────────
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
    ((userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft') as
      | 'dynasty'
      | 'redraft'

  // ── 2. Get current NFL state (week/season used across multiple tools) ───────
  const nflState = await SleeperConnector.getNFLState()
  const { week, season } = nflState
  const seasonInt = parseInt(season, 10)

  // ── 3. Register data tools ──────────────────────────────────────────────────
  // Each tool is a named async function that returns a formatted string.
  // The loop engine calls initialTools first, then requests more based on LLM eval.

  const tools = {
    player_stats: async (): Promise<string> => {
      const player = await db.player.findUnique({ where: { sleeperId: playerId } })
      if (!player) return `Player not found: ${playerId}`
      const lines = [
        `Name: ${player.firstName} ${player.lastName}`,
        `Position: ${player.position ?? 'UNKNOWN'} | Team: ${player.team ?? 'Free Agent'}`,
        `Age: ${player.age ?? 'N/A'} | Experience: ${player.yearsExp ?? 'N/A'} years`,
        `Depth Chart: ${player.depthChartOrder ? `#${player.depthChartOrder}` : 'N/A'}`,
        `Injury: ${player.injuryStatus ?? 'Healthy'}${player.practiceParticipation ? ` (Practice: ${player.practiceParticipation})` : ''}`,
      ]
      return lines.join('\n')
    },

    trade_values: async (): Promise<string> => {
      const valuesMap = await getMultiMarketValues([playerId])
      const values = valuesMap.get(playerId) ?? {
        ktc: null,
        fantasycalc: null,
        dynastyprocess: null,
        dynastysuperflex: null,
        dynastydaddy: null,
      }
      const player = await db.player.findUnique({
        where: { sleeperId: playerId },
        select: { firstName: true, lastName: true },
      })
      const name = player ? `${player.firstName} ${player.lastName}` : playerId
      return formatMarketValuesForPrompt(name, values, leagueStyle)
    },

    rankings: async (): Promise<string> => {
      const rows = await loadTierZeroPlayerRankings([playerId], week, seasonInt)
      if (rows.length === 0) return 'Rankings: not available for current week'
      return formatTierZeroRankingsForPrompt(rows)
    },

    recent_news: async (): Promise<string> => {
      const injection = await injectContent([playerId], {
        agentType: 'player_scout',
        recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
        maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
        allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
        allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
      })
      if (injection.items.length === 0) return 'No recent news available.'
      return injection.items
        .slice(0, 8)
        .map((item) => `[${item.sourceName}] ${item.title}`)
        .join('\n')
    },

    trade_activity: async (): Promise<string> => {
      const player = await db.player.findUnique({
        where: { sleeperId: playerId },
        select: { firstName: true, lastName: true, position: true },
      })

      const parts: string[] = []

      // Raw league trade count
      try {
        const rawCount = await db.$queryRaw<Array<{ count: bigint }>>`
          SELECT COUNT(*)::bigint as count
          FROM trade_transactions
          WHERE adds::jsonb ? ${playerId} OR drops::jsonb ? ${playerId}
        `
        parts.push(`Recent league trades: ${Number(rawCount[0]?.count ?? 0)}`)
      } catch {
        parts.push('Recent league trades: N/A')
      }

      try {
        const recent = await findRecentTradesForPlayers([playerId], 8)
        if (recent.length > 0) parts.push(formatRecentTradesForPrompt(recent, 6))
      } catch {
        /* non-critical */
      }

      // DynastyDaddy community trades
      if (player) {
        try {
          const nameId = DynastyDaddyConnector.nameIdFromPlayer(
            player.firstName,
            player.lastName,
            player.position ?? '',
          )
          const ddTrades = await DynastyDaddyConnector.getPlayerTrades(nameId)
          const communityCount = ddTrades?.trades?.length ?? 0
          const weeklyVol =
            ddTrades?.tradeVolume?.find(
              (v: { week_interval: number; count: number }) => v.week_interval === 1,
            )?.count ?? 0
          parts.push(`Community trade vol (1w): ${weeklyVol} | DD trade count: ${communityCount}`)
        } catch {
          parts.push('Community trade data: unavailable')
        }
      }

      return parts.join('\n')
    },

    prop_lines: async (): Promise<string> => {
      const lines = await db.playerPropLine.findMany({
        where: { sleeperId: playerId },
        orderBy: { fetchedAt: 'desc' },
      })
      if (lines.length === 0) return 'No prop lines available for this player.'
      const formatted = lines.map((l) => {
        const parts = [`${l.market}`]
        if (l.line != null) parts.push(`O/U ${l.line}`)
        if (l.overOdds != null) parts.push(`Over ${l.overOdds > 0 ? '+' : ''}${l.overOdds}`)
        if (l.underOdds != null) parts.push(`Under ${l.underOdds > 0 ? '+' : ''}${l.underOdds}`)
        parts.push(`[${l.bookmaker}]`)
        return parts.join(' ')
      })
      return `Prop Lines:\n${formatted.join('\n')}`
    },

    session_history: async (): Promise<string> => {
      const sessionCtx = await buildSessionContext(userId, config?.sessionId)
      return sessionCtx || 'No prior session context.'
    },

    user_preferences: async (): Promise<string> => {
      return userContext || 'No user preferences set.'
    },
  }

  // ── 4. Build extra context (focusNote + any passed-in context) ──────────────
  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  if (context) extraParts.push(`[User Question/Context]\n${context}`)
  if (focusNote?.trim()) extraParts.push(`[User Focus]\n${focusNote.trim()}`)
  const extraContext = extraParts.length > 0 ? extraParts.join('\n\n') : undefined

  // ── 5. Run the agentic loop ─────────────────────────────────────────────────
  const outputSchema = PlayerScoutOutputSchema.omit({
    playerId: true,
    playerName: true,
    position: true,
    team: true,
    injuryStatus: true,
    rankOverall: true,
    rankPosition: true,
    dynasty1qbValue: true,
    redraftValue: true,
    recentTradesCount: true,
    dynastyRank: true,
    dynastyPositionRank: true,
    newsItems: true,
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['player_stats', 'trade_values', 'rankings', 'recent_news'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext,
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku',
    maxOutputTokens: 2500,
    maxIterations: 4,
  })

  console.log(
    `[player-scout] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations} confidence=${metadata.finalConfidence} tools=${metadata.toolsUsed.join(',')}`,
  )

  // ── 6. Enrich with computed fields not produced by the LLM ─────────────────
  const [player, ranking, valuesMap] = await Promise.all([
    db.player.findUnique({ where: { sleeperId: playerId } }),
    db.playerRanking.findFirst({
      where: { playerId, source: 'fantasypros', week, season: seasonInt },
    }),
    getMultiMarketValues([playerId]),
  ])

  const marketValues = valuesMap.get(playerId) ?? {
    ktc: null,
    fantasycalc: null,
    dynastyprocess: null,
    dynastysuperflex: null,
    dynastydaddy: null,
  }

  // Dynasty positional rank
  let dynastyRank: number | null = null
  let dynastyPositionRank: number | null = null
  const ktcDynastyValue =
    marketValues.ktc?.dynasty1qb ?? marketValues.fantasycalc?.dynasty1qb ?? null
  if (ktcDynastyValue != null && player?.position) {
    try {
      const [overallHigher, positionHigher] = await Promise.all([
        db.playerTradeValue
          .count({
            where: {
              source: 'ktc',
              dynasty1qb: { gt: ktcDynastyValue },
              player: { team: { not: null } },
            },
          })
          .catch(() =>
            db.playerTradeValue.count({
              where: {
                source: 'fantasycalc',
                dynasty1qb: { gt: ktcDynastyValue },
                player: { team: { not: null } },
              },
            }),
          ),
        db.playerTradeValue
          .count({
            where: {
              source: 'ktc',
              dynasty1qb: { gt: ktcDynastyValue },
              player: { team: { not: null }, position: player.position },
            },
          })
          .catch(() =>
            db.playerTradeValue.count({
              where: {
                source: 'fantasycalc',
                dynasty1qb: { gt: ktcDynastyValue },
                player: { team: { not: null }, position: player.position },
              },
            }),
          ),
      ])
      dynastyRank = overallHigher + 1
      dynastyPositionRank = positionHigher + 1
    } catch {
      // non-critical
    }
  }

  // Build news items for UI display
  const injection = await injectContent([playerId], {
    agentType: 'player_scout',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: 5,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })
  const newsItems = injection.items.slice(0, 5).map((item) => ({
    title: item.title,
    url: item.sourceUrl ?? null,
    sourceName: item.sourceName,
    publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : null,
  }))

  return {
    playerId,
    playerName: player ? `${player.firstName} ${player.lastName}`.trim() : playerId,
    position: player?.position ?? '',
    team: player?.team ?? null,
    injuryStatus: player?.injuryStatus ?? null,
    rankOverall: ranking?.rankOverall ?? null,
    rankPosition: ranking?.rankPosition ?? null,
    dynastyRank,
    dynastyPositionRank,
    dynasty1qbValue: getAnchorValue(marketValues, 'dynasty'),
    redraftValue: getAnchorValue(marketValues, 'redraft'),
    newsItems: newsItems.length > 0 ? newsItems : undefined,
    recentTradesCount: 0,
    ...llmOutput,
    trend: classifyTrend(getAnchorTrend(marketValues)),
    tokensUsed: metadata.tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
