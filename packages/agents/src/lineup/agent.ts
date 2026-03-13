import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { LineupOutputSchema } from '@rzf/shared/types'
import type { LineupInput, LineupOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'

export async function runLineupAgent(input: LineupInput, config?: AgentRuntimeConfig): Promise<LineupOutput> {
  const { userId, leagueId, week: requestedWeek } = input
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
  const [playerRecords, rankings, defenseData] = await Promise.all([
    db.player.findMany({ where: { sleeperId: { in: allPlayerIds } } }),
    db.playerRanking.findMany({
      where: { playerId: { in: allPlayerIds }, source: 'fantasypros', week, season },
    }),
    db.nFLTeamDefense.findMany({ where: { week, season } }),
  ])

  const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))
  const rankMap = new Map(rankings.map((r) => [r.playerId, r]))
  const defenseMap = new Map(defenseData.map((d) => [d.team, d]))

  // Build opponent lookup from metadata (simplified — use team field for now)
  const buildSlot = (id: string) => {
    const p = playerMap.get(id)
    const rank = rankMap.get(id)
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
      opponent: null, // Future: pull from schedule API
    }
  }

  const starters = allPlayerIds.filter((id) => starterIds.has(id)).map(buildSlot)
  const bench = allPlayerIds.filter((id) => !starterIds.has(id)).map(buildSlot)

  // ── 5. LLM call ────────────────────────────────────────────────────────────
  console.log(`[lineup] Calling LLM — week=${week} starters=${starters.length} bench=${bench.length}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(
    { name: league.name, roster_positions: league.roster_positions, scoring_settings: league.scoring_settings },
    starters,
    bench,
    week,
  )

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => LineupOutputSchema.omit({ tokensUsed: true }).parse(raw),
  )

  console.log(`[lineup] Complete — tokens=${tokensUsed}`)

  return { ...llmOutput, tokensUsed }
}
