import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { buildUserContext } from '@rzf/shared'
import { WaiverOutputSchema } from '@rzf/shared/types'
import type { WaiverInput, WaiverOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'
import { formatCompactTierZeroForPlayer, loadTierZeroPlayerRankings } from '../tier0-rankings.js'

const agentContext = loadAgentContext(import.meta.url)

const DEFAULTS = {
  recencyWindowHours: 72,
  maxContentItems: 12,
  allowedTiers: [1, 2],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runWaiverAgent(
  input: WaiverInput,
  config?: AgentRuntimeConfig,
): Promise<WaiverOutput> {
  const { userId, leagueId, targetPosition, focusNote } = input
  console.log(
    `[waiver] Starting — userId=${userId} leagueId=${leagueId} targetPosition=${targetPosition ?? 'any'}`,
  )

  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) throw new Error('No Sleeper account connected.')

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

  const [userRoster, nflState] = await Promise.all([
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getNFLState(),
  ])
  if (!userRoster) throw new Error(`No roster found for user in league ${leagueId}`)

  const rosterPlayerIds = (userRoster.players ?? []).filter(
    (id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/),
  )
  const starterIds = new Set(userRoster.starters ?? [])
  const rosterSet = new Set(rosterPlayerIds)
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const trending = await db.trendingPlayer.findMany({
    where: { type: 'add' },
    orderBy: { fetchedAt: 'desc' },
    take: 50,
    include: { player: true },
  })
  const candidates = trending.filter(
    (t) =>
      !rosterSet.has(t.player.sleeperId) &&
      (!targetPosition || t.player.position === targetPosition),
  )
  const candidateIds = candidates.map((c) => c.player.sleeperId)

  const tools = {
    roster: async (): Promise<string> => {
      const rosterPlayers = await db.player.findMany({
        where: { sleeperId: { in: rosterPlayerIds } },
        select: {
          sleeperId: true,
          firstName: true,
          lastName: true,
          position: true,
          injuryStatus: true,
        },
      })

      const lines = ['[Current Roster]']
      const byPos: Record<string, string[]> = {}
      for (const p of rosterPlayers) {
        const pos = p.position ?? 'UNKNOWN'
        if (!byPos[pos]) byPos[pos] = []
        const injury = p.injuryStatus ? ` (${p.injuryStatus})` : ''
        const stTag = starterIds.has(p.sleeperId) ? '' : ' [Bench]'
        byPos[pos]!.push(`${p.firstName} ${p.lastName}${injury}${stTag}`)
      }
      for (const [pos, names] of Object.entries(byPos)) {
        lines.push(`${pos}: ${names.join(', ')}`)
      }
      return lines.join('\n')
    },

    waiver_candidates: async (): Promise<string> => {
      const topCandidates = candidates.slice(0, 25)
      const topSleeperIds = topCandidates.map((c) => c.player.sleeperId)
      const [injection, marketValues, tradeVolumes, tierRows] = await Promise.all([
        injectContent(candidateIds, {
          agentType: 'waiver',
          recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
          maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
          allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
          allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
        }),
        getMultiMarketValues(candidateIds),
        db.playerTradeVolume.findMany({ where: { sleeperId: { in: candidateIds } } }),
        loadTierZeroPlayerRankings(topSleeperIds, week, season),
      ])

      const newsMap = new Map<string, string>()
      for (const item of injection.items) {
        if (!newsMap.has(item.playerId)) {
          newsMap.set(item.playerId, `[${item.sourceName}] ${item.title}`)
        }
      }
      const volumeMap = new Map(tradeVolumes.map((v) => [v.sleeperId, v]))
      const tierBySleeper = new Map<string, typeof tierRows>()
      for (const r of tierRows) {
        const list = tierBySleeper.get(r.playerId) ?? []
        list.push(r)
        tierBySleeper.set(r.playerId, list)
      }

      const lines = [`[Available Free Agents — Week ${week} Trending]`]
      if (targetPosition) lines.push(`Target position: ${targetPosition}`)

      topCandidates.forEach((c) => {
        const id = c.player.sleeperId
        const vol = volumeMap.get(id)
        const vals = marketValues.get(id)
        const news = newsMap.get(id) ?? ''
        const injury = c.player.injuryStatus ? ` | Status: ${c.player.injuryStatus}` : ''
        const trend = c.count > 0 ? ` | Sleeper adds: ${c.count}` : ''
        const volStr = vol?.count1w != null ? ` | DD vol 1w: ${vol.count1w}` : ''
        const t0 = formatCompactTierZeroForPlayer(tierBySleeper.get(id) ?? [])
        const t0Str = t0 ? ` | Tier-0: ${t0}` : ''
        lines.push(
          `${c.player.firstName} ${c.player.lastName} (${c.player.position}, ${c.player.team ?? 'FA'}) — Rank: ${c.player.searchRank ?? 'unranked'}${trend}${volStr}${t0Str}${injury}`,
        )
        if (news) lines.push(`  ${news}`)
        if (vals)
          lines.push(
            formatMarketValuesForPrompt(
              `${c.player.firstName} ${c.player.lastName}`,
              vals,
              leagueStyle,
            ),
          )
      })
      return lines.join('\n')
    },

    league_claims: async (): Promise<string> => {
      try {
        const transactions = await SleeperConnector.getTransactions(leagueId, week)
        const claims = transactions
          .filter(
            (t: { type?: string }) => t.type === 'waiver' || t.type === 'free_agent',
          )
          .flatMap((t: { adds?: Record<string, unknown> | null }) => Object.keys(t.adds ?? {}))
          .slice(0, 10)
        if (claims.length === 0) return 'No recent league claims.'
        return `[Recent League Claims — what opponents are targeting]\n${claims.join(', ')}`
      } catch {
        return 'League claim data unavailable.'
      }
    },

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, config?.sessionId)
      return ctx || 'No prior session context.'
    },
  }

  const rosterPlayers = await db.player.findMany({
    where: { sleeperId: { in: rosterPlayerIds } },
    select: { team: true },
  })
  const rosterTeams = [...new Set(rosterPlayers.filter((p) => p.team).map((p) => p.team!))]

  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  if (rosterTeams.length > 0)
    extraParts.push(
      `Roster teams: ${rosterTeams.join(', ')} — check for bye weeks in Week ${week}`,
    )
  if (focusNote?.trim()) extraParts.push(`USER FOCUS: ${focusNote.trim()}`)
  extraParts.push(
    'Analyze the roster situation first (byes, injuries, gaps), then recommend the best waiver wire pickups.',
  )

  const outputSchema = WaiverOutputSchema.omit({
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['roster', 'waiver_candidates'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext: extraParts.join('\n\n'),
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku',
    maxOutputTokens: 2500,
    maxIterations: 4,
  })

  console.log(
    `[waiver] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations} recommendations=${llmOutput.recommendations.length}`,
  )

  const injection = await injectContent(candidateIds, {
    agentType: 'waiver',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: 5,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  return {
    ...llmOutput,
    tokensUsed: metadata.tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
