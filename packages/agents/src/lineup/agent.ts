import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { buildUserContext } from '@rzf/shared'
import { LineupOutputSchema } from '@rzf/shared/types'
import type { LineupInput, LineupOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { injectContent, formatContentByPlayer } from '../content-injector.js'
import { loadTierZeroPlayerRankings } from '../tier0-rankings.js'
import { buildSessionContext } from '../session-context.js'
import { runAgentLoop, loadAgentContext } from '../loop-engine.js'

const agentContext = loadAgentContext(import.meta.url)

const DEFAULTS = {
  recencyWindowHours: 48,
  maxContentItems: 10,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

function toSeverityTag(injuryStatus: string | null): boolean {
  if (!injuryStatus) return false
  const s = injuryStatus.toLowerCase()
  return s.includes('out') || s.includes('ir') || s.includes('doubtful') || s.includes('questionable')
}

export async function runLineupAgent(
  input: LineupInput,
  config?: AgentRuntimeConfig,
): Promise<LineupOutput> {
  const { userId, leagueId, week: requestedWeek, focusNote } = input
  console.log(`[lineup] Starting — userId=${userId} leagueId=${leagueId}`)

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

  const [league, userRoster, nflState] = await Promise.all([
    SleeperConnector.getLeague(leagueId),
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getNFLState(),
  ])
  if (!userRoster) throw new Error(`No roster found in league ${leagueId}`)

  const week = requestedWeek ?? nflState.week
  const season = parseInt(nflState.season, 10)
  const starterIds = new Set(userRoster.starters ?? [])
  const allPlayerIds = (userRoster.players ?? []).filter(
    (id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/),
  )

  const tools = {
    roster: async (): Promise<string> => {
      const [playerRecords, tierRankRows, defenseData, projections] = await Promise.all([
        db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
        loadTierZeroPlayerRankings(allPlayerIds, week, season),
        db.nFLTeamDefense.findMany({ where: { week, season } }),
        db.playerProjection.findMany({
          where: { playerId: { in: allPlayerIds }, week, season, isRos: false },
          orderBy: { fetchedAt: 'desc' },
        }),
      ])

      const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))
      const fpRankMap = new Map<string, { rankOverall: number; rankPosition: number }>()
      const otherRankLines = new Map<string, string[]>()
      for (const r of tierRankRows) {
        if (r.source === 'fantasypros') {
          fpRankMap.set(r.playerId, { rankOverall: r.rankOverall, rankPosition: r.rankPosition })
        } else {
          const arr = otherRankLines.get(r.playerId) ?? []
          arr.push(`${r.label} #${r.rankOverall}`)
          otherRankLines.set(r.playerId, arr)
        }
      }
      const defenseMap = new Map(defenseData.map((d) => [d.team, d]))
      const projMap = new Map<string, (typeof projections)[number]>()
      for (const proj of projections) {
        const existing = projMap.get(proj.playerId)
        if (!existing || (proj.source === 'fantasypros' && existing.source !== 'fantasypros')) {
          projMap.set(proj.playerId, proj)
        }
      }

      const scoringType =
        league.scoring_settings['rec'] === 1
          ? 'PPR'
          : league.scoring_settings['rec'] === 0.5
            ? 'Half-PPR'
            : 'Standard'
      const leagueTypeNum = Number(league.settings['type'] ?? 0)
      const leagueType =
        leagueTypeNum === 2 ? 'Dynasty' : leagueTypeNum === 1 ? 'Keeper' : 'Redraft'

      const formatSlot = (id: string, isStarter: boolean): string => {
        const p = playerMap.get(id)
        const r = fpRankMap.get(id)
        const proj = projMap.get(id)
        const pos = p?.position ?? 'UNKNOWN'
        const team = p?.team ?? null
        const defRank = team ? defenseMap.get(team) : null
        const defRankVsPos =
          pos === 'QB'
            ? defRank?.rankVsQB
            : pos === 'RB'
              ? defRank?.rankVsRB
              : pos === 'WR'
                ? defRank?.rankVsWR
                : pos === 'TE'
                  ? defRank?.rankVsTE
                  : null
        const name = p ? `${p.firstName} ${p.lastName}`.trim() : id
        const projectedPoints = proj?.fptsPpr ?? proj?.fpts ?? null
        const isLocked =
          !toSeverityTag(p?.injuryStatus ?? null) &&
          (projectedPoints != null && projectedPoints >= 15
            ? true
            : (r?.rankPosition ?? 99) <= 5)
        const tag = isLocked ? '[LOCKED]' : '[DECISION]'
        const parts = [`${name} (${pos}, ${team ?? 'FA'}) ${tag}`]
        if (r?.rankPosition) parts.push(`FP rank: ${pos}${r.rankPosition}`)
        const extras = otherRankLines.get(id)
        if (extras?.length) parts.push(extras.join(' · '))
        if (projectedPoints != null) parts.push(`Proj: ${projectedPoints.toFixed(1)}pts`)
        if (p?.injuryStatus) parts.push(`⚠️ ${p.injuryStatus}`)
        if (defRankVsPos) parts.push(`Opp def vs ${pos}: ${defRankVsPos}/32`)
        return `${isStarter ? 'STARTER' : 'BENCH'}: ${parts.join(' | ')}`
      }

      const lines = [
        `[League: ${league.name} | ${leagueType} | ${scoringType} | Week ${week}]`,
        `[Roster Slots: ${league.roster_positions.join(', ')}]`,
        '',
      ]
      for (const id of allPlayerIds) {
        lines.push(formatSlot(id, starterIds.has(id)))
      }
      return lines.join('\n')
    },

    recent_news: async (): Promise<string> => {
      const injection = await injectContent(allPlayerIds, {
        agentType: 'lineup',
        recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
        maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
        allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
        allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
      })

      const playerRecords = await db.player.findMany({
        where: { sleeperId: { in: allPlayerIds } },
        select: { sleeperId: true, firstName: true, lastName: true },
      })
      const playerNameMap = new Map(
        playerRecords.map((p) => [p.sleeperId, `${p.firstName} ${p.lastName}`.trim()]),
      )
      return formatContentByPlayer(injection.items, playerNameMap) || 'No recent news.'
    },

    prop_lines: async (): Promise<string> => {
      const lines = await db.playerPropLine.findMany({
        where: { sleeperId: { in: allPlayerIds } },
        orderBy: { fetchedAt: 'desc' },
      })
      if (lines.length === 0) return 'No prop lines available for current roster.'
      const playerRecords = await db.player.findMany({
        where: { sleeperId: { in: allPlayerIds } },
        select: { sleeperId: true, firstName: true, lastName: true },
      })
      const nameMap = new Map(playerRecords.map((p) => [p.sleeperId, `${p.firstName} ${p.lastName}`.trim()]))
      const grouped = new Map<string, typeof lines>()
      for (const l of lines) {
        const bucket = grouped.get(l.sleeperId) ?? []
        bucket.push(l)
        grouped.set(l.sleeperId, bucket)
      }
      return Array.from(grouped.entries())
        .map(([id, pLines]) => {
          const name = nameMap.get(id) ?? id
          const formatted = pLines.map((l) => {
            const parts = [`${l.market}`]
            if (l.line != null) parts.push(`O/U ${l.line}`)
            if (l.overOdds != null) parts.push(`Over ${l.overOdds > 0 ? '+' : ''}${l.overOdds}`)
            if (l.underOdds != null) parts.push(`Under ${l.underOdds > 0 ? '+' : ''}${l.underOdds}`)
            parts.push(`[${l.bookmaker}]`)
            return parts.join(' ')
          })
          return `${name}:\n  ${formatted.join('\n  ')}`
        })
        .join('\n\n')
    },

    session_history: async (): Promise<string> => {
      const ctx = await buildSessionContext(userId, config?.sessionId)
      return ctx || 'No prior session context.'
    },
  }

  const extraParts: string[] = []
  if (userContext) extraParts.push(userContext)
  if (focusNote?.trim()) extraParts.push(`USER FOCUS: ${focusNote.trim()}`)
  extraParts.push('Optimize the starting lineup. Focus your analysis on DECISION players.')

  const outputSchema = LineupOutputSchema.omit({
    tokensUsed: true,
    confidenceScore: true,
    sourcesUsed: true,
  })

  const { output: llmOutput, metadata } = await runAgentLoop({
    context: agentContext,
    tools,
    initialTools: ['roster', 'recent_news'],
    outputValidator: (raw) => outputSchema.parse(raw),
    extraContext: extraParts.join('\n\n'),
    model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku',
    maxOutputTokens: 3000,
    maxIterations: 4,
  })

  console.log(
    `[lineup] Complete — tokens=${metadata.tokensUsed} iters=${metadata.iterations}`,
  )

  const injection = await injectContent(allPlayerIds, {
    agentType: 'lineup',
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
