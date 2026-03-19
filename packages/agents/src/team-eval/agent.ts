import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { buildUserContext } from '@rzf/shared'
import { TeamEvalOutputSchema } from '@rzf/shared/types'
import type { TeamEvalInput, TeamEvalOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent, formatContentByPlayer } from '../content-injector.js'
import { getMultiMarketValues, formatMarketValuesForPrompt } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'

const agentContext = loadAgentContext(import.meta.url)

const DEFAULTS = {
  recencyWindowHours: 168,
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runTeamEvalAgent(
  input: TeamEvalInput,
  config?: AgentRuntimeConfig,
): Promise<TeamEvalOutput> {
  const { userId, leagueId, focusNote } = input
  console.log(
    `[team-eval] Starting — userId=${userId} leagueId=${leagueId} focusNote=${focusNote ?? 'none'}`,
  )

  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected. Visit /account/sleeper to link your account.')
  }

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

  // Fetch base data needed by all tools
  const [league, userRoster, nflState] = await Promise.all([
    SleeperConnector.getLeague(leagueId),
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getNFLState(),
  ])
  if (!userRoster) throw new Error(`No roster found for user in league ${leagueId}`)

  const starterIds = new Set(userRoster.starters ?? [])
  const allPlayerIds = (userRoster.players ?? []).filter(
    (id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/),
  )
  const currentWeek = nflState.week
  const currentSeason = parseInt(nflState.season, 10)

  const tools = {
    roster: async (): Promise<string> => {
      const [playerRecords, rankings] = await Promise.all([
        db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
        db.playerRanking.findMany({
          where: {
            playerId: { in: allPlayerIds },
            source: 'fantasypros',
            week: currentWeek,
            season: currentSeason,
          },
        }),
      ])

      const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))
      const rankMap = new Map(rankings.map((r) => [r.playerId, r]))

      const scoringType =
        league.scoring_settings['rec'] === 1
          ? 'PPR'
          : league.scoring_settings['rec'] === 0.5
            ? 'Half-PPR'
            : 'Standard'
      const leagueTypeNum = Number(league.settings['type'] ?? 0)
      const leagueType =
        leagueTypeNum === 2 ? 'Dynasty' : leagueTypeNum === 1 ? 'Keeper' : 'Redraft'

      const formatPlayer = (id: string): string => {
        const p = playerMap.get(id)
        const r = rankMap.get(id)
        const name = p ? `${p.firstName} ${p.lastName}`.trim() : id
        const parts = [`${name} (${p?.position ?? '?'}, ${p?.team ?? 'FA'})`]
        if (p?.injuryStatus) parts.push(`⚠ ${p.injuryStatus}`)
        if (r?.rankPosition) parts.push(`FP: ${p?.position}${r.rankPosition}`)
        return parts.join(' | ')
      }

      const starters = allPlayerIds.filter((id) => starterIds.has(id))
      const bench = allPlayerIds.filter((id) => !starterIds.has(id))

      return [
        `League: ${league.name} | ${leagueType} | ${scoringType} | Slots: ${league.roster_positions.join(', ')}`,
        `\nSTARTERS:\n${starters.map(formatPlayer).join('\n')}`,
        bench.length > 0 ? `\nBENCH:\n${bench.map(formatPlayer).join('\n')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    },

    market_values: async (): Promise<string> => {
      const starterPlayerIds = allPlayerIds.filter((id) => starterIds.has(id))
      const playerRecords = await db.player.findMany({
        where: { sleeperId: { in: starterPlayerIds } },
      })
      const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))
      const marketValues = await getMultiMarketValues(starterPlayerIds)

      const lines = ['[Trade Values — Starters]']
      for (const id of starterPlayerIds) {
        const p = playerMap.get(id)
        const vals = marketValues.get(id)
        if (!p || !vals) continue
        const name = `${p.firstName} ${p.lastName}`.trim()
        lines.push(formatMarketValuesForPrompt(name, vals, leagueStyle))
      }
      return lines.join('\n')
    },

    recent_news: async (): Promise<string> => {
      const starterPlayerIds = allPlayerIds.filter((id) => starterIds.has(id))
      const injection = await injectContent(starterPlayerIds, {
        agentType: 'team_eval',
        recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
        maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
        allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
        allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
      })

      const playerRecords = await db.player.findMany({
        where: { sleeperId: { in: starterPlayerIds } },
        select: { sleeperId: true, firstName: true, lastName: true },
      })
      const playerNameMap = new Map(
        playerRecords.map((p) => [p.sleeperId, `${p.firstName} ${p.lastName}`.trim()]),
      )
      return formatContentByPlayer(injection.items, playerNameMap) || 'No recent news.'
    },

    waiver_trending: async (): Promise<string> => {
      const trending = await db.trendingPlayer.findMany({
        where: { type: 'add' },
        orderBy: { fetchedAt: 'desc' },
        take: 10,
        include: { player: true },
      })
      if (trending.length === 0) return 'No trending waiver adds.'
      return (
        'Hot waiver adds this week: ' +
        trending.map((t) => `${t.player.firstName} ${t.player.lastName}`.trim()).join(', ')
      )
    },

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, config?.sessionId)
      return ctx || 'No prior session context.'
    },
  }

  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  const gradingNote =
    leagueStyle === 'dynasty'
      ? 'GRADING CONTEXT: Dynasty league — weight long-term value and youth over short-term production.'
      : 'GRADING CONTEXT: Redraft league — weight current-season production and schedule over dynasty value.'
  extraParts.push(gradingNote)
  if (focusNote?.trim()) extraParts.push(`USER FOCUS: ${focusNote.trim()}`)

  const outputSchema = TeamEvalOutputSchema.omit({
    contentLinks: true,
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['roster', 'market_values', 'recent_news'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext: extraParts.join('\n\n'),
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku',
    maxOutputTokens: 1200,
  })

  console.log(
    `[team-eval] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations} grade=${llmOutput.overallGrade}`,
  )

  // Build content links for the UI
  const starterPlayerIds = allPlayerIds.filter((id) => starterIds.has(id))
  const injection = await injectContent(starterPlayerIds, {
    agentType: 'team_eval',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: 6,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  const playerRecords = await db.player.findMany({
    where: { sleeperId: { in: starterPlayerIds } },
    select: { sleeperId: true, firstName: true, lastName: true },
  })
  const playerNameMap = new Map(
    playerRecords.map((p) => [p.sleeperId, `${p.firstName} ${p.lastName}`.trim()]),
  )

  const seen = new Set<string>()
  const contentLinks: TeamEvalOutput['contentLinks'] = []
  for (const item of injection.items) {
    if (seen.has(item.sourceUrl) || contentLinks.length >= 6) continue
    const linkType: TeamEvalOutput['contentLinks'][number]['type'] =
      item.contentType === 'video' || item.contentType === 'vlog' ? 'youtube' : 'article'
    contentLinks.push({
      playerId: item.playerId,
      playerName: playerNameMap.get(item.playerId) ?? item.playerId,
      title: item.title,
      url: item.sourceUrl,
      type: linkType,
    })
    seen.add(item.sourceUrl)
  }

  return {
    ...llmOutput,
    contentLinks,
    tokensUsed: metadata.tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
