import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db, track } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { getAgentQueue } from '../lib/queue.js'
import {
  AgentJobTypes,
  InjuryWatchInputSchema,
  TeamEvalInputSchema,
  WaiverInputSchema,
  TradeAnalysisInputSchema,
  LineupInputSchema,
  PlayerScoutInputSchema,
  PlayerCompareInputSchema,
} from '@rzf/shared/types'
import { requireAuth } from '../middleware/auth.js'

export async function agentsRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/run — enqueue an agent job with credit check
  app.post('/agents/run', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!

    // ── Sleeper profile check ─────────────────────────────────────────────
    const sleeperProfile = await db.sleeperProfile.findUnique({
      where: { userId: user.userId },
      select: { sleeperId: true },
    })
    if (!sleeperProfile) {
      return reply.status(400).send({
        error: 'No Sleeper account connected',
        message: 'Visit /account/sleeper to connect your Sleeper account first.',
      })
    }

    // ── Freemium credit check ──────────────────────────────────────────────
    if (user.runCredits <= 0 && user.tier === 'free') {
      await track('user.upgrade.prompted', { triggeredBy: 'credit_exhaustion' }, user.userId)
      return reply.status(402).send({
        error: 'Credits exhausted',
        message: 'You have used all your free agent runs.',
        upgradeUrl: '/account/billing',
        creditsRemaining: 0,
      })
    }

    // ── Parse + validate agent-specific input ─────────────────────────────
    const bodySchema = z.object({
      agentType: z.enum([
        AgentJobTypes.TEAM_EVAL,
        AgentJobTypes.INJURY_WATCH,
        AgentJobTypes.WAIVER,
        AgentJobTypes.LINEUP,
        AgentJobTypes.TRADE_ANALYSIS,
        AgentJobTypes.PLAYER_SCOUT,
        AgentJobTypes.PLAYER_COMPARE,
      ]),
      input: z.unknown(),
      sessionId: z.string().optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { agentType, input, sessionId } = body.data
    const inputWithUser = { ...(input as object), userId: user.userId }

    // Validate agent-specific input
    const schemaMap = {
      [AgentJobTypes.TEAM_EVAL]: TeamEvalInputSchema,
      [AgentJobTypes.INJURY_WATCH]: InjuryWatchInputSchema,
      [AgentJobTypes.WAIVER]: WaiverInputSchema,
      [AgentJobTypes.LINEUP]: LineupInputSchema,
      [AgentJobTypes.TRADE_ANALYSIS]: TradeAnalysisInputSchema,
      [AgentJobTypes.PLAYER_SCOUT]: PlayerScoutInputSchema,
      [AgentJobTypes.PLAYER_COMPARE]: PlayerCompareInputSchema,
    } as const

    const schema = schemaMap[agentType]
    const result = schema.safeParse(inputWithUser)
    if (!result.success) {
      return reply.status(400).send({ error: `Invalid ${agentType} input`, details: result.error.flatten() })
    }
    const validatedInput = result.data

    // ── Duplicate prevention: block double-clicks within 5 minutes ───────
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
    const existingRun = await db.agentRun.findFirst({
      where: {
        userId: user.userId,
        agentType,
        status: { in: ['queued', 'running'] },
        createdAt: { gte: fiveMinutesAgo },
      },
    })
    if (existingRun) {
      return reply.status(202).send({
        agentRunId: existingRun.id,
        status: existingRun.status,
        deduplicated: true,
      })
    }

    // ── Create AgentRun record ────────────────────────────────────────────
    const agentRun = await db.agentRun.create({
      data: {
        userId: user.userId,
        agentType,
        status: 'queued',
        inputJson: JSON.parse(JSON.stringify(validatedInput)),
        sessionId: sessionId ?? null,
      },
    })

    // ── Enqueue job ───────────────────────────────────────────────────────
    const queue = getAgentQueue()
    await queue.add(agentType, {
      agentRunId: agentRun.id,
      agentType,
      input: validatedInput,
      sessionId: sessionId ?? undefined,
    })

    return reply.status(202).send({
      agentRunId: agentRun.id,
      status: 'queued',
      message: 'Agent run queued. Poll GET /agents/:id for results.',
    })
  })

  // GET /agents/:id — poll for agent run result
  app.get('/agents/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.authUser!.userId

    const run = await db.agentRun.findFirst({
      where: { id, userId }, // ensure users can only see their own runs
    })

    if (!run) {
      return reply.status(404).send({ error: 'Agent run not found' })
    }

    return reply.send({
      id: run.id,
      agentType: run.agentType,
      status: run.status,
      output: run.outputJson,
      tokensUsed: run.tokensUsed,
      durationMs: run.durationMs,
      rating: run.rating,
      errorMessage: run.errorMessage,
      confidenceScore: run.confidenceScore,
      createdAt: run.createdAt,
    })
  })

  // POST /agents/:id/rate — submit thumbs up/down rating
  app.post('/agents/:id/rate', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.authUser!.userId

    const body = z.object({ rating: z.enum(['up', 'down']) }).safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid rating' })
    }

    const run = await db.agentRun.findFirst({ where: { id, userId } })
    if (!run) return reply.status(404).send({ error: 'Not found' })

    await db.agentRun.update({
      where: { id },
      data: { rating: body.data.rating },
    })

    await track('agent.result.rated', { agentRunId: id, rating: body.data.rating }, userId)

    return reply.send({ success: true })
  })

  // POST /agents/:id/followup — sync LLM follow-up on a completed run (no credit deduction)
  app.post('/agents/:id/followup', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const userId = req.authUser!.userId

    const body = z.object({ message: z.string().min(1).max(500) }).safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const run = await db.agentRun.findFirst({ where: { id, userId } })
    if (!run) return reply.status(404).send({ error: 'Agent run not found' })
    if (run.status !== 'done' || !run.outputJson) {
      return reply.status(400).send({ error: 'Run has not completed successfully' })
    }

    const reportJson = run.outputJson as Record<string, unknown>

    // Extract player names from report for context
    const playerNames: string[] = []
    if (Array.isArray(reportJson?.alerts)) {
      for (const a of reportJson.alerts as Array<{ playerName?: string }>) {
        if (a.playerName) playerNames.push(a.playerName)
      }
    }
    if (Array.isArray(reportJson?.givingAnalysis)) {
      for (const p of reportJson.givingAnalysis as Array<{ playerName?: string }>) {
        if (p.playerName) playerNames.push(p.playerName)
      }
    }
    if (Array.isArray(reportJson?.receivingAnalysis)) {
      for (const p of reportJson.receivingAnalysis as Array<{ playerName?: string }>) {
        if (p.playerName) playerNames.push(p.playerName)
      }
    }
    if (typeof reportJson?.playerName === 'string') playerNames.push(reportJson.playerName)

    // Detect if the question is asking about historical/seasonal stats
    const statsKeywords = ['last year', 'previous year', 'last season', 'previous season', '2024', '2023', '2022', '2021', '2020', 'history', 'historical', 'career', 'stats', 'statistics', 'yards', 'touchdowns', 'fantasy points', 'ppg', 'per game']
    const messageNormalized = body.data.message.toLowerCase()
    const isStatsQuestion = statsKeywords.some((kw) => messageNormalized.includes(kw))

    // If stats question, look up PlayerSeasonStats for players in the report
    let seasonStatsContext = ''
    if (isStatsQuestion && playerNames.length > 0) {
      try {
        const playerRecords = await db.player.findMany({
          where: {
            OR: playerNames.map((name) => {
              const parts = name.trim().split(/\s+/)
              const first = parts[0] ?? ''
              const last = parts.slice(1).join(' ')
              return { firstName: { contains: first, mode: 'insensitive' as const }, lastName: { contains: last, mode: 'insensitive' as const } }
            }),
          },
          select: { sleeperId: true, firstName: true, lastName: true },
        })

        if (playerRecords.length > 0) {
          const sleeperIds = playerRecords.map((p) => p.sleeperId)
          const stats = await db.playerSeasonStats.findMany({
            where: { playerId: { in: sleeperIds }, seasonType: 'regular' },
            orderBy: [{ playerId: 'asc' }, { season: 'desc' }],
          })

          const playerNameMap = new Map(playerRecords.map((p) => [p.sleeperId, `${p.firstName} ${p.lastName}`.trim()]))

          if (stats.length > 0) {
            const byPlayer = new Map<string, typeof stats>()
            for (const s of stats) {
              const existing = byPlayer.get(s.playerId) ?? []
              existing.push(s)
              byPlayer.set(s.playerId, existing)
            }

            seasonStatsContext = '\n\n[Historical Season Statistics from database]\n'
            for (const [pid, seasons] of byPlayer) {
              const name = playerNameMap.get(pid) ?? pid
              seasonStatsContext += `${name}:\n`
              for (const s of seasons) {
                const parts = []
                if (s.passYds) parts.push(`${s.passYds} pass yds`)
                if (s.passTds) parts.push(`${s.passTds} pass TD`)
                if (s.rushYds) parts.push(`${s.rushYds} rush yds`)
                if (s.rushTds) parts.push(`${s.rushTds} rush TD`)
                if (s.recYds) parts.push(`${s.recYds} rec yds`)
                if (s.recTds) parts.push(`${s.recTds} rec TD`)
                if (s.rec) parts.push(`${s.rec} rec`)
                if (s.targets) parts.push(`${s.targets} tgt`)
                if (s.fantasyPtsPpr) parts.push(`${s.fantasyPtsPpr.toFixed(1)} PPR pts`)
                if (s.gamesPlayed) parts.push(`${s.gamesPlayed} GP`)
                seasonStatsContext += `  ${s.season}: ${parts.join(', ') || 'no data'}\n`
              }
            }
          }
        }
      } catch { /* ignore stats lookup errors */ }
    }

    // Detect if another agent would serve this question better
    const agentSuggestionKeywords: Record<string, string[]> = {
      player_scout: ['scout', 'deep dive', 'outlook', 'future', 'dynasty', 'buy', 'sell', 'hold', 'target', 'avoid'],
      trade_analysis: ['trade', 'swap', 'offer', 'exchange', 'should i trade', 'worth it'],
      injury_watch: ['injury', 'injured', 'hurt', 'status', 'health', 'return', 'questionable'],
      lineup: ['start', 'sit', 'lineup', 'bench', 'flex', 'who should i start', 'who do i start'],
      waiver: ['waiver', 'add', 'drop', 'pickup', 'free agent', 'stream'],
    }

    let suggestedAgent: { agentType: string; label: string; reason: string } | null = null
    for (const [agentType, keywords] of Object.entries(agentSuggestionKeywords)) {
      if (agentType === run.agentType) continue
      if (keywords.some((kw) => messageNormalized.includes(kw))) {
        const configs = await db.agentConfig.findFirst({ where: { agentType, enabled: true }, select: { label: true } })
        if (configs) {
          suggestedAgent = {
            agentType,
            label: configs.label,
            reason: `This looks like a question best answered by running the ${configs.label} agent.`,
          }
          break
        }
      }
    }

    const rosterHint = playerNames.length > 0
      ? `\nPlayers in this report: ${playerNames.join(', ')}.`
      : ''

    const systemPrompt = `You are RosterMind AI, a fantasy football assistant. The user previously received the following analysis report and is asking a follow-up question. Answer clearly and directly using the provided data. Use the historical stats section when available — those are real numbers from the database, not estimates.${rosterHint}

Report context:
${JSON.stringify(run.outputJson, null, 2).slice(0, 5000)}${seasonStatsContext}`

    const { content } = await LLMConnector.complete({
      model: 'sonnet',
      systemPrompt,
      userPrompt: body.data.message,
      maxTokens: 600,
    })

    await track('agent.followup.sent', { agentRunId: id, agentType: run.agentType }, userId)

    return reply.send({ reply: content, suggestedAgent: suggestedAgent ?? undefined })
  })

  // GET /usage — current user's credit + token usage
  app.get('/usage', { preHandler: requireAuth }, async (req, reply) => {
    const userId = req.authUser!.userId

    const [user, budget, recentRuns] = await Promise.all([
      db.user.findUnique({ where: { id: userId }, select: { runCredits: true, tier: true } }),
      db.tokenBudget.findFirst({
        where: {
          userId,
          periodStart: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      db.agentRun.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          id: true,
          agentType: true,
          status: true,
          tokensUsed: true,
          durationMs: true,
          rating: true,
          createdAt: true,
        },
      }),
    ])

    return reply.send({
      runCredits: user?.runCredits ?? 0,
      tier: user?.tier ?? 'free',
      monthlyTokensUsed: budget?.tokensUsed ?? 0,
      monthlyRunsUsed: budget?.runsUsed ?? 0,
      recentRuns,
    })
  })
}
