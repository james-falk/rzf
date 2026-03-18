import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { LineupOutputSchema } from '@rzf/shared/types'
import type { LineupInput, LineupOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent, formatContentByPlayer } from '../content-injector.js'
import { buildSessionContext } from '../session-context.js'

// Tier 1 RSS + YouTube: start/sit needs current injury + matchup context.
// YouTube tier 1 included for weekly preview and start/sit shows.
const DEFAULTS = {
  recencyWindowHours: 48,
  maxContentItems: 10,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runLineupAgent(input: LineupInput, config?: AgentRuntimeConfig): Promise<LineupOutput> {
  const { userId, leagueId, week: requestedWeek, focusNote } = input
  console.log(`[lineup] Starting — userId=${userId} leagueId=${leagueId}`)

  // ── 1. Resolve Sleeper profile ─────────────────────────────────────────────
  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) throw new Error('No Sleeper account connected.')

  // ── 2. Load user preferences ───────────────────────────────────────────────
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

  // ── 3. Fetch league + roster + NFL state ───────────────────────────────────
  const [league, userRoster, nflState] = await Promise.all([
    SleeperConnector.getLeague(leagueId),
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getNFLState(),
  ])

  if (!userRoster) throw new Error(`No roster found in league ${leagueId}`)

  const week = requestedWeek ?? nflState.week
  const season = parseInt(nflState.season, 10)
  const starterIds = new Set(userRoster.starters ?? [])
  const allPlayerIds = (userRoster.players ?? []).filter((id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/))

  // ── 4. Enrich with DB data ─────────────────────────────────────────────────
  const [playerRecords, rankings, defenseData, projections, sessionContext] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
    db.playerRanking.findMany({
      where: { playerId: { in: allPlayerIds }, source: 'fantasypros', week, season },
    }),
    db.nFLTeamDefense.findMany({ where: { week, season } }),
    db.playerProjection.findMany({
      where: { playerId: { in: allPlayerIds }, week, season, isRos: false },
      orderBy: { fetchedAt: 'desc' },
    }),
    buildSessionContext(userId, config?.sessionId),
  ])

  const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))
  const defenseMap = new Map(defenseData.map((d) => [d.team, d]))
  // Prefer FantasyPros projections, fall back to ESPN
  const projMap = new Map<string, (typeof projections)[number]>()
  for (const proj of projections) {
    const existing = projMap.get(proj.playerId)
    if (!existing || (proj.source === 'fantasypros' && existing.source !== 'fantasypros')) {
      projMap.set(proj.playerId, proj)
    }
  }

  // Build opponent lookup from metadata (simplified — use team field for now)
  const buildSlot = (id: string) => {
    const p = playerMap.get(id)
    const rank = rankMap.get(id)
    const proj = projMap.get(id)
    const pos = p?.position ?? 'UNKNOWN'
    const team = p?.team ?? null
    const defRank = team ? defenseMap.get(team) : null
    const defRankVsPos =
      pos === 'QB' ? defRank?.rankVsQB
      : pos === 'RB' ? defRank?.rankVsRB
      : pos === 'WR' ? defRank?.rankVsWR
      : pos === 'TE' ? defRank?.rankVsTE
      : null

    return {
      playerId: id,
      name: p ? `${p.firstName} ${p.lastName}`.trim() : id,
      position: pos,
      team,
      isStarter: starterIds.has(id),
      injuryStatus: p?.injuryStatus ?? null,
      depthChartOrder: p?.depthChartOrder ?? null,
      rankOverall: rank?.rankOverall ?? null,
      rankPosition: rank?.rankPosition ?? null,
      defenseRankVsPosition: defRankVsPos ?? null,
      projectedPoints: proj?.fptsPpr ?? proj?.fpts ?? null,
      opponent: null, // Future: pull from schedule API
    }
  }

  const starters = allPlayerIds.filter((id) => starterIds.has(id)).map(buildSlot)
  const bench = allPlayerIds.filter((id) => !starterIds.has(id)).map(buildSlot)

  // Classify players as locked (clear starters) vs decision (competing for flex/uncertain)
  // A player is "locked" if they have rank position <= 5 for their position OR projected > 15pts
  const isLocked = (slot: ReturnType<typeof buildSlot>): boolean => {
    if (slot.injuryStatus && ['Out', 'IR', 'Doubtful'].includes(slot.injuryStatus)) return false
    if (slot.projectedPoints != null && slot.projectedPoints >= 15) return true
    if (slot.rankPosition != null && slot.rankPosition <= 5) return true
    return false
  }

  // ── 5. Content injection ───────────────────────────────────────────────────
  const injection = await injectContent(allPlayerIds, {
    agentType: 'lineup',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  // Build player name map for formatting
  const playerNameMap = new Map<string, string>()
  for (const id of allPlayerIds) {
    const p = playerMap.get(id)
    if (p) playerNameMap.set(id, `${p.firstName} ${p.lastName}`.trim())
  }
  const newsContext = formatContentByPlayer(injection.items, playerNameMap)

  // ── 6. LLM call ────────────────────────────────────────────────────────────
  console.log(`[lineup] Calling LLM — week=${week} starters=${starters.length} bench=${bench.length} news=${injection.items.length}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(
    { name: league.name, roster_positions: league.roster_positions, scoring_settings: league.scoring_settings, settings: league.settings },
    starters.map((s) => ({ ...s, isLocked: isLocked(s) })),
    bench.map((s) => ({ ...s, isLocked: isLocked(s) })),
    week,
    newsContext || undefined,
    focusNote,
    sessionContext || undefined,
  )

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => LineupOutputSchema.omit({ tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw),
  )

  console.log(`[lineup] Complete — tokens=${tokensUsed} confidence=${injection.confidenceScore}`)

  return { ...llmOutput, tokensUsed, confidenceScore: injection.confidenceScore, sourcesUsed: injection.sourcesUsed }
}
