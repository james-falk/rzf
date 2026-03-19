import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { TeamEvalOutputSchema } from '@rzf/shared/types'
import type { TeamEvalInput, TeamEvalOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent, formatContentByPlayer } from '../content-injector.js'
import { getMultiMarketValues } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'

// Tier 1, all platforms: broad roster report benefits from quality sources.
// Tightened from Tier 1+2 — Tier 1 beat reporters are sufficient for team eval.
const DEFAULTS = {
  recencyWindowHours: 168, // 7 days
  maxContentItems: 15,
  allowedTiers: [1],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runTeamEvalAgent(input: TeamEvalInput, config?: AgentRuntimeConfig): Promise<TeamEvalOutput> {
  const { userId, leagueId, focusNote } = input
  console.log(`[team-eval] Starting — userId=${userId} leagueId=${leagueId} focusNote=${focusNote ?? 'none'}`)

  // ── 1. Resolve Sleeper user ID from linked profile ─────────────────────────
  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected. Visit /account/sleeper to link your account.')
  }
  const sleeperUserId = sleeperProfile.sleeperId
  console.log(`[team-eval] Sleeper profile found — sleeperId=${sleeperUserId}`)

  // ── 2. Load user preferences for personalized context ──────────────────────
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
  console.log(`[team-eval] Fetching league + roster from Sleeper...`)
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
  console.log(`[team-eval] Roster loaded — league="${league.name}" season=${nflState.season} week=${nflState.week} players=${allPlayerIds.length} starters=${starterIds.size}`)

  // ── 3. DB lookup: enrich players with cached Player data ──────────────────
  console.log(`[team-eval] Enriching ${allPlayerIds.length} players from DB...`)
  const playerRecords = await db.player.findMany({
    where: { sleeperId: { in: allPlayerIds } },
  })
  console.log(`[team-eval] DB enrichment — found ${playerRecords.length}/${allPlayerIds.length} players in cache`)

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

  // ── 5. DB lookup: trending adds + multi-market values + session context ─────
  const starterPlayerIds = allPlayerIds.filter((id) => starterIds.has(id) && id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/))

  const [trending, marketValues, sessionContext] = await Promise.all([
    db.trendingPlayer.findMany({
      where: { type: 'add' },
      orderBy: { fetchedAt: 'desc' },
      take: 10,
      include: { player: true },
    }),
    getMultiMarketValues(starterPlayerIds),
    buildSessionContext(userId, config?.sessionId),
  ])

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

  // ── 7. Content injection ───────────────────────────────────────────────────
  const injectionPlayerIds = starters.map((p) => p.sleeperId)
  const injection = await injectContent(injectionPlayerIds, {
    agentType: 'team_eval',
    recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
    maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
    allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
    allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
  })

  // Build player name map for formatting
  const playerNameMap = new Map<string, string>()
  for (const p of starters) playerNameMap.set(p.sleeperId, p.name)

  const newsContext = formatContentByPlayer(injection.items, playerNameMap)

  // Build contentLinks from injection items for the result display
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

  // ── 8. LLM call ────────────────────────────────────────────────────────────
  const leagueStyle = (userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft'
  console.log(`[team-eval] Calling LLM — starters=${starters.length} bench=${bench.length} news=${injection.items.length} confidence=${injection.confidenceScore}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(league, starters, bench, trendingAddNames, focusNote, newsContext || undefined, marketValues, leagueStyle, sessionContext || undefined)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => {
      const parsed = TeamEvalOutputSchema.omit({ contentLinks: true, tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw)
      return parsed
    },
  )

  console.log(`[team-eval] LLM complete — tokens=${tokensUsed} grade=${llmOutput.overallGrade}`)

  // ── 9. Assemble final output ───────────────────────────────────────────────
  return {
    ...llmOutput,
    contentLinks,
    tokensUsed,
    confidenceScore: injection.confidenceScore,
    sourcesUsed: injection.sourcesUsed,
  }
}
