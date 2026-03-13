import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { LLMConnector } from '@rzf/connectors/llm'
import { buildUserContext } from '@rzf/shared'
import { WaiverOutputSchema } from '@rzf/shared/types'
import type { WaiverInput, WaiverOutput, AgentRuntimeConfig } from '@rzf/shared/types'
import { buildSystemPrompt, buildUserPrompt } from './prompt.js'

export async function runWaiverAgent(input: WaiverInput, config?: AgentRuntimeConfig): Promise<WaiverOutput> {
  const { userId, leagueId, targetPosition } = input
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

  const rosterPlayerIds = userRoster.players ?? []

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

  // ── 5. Enrich candidates with recent news ─────────────────────────────────
  const candidateIds = candidates.map((c) => c.player.sleeperId)
  const recentMentions = await db.contentPlayerMention.findMany({
    where: { playerId: { in: candidateIds } },
    include: { content: { select: { title: true, fetchedAt: true } } },
    orderBy: { content: { fetchedAt: 'desc' } },
    take: 100,
  })

  const newsMap = new Map<string, string[]>()
  for (const mention of recentMentions) {
    const existing = newsMap.get(mention.playerId) ?? []
    if (existing.length < 2) existing.push(mention.content.title)
    newsMap.set(mention.playerId, existing)
  }

  // ── 6. Build roster context ────────────────────────────────────────────────
  const rosterPlayers = await db.player.findMany({
    where: { sleeperId: { in: rosterPlayerIds } },
    select: { sleeperId: true, firstName: true, lastName: true, position: true, injuryStatus: true },
  })

  const rosterContext = rosterPlayers.map((p) => ({
    name: `${p.firstName} ${p.lastName}`.trim(),
    position: p.position,
    injuryStatus: p.injuryStatus,
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
  }))

  // ── 7. LLM call ────────────────────────────────────────────────────────────
  console.log(`[waiver] Calling LLM — ${candidateContext.length} candidates, week ${nflState.week}`)
  const systemPrompt = buildSystemPrompt(userContext, config?.systemPromptOverride)
  const userPrompt = buildUserPrompt(candidateContext, rosterContext, targetPosition)

  const { data: llmOutput, tokensUsed } = await LLMConnector.completeJSON(
    { systemPrompt, userPrompt, model: (config?.modelTierOverride as 'haiku' | 'sonnet') ?? 'haiku' },
    (raw) => WaiverOutputSchema.omit({ tokensUsed: true }).parse(raw),
  )

  console.log(`[waiver] Complete — tokens=${tokensUsed} recommendations=${llmOutput.recommendations.length}`)

  return { ...llmOutput, tokensUsed }
}
