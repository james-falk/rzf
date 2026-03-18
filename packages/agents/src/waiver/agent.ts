import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { WaiverOutputSchema } from '@rzf/shared/types'
import type { WaiverInput, WaiverOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'
import { injectContent } from '../content-injector.js'
import { getMultiMarketValues } from '../multi-market-values.js'
import { buildSessionContext } from '../session-context.js'

// Tier 1+2, RSS + YouTube: waiver wire videos are genuinely useful for pickup
// context. Tier 3 excluded to keep signal quality high.
const DEFAULTS = {
  recencyWindowHours: 72,
  maxContentItems: 12,
  allowedTiers: [1, 2],
  allowedPlatforms: ['rss', 'youtube'],
}

export async function runWaiverAgent(input: WaiverInput, config?: AgentRuntimeConfig): Promise<WaiverOutput> {
  const { userId, leagueId, targetPosition, focusNote } = input
  console.log(`[waiver] Starting — userId=${userId} leagueId=${leagueId} targetPosition=${targetPosition ?? 'any'}`)

  // ── 1. Resolve Sleeper profile ─────────────────────────────────────────────
  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected.')
  }

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

  // ── 3. Fetch roster + NFL state ────────────────────────────────────────────
  const [userRoster, nflState] = await Promise.all([
    SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId),
    SleeperConnector.getNFLState(),
  ])

  if (!userRoster) {
    throw new Error(`No roster found for user in league ${leagueId}`)
  }

  const rosterPlayerIds = (userRoster.players ?? []).filter((id) => id !== 'DEF' && !id.match(/^[A-Z]{2,3}$/))
  const starterIds = new Set(userRoster.starters ?? [])

  // ── 4. Get trending adds (top waiver candidates) ───────────────────────────
  const trending = await db.trendingPlayer.findMany({
    where: { type: 'add' },
    orderBy: { fetchedAt: 'desc' },
    take: 50,
    include: { player: true },
  })

  // Filter out players already on the user's roster
  const rosterSet = new Set(rosterPlayerIds)
  const candidates = trending.filter(
    (t) =>
      !rosterSet.has(t.player.sleeperId) &&
      (!targetPosition || t.player.position === targetPosition),
  )
  const candidateIds = candidates.map((c) => c.player.sleeperId)

  // ── 5. Fetch supporting data in parallel ───────────────────────────────────
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const [injection, marketValues, tradeVolumes, rosterPlayers, leagueTransactions, sessionContext] = await Promise.all([
    injectContent(candidateIds, {
      agentType: 'waiver',
      recencyWindowHours: config?.recencyWindowHours ?? DEFAULTS.recencyWindowHours,
      maxItemsTotal: config?.maxContentItems ?? DEFAULTS.maxContentItems,
      allowedTiers: config?.allowedSourceTiers ?? DEFAULTS.allowedTiers,
      allowedPlatforms: config?.allowedPlatforms ?? DEFAULTS.allowedPlatforms,
    }),
    getMultiMarketValues(candidateIds),
    db.playerTradeVolume.findMany({ where: { sleeperId: { in: candidateIds } } }),
    db.player.findMany({
      where: { sleeperId: { in: rosterPlayerIds } },
      select: { sleeperId: true, firstName: true, lastName: true, position: true, injuryStatus: true, team: true },
    }),
    SleeperConnector.getLeagueTransactions(leagueId, week).catch(() => []),
    buildSessionContext(userId, config?.sessionId),
  ])

  // Build newsMap for prompt: playerId → headline strings (up to 2)
  const newsMap = new Map<string, string[]>()
  for (const item of injection.items) {
    const existing = newsMap.get(item.playerId) ?? []
    if (existing.length < 2) {
      existing.push(`[${item.sourceName}] ${item.title}`)
    }
    newsMap.set(item.playerId, existing)
  }

  // Trade volume map
  const volumeMap = new Map(tradeVolumes.map((v) => [v.sleeperId, v]))

  // Identify what opponents are claiming (waiver claims from league transactions)
  const recentClaims = leagueTransactions
    .filter((t: { type?: string; adds?: Record<string, unknown> | null }) => t.type === 'waiver' || t.type === 'free_agent')
    .flatMap((t: { adds?: Record<string, unknown> | null }) => Object.keys(t.adds ?? {}))
    .slice(0, 10)

  // Bye week detection: find roster players with byes this week
  const rosterTeams = new Set(rosterPlayers.filter((p) => p.team).map((p) => p.team!))
  // NFL state doesn't directly expose bye info, but we can flag players without games
  // This is a best-effort approximation — full bye data comes from ESPN connector later
  const byeWeekNote = rosterTeams.size > 0
    ? `Roster teams: ${Array.from(rosterTeams).join(', ')} — check for bye weeks in Week ${week}`
    : ''

  // ── 6. Build roster context ────────────────────────────────────────────────
  const rosterContext = rosterPlayers.map((p) => ({
    name: `${p.firstName} ${p.lastName}`.trim(),
    position: p.position,
    injuryStatus: p.injuryStatus,
    isStarter: starterIds.has(p.sleeperId),
  }))

  const candidateContext = candidates.slice(0, 30).map((c) => ({
    sleeperId: c.player.sleeperId,
    name: `${c.player.firstName} ${c.player.lastName}`.trim(),
    position: c.player.position,
    team: c.player.team,
    trendCount: c.count,
    injuryStatus: c.player.injuryStatus,
    searchRank: c.player.searchRank,
    recentNews: newsMap.get(c.player.sleeperId) ?? [],
    marketValues: marketValues.get(c.player.sleeperId) ?? null,
    tradeVolume1w: volumeMap.get(c.player.sleeperId)?.count1w ?? null,
    tradeVolume4w: volumeMap.get(c.player.sleeperId)?.count4w ?? null,
  }))

  // ── 7. LLM call ────────────────────────────────────────────────────────────
  console.log(`[waiver] Calling LLM — ${candidateContext.length} candidates week=${week} news=${injection.items.length}`)
  const leagueStyle = (userPrefs?.leagueStyle ?? 'redraft') === 'dynasty' ? 'dynasty' : 'redraft'
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(candidateContext, rosterContext, targetPosition, focusNote, recentClaims, byeWeekNote, leagueStyle, sessionContext || undefined)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => WaiverOutputSchema.omit({ tokensUsed: true, confidenceScore: true, sourcesUsed: true }).parse(raw),
  )

  console.log(`[waiver] Complete — tokens=${tokensUsed} recommendations=${llmOutput.recommendations.length} confidence=${injection.confidenceScore}`)

  return { ...llmOutput, tokensUsed, confidenceScore: injection.confidenceScore, sourcesUsed: injection.sourcesUsed }
}
