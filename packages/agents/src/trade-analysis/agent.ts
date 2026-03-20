import { db } from '@rzf/db'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { buildUserContext } from '@rzf/shared'
import { TradeAnalysisOutputSchema } from '@rzf/shared/types'
import type { TradeAnalysisInput, TradeAnalysisOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { isDraftPick, parseDraftPickId, formatDraftPickForPrompt } from '../draft-picks.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'

const agentContext = loadAgentContext(import.meta.url)

const DEFAULTS = {
  recencyWindowHours: 168,
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runTradeAnalysisAgent(
  input: TradeAnalysisInput,
  config?: AgentRuntimeConfig,
): Promise<TradeAnalysisOutput> {
  const { userId, leagueId, giving, receiving, focusNote } = input
  console.log(
    `[trade-analysis] Starting — userId=${userId} giving=${giving.join(',')} receiving=${receiving.join(',')}`,
  )

  const allIds = [...giving, ...receiving]
  const allPlayerIds = allIds.filter((id) => !isDraftPick(id))
  const givingPicks = giving.filter(isDraftPick).map(parseDraftPickId).filter(Boolean)
  const receivingPicks = receiving.filter(isDraftPick).map(parseDraftPickId).filter(Boolean)

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

  // ── Tool registry ──────────────────────────────────────────────────────────

  const tools = {
    trade_values: async (): Promise<string> => {
      const [players, marketValues, rankings] = await Promise.all([
        db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
        getMultiMarketValues(allPlayerIds),
        db.playerRanking.findMany({
          where: { playerId: { in: allPlayerIds }, source: 'fantasypros' },
          orderBy: { fetchedAt: 'desc' },
          take: allPlayerIds.length,
        }),
      ])

      const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
      const rankMap = new Map(rankings.map((r) => [r.playerId, r]))

      const formatSide = (ids: string[], label: string): string => {
        const lines = [`${label}:`]
        for (const id of ids) {
          if (isDraftPick(id)) {
            const pick = parseDraftPickId(id)
            if (pick) lines.push(`  ${formatDraftPickForPrompt(pick)}`)
            continue
          }
          const p = playerMap.get(id)
          const r = rankMap.get(id)
          const vals = marketValues.get(id)
          lines.push(
            `  ${p ? `${p.firstName} ${p.lastName}` : id} (${p?.position ?? '?'}, ${p?.team ?? 'FA'})`,
          )
          if (p?.injuryStatus) lines.push(`    Injury: ${p.injuryStatus}`)
          if (r?.rankOverall) lines.push(`    FP Rank: ${r.rankOverall}`)
          if (vals) lines.push(formatMarketValuesForPrompt(p ? `${p.firstName} ${p.lastName}` : id, vals, leagueStyle))
        }
        return lines.join('\n')
      }

      return [
        `[Trade Proposal — ${leagueStyle === 'dynasty' ? 'Dynasty' : 'Redraft'} League]`,
        formatSide(giving, 'GIVING (trading away)'),
        formatSide(receiving, 'RECEIVING (getting back)'),
      ].join('\n\n')
    },

    trade_activity: async (): Promise<string> => {
      const players = await db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } })
      const playerMap = new Map(players.map((p) => [p.sleeperId, p]))

      const rawTradeExamples: Array<{ sideA: string[]; sideB: string[]; transaction_date: string }> = []
      const volumeLines: string[] = []

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
            const weeklyVol =
              ddData.tradeVolume?.find(
                (v: { week_interval: number; count: number }) => v.week_interval === 1,
              )?.count ?? 0
            volumeLines.push(
              `${player.firstName} ${player.lastName}: DD trade vol 1w=${weeklyVol}`,
            )
            if (ddData.trades?.length) rawTradeExamples.push(...ddData.trades.slice(0, 3))
          } catch {
            volumeLines.push(
              `${player.firstName} ${player.lastName}: community data unavailable`,
            )
          }
        }),
      )

      return ['[Community Trade Activity]', ...volumeLines].join('\n')
    },

    league_standings: async (): Promise<string> => {
      if (!leagueId) return 'No league selected.'
      try {
        const rosters = await SleeperConnector.getRosters(leagueId)
        const standings = rosters
          .filter((r) => r.settings)
          .map((r) => ({
            teamName: `Roster ${r.roster_id}`,
            wins: r.settings?.wins ?? 0,
            losses: r.settings?.losses ?? 0,
          }))
          .sort((a, b) => b.wins - a.wins)
          .slice(0, 8)
        return (
          '[League Standings]\n' +
          standings.map((s) => `  ${s.teamName}: ${s.wins}W-${s.losses}L`).join('\n')
        )
      } catch {
        return 'League standings unavailable.'
      }
    },

    recent_news: async (): Promise<string> => {
      const injection = await injectContent(allPlayerIds, {
        agentType: 'trade_analysis',
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

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, config?.sessionId)
      return ctx || 'No prior session context.'
    },

    lookup_player: async (): Promise<string> => {
      // Extracts candidate player names from the focusNote for mid-trade lookups
      // e.g. "what if I also give Justin Jefferson" → finds Jefferson's data
      if (!focusNote?.trim()) return 'No player name in focus note to look up.'
      const words = focusNote.trim().replace(/[^\w\s'-]/g, ' ').split(/\s+/).filter((w) => w.length >= 2)
      const candidates = new Set<string>()
      for (let i = 0; i < words.length; i++) {
        const w0 = words[i]
        const w1 = words[i + 1]
        if (!w0) continue
        candidates.add(w0)
        if (w1) candidates.add(`${w0} ${w1}`)
      }
      const STOP = new Set(['the','what','if','also','give','get','add','instead','swap','trade','for','and','or','my','we','i'])
      const searchTerms = Array.from(candidates).filter((c) => !STOP.has(c.toLowerCase())).slice(0, 4)
      if (searchTerms.length === 0) return 'Could not extract a player name from focus note.'
      const players = await db.player.findMany({
        where: {
          OR: searchTerms.flatMap((term) => [
            { lastName: { contains: term, mode: 'insensitive' } },
            { firstName: { contains: term, mode: 'insensitive' } },
          ]),
          position: { in: ['QB', 'RB', 'WR', 'TE', 'K'] },
          team: { not: null },
        },
        take: 3,
      })
      if (players.length === 0) return `No player found matching "${searchTerms.join(', ')}".`
      const results: string[] = []
      for (const p of players) {
        const valuesMap = await getMultiMarketValues([p.sleeperId])
        const vals = valuesMap.get(p.sleeperId)
        const lines = [
          `${p.firstName} ${p.lastName} (${p.position ?? '?'}, ${p.team ?? 'FA'}) ID: ${p.sleeperId}`,
          `Status: ${p.injuryStatus ?? 'Healthy'}`,
        ]
        if (vals) lines.push(formatMarketValuesForPrompt(`${p.firstName} ${p.lastName}`, vals, leagueStyle))
        results.push(lines.join('\n'))
      }
      return results.join('\n\n')
    },
  }

  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  if (focusNote?.trim()) extraParts.push(`USER FOCUS: ${focusNote.trim()}`)

  const outputSchema = TradeAnalysisOutputSchema.omit({
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
    recentTrades: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['trade_values', 'recent_news'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext: extraParts.length > 0 ? extraParts.join('\n\n') : undefined,
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'sonnet',
    maxOutputTokens: 3500,
    maxIterations: 5,
  })

  console.log(
    `[trade-analysis] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations} verdict=${llmOutput.verdict}`,
  )

  const injection = await injectContent(allPlayerIds, {
    agentType: 'trade_analysis',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: 5,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  return {
    ...llmOutput,
    recentTrades: undefined,
    tokensUsed: metadata.tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
