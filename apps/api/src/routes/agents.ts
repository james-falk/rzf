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
      ]),
      input: z.unknown(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { agentType, input } = body.data
    const inputWithUser = { ...(input as object), userId: user.userId }

    // Validate agent-specific input
    const schemaMap = {
      [AgentJobTypes.TEAM_EVAL]: TeamEvalInputSchema,
      [AgentJobTypes.INJURY_WATCH]: InjuryWatchInputSchema,
      [AgentJobTypes.WAIVER]: WaiverInputSchema,
      [AgentJobTypes.LINEUP]: LineupInputSchema,
      [AgentJobTypes.TRADE_ANALYSIS]: TradeAnalysisInputSchema,
      [AgentJobTypes.PLAYER_SCOUT]: PlayerScoutInputSchema,
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
      },
    })

    // ── Enqueue job ───────────────────────────────────────────────────────
    const queue = getAgentQueue()
    await queue.add(agentType, {
      agentRunId: agentRun.id,
      agentType,
      input: validatedInput,
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

    // Extract a concise player roster from the report if available (injury/scout/trade agents)
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

    const rosterHint = playerNames.length > 0
      ? `\nPlayers in this report: ${playerNames.join(', ')}.`
      : ''

    const systemPrompt = `You are RosterMind AI, a fantasy football assistant. The user previously received the following analysis report and is asking a follow-up question. Answer clearly and directly — if the question is about a specific player, use the data in the report. Do not say the report doesn't specify unless the player is genuinely absent.${rosterHint}

Report context:
${JSON.stringify(run.outputJson, null, 2).slice(0, 6000)}`

    const { content } = await LLMConnector.complete({
      model: 'sonnet',
      systemPrompt,
      userPrompt: body.data.message,
      maxTokens: 500,
    })

    await track('agent.followup.sent', { agentRunId: id, agentType: run.agentType }, userId)

    return reply.send({ reply: content })
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
