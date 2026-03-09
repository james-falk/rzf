import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { TeamEvalOutputSchema } from '@rzf/shared/types'
import type { TeamEvalInput, TeamEvalOutput } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt, buildContentLinks } from './prompt.js'

export async function runTeamEvalAgent(input: TeamEvalInput): Promise<TeamEvalOutput> {
  const { userId, sleeperUserId, leagueId } = input

  // ── 1. Load user preferences for personalized context ──────────────────────
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

  // ── 2. Live fetch: user's roster + league settings ─────────────────────────
  const [league, userRoster, nflState] = await Promise.all([
    SleeperConnector.getLeague(leagueId),
    SleeperConnector.getUserRoster(leagueId, sleeperUserId),
    SleeperConnector.getNFLState(),
  ])

  if (!userRoster) {
    throw new Error(`No roster found for user ${sleeperUserId} in league ${leagueId}`)
  }

  const starterIds = new Set(userRoster.starters ?? [])
  const allPlayerIds = userRoster.players ?? []

  // ── 3. DB lookup: enrich players with cached Player data ──────────────────
  const playerRecords = await db.player.findMany({
    where: { sleeperId: { in: allPlayerIds } },
  })

  const playerMap = new Map(playerRecords.map((p) => [p.sleeperId, p]))

  // ── 4. DB lookup: current week rankings ───────────────────────────────────
  const currentWeek = nflState.week
  const currentSeason = parseInt(nflState.season, 10)

  const rankings = await db.playerRanking.findMany({
    where: {
      playerId: { in: allPlayerIds },
      source: 'fantasypros',
      week: currentWeek,
      season: currentSeason,
    },
  })

  const rankingMap = new Map(rankings.map((r) => [r.playerId, r]))

  // ── 5. DB lookup: trending adds ───────────────────────────────────────────
  const trending = await db.trendingPlayer.findMany({
    where: { type: 'add' },
    orderBy: { fetchedAt: 'desc' },
    take: 10,
    include: { player: true },
  })

  const trendingAddNames = trending.map(
    (t) => `${t.player.firstName} ${t.player.lastName}`.trim(),
  )

  // ── 6. Build enriched player list ─────────────────────────────────────────
  interface EnrichedPlayer {
    sleeperId: string
    name: string
    position: string
    team: string | null
    injuryStatus: string | null
    depthChartOrder: number | null
    searchRank: number | null
    rankPosition: number | null
    isStarter: boolean
  }

  const enrichedPlayers: EnrichedPlayer[] = allPlayerIds
    .filter((id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/)) // filter team defense slots
    .map((id) => {
      const dbPlayer = playerMap.get(id)
      const ranking = rankingMap.get(id)
      return {
        sleeperId: id,
        name: dbPlayer ? `${dbPlayer.firstName} ${dbPlayer.lastName}`.trim() : id,
        position: dbPlayer?.position ?? 'UNKNOWN',
        team: dbPlayer?.team ?? null,
        injuryStatus: dbPlayer?.injuryStatus ?? null,
        depthChartOrder: dbPlayer?.depthChartOrder ?? null,
        searchRank: dbPlayer?.searchRank ?? null,
        rankPosition: ranking?.rankPosition ?? null,
        isStarter: starterIds.has(id),
      }
    })

  const starters = enrichedPlayers.filter((p) => p.isStarter)
  const bench = enrichedPlayers.filter((p) => !p.isStarter)

  // ── 7. Build content links ─────────────────────────────────────────────────
  const contentLinks = buildContentLinks(starters)

  // ── 8. LLM call ───────────────────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(userContext)
  const userPrompt = buildUserPrompt(league, starters, bench, trendingAddNames)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: 'haiku' },
    (raw) => {
      const parsed = TeamEvalOutputSchema.omit({ contentLinks: true, tokensUsed: true }).parse(raw)
      return parsed
    },
  )

  // ── 9. Assemble final output ───────────────────────────────────────────────
  return {
    ...llmOutput,
    contentLinks,
    tokensUsed,
  }
}
