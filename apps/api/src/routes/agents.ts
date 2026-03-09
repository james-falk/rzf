import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db, track } from '@rzf/db'
import { getAgentQueue } from '../lib/queue.js'
import { AgentJobTypes, TeamEvalInputSchema } from '@rzf/shared/types'
import { requireAuth } from '../middleware/auth.js'

export async function agentsRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/run — enqueue an agent job with credit check
  app.post('/agents/run', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!

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
      agentType: z.enum([AgentJobTypes.TEAM_EVAL]),
      input: z.unknown(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { agentType, input } = body.data

    // Validate agent-specific input
    let validatedInput: z.infer<typeof TeamEvalInputSchema>
    switch (agentType) {
      case AgentJobTypes.TEAM_EVAL: {
        const result = TeamEvalInputSchema.safeParse({ ...input as object, userId: user.userId })
        if (!result.success) {
          return reply.status(400).send({ error: 'Invalid team eval input', details: result.error.flatten() })
        }
        validatedInput = result.data
        break
      }
      default:
        return reply.status(400).send({ error: 'Unknown agent type' })
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
