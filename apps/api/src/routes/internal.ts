import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { requireAuth, requireAdmin, requireAdminSecret } from '../middleware/auth.js'
import { getAgentQueue } from '../lib/queue.js'

// Internal routes are gated by session-based admin check (web UI)
// OR by X-Admin-Secret header (OpenClaw gateway)
async function adminGuard(req: Parameters<typeof requireAuth>[0], reply: Parameters<typeof requireAuth>[1]): Promise<void> {
  const hasAdminSecret = !!req.headers['x-admin-secret']
  if (hasAdminSecret) {
    await requireAdminSecret(req, reply)
  } else {
    await requireAuth(req, reply)
    if (!reply.sent) await requireAdmin(req, reply)
  }
}

export async function internalRoutes(app: FastifyInstance): Promise<void> {
  // GET /internal/overview — dashboard metrics
  app.get('/internal/overview', { preHandler: adminGuard }, async (_req, reply) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      runsToday,
      totalRuns,
      failedRuns,
      freeUsers,
      paidUsers,
      totalEvents,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { createdAt: { gte: todayStart } } }),
      db.user.count({ where: { createdAt: { gte: weekStart } } }),
      db.agentRun.count({ where: { createdAt: { gte: todayStart } } }),
      db.agentRun.count(),
      db.agentRun.count({ where: { status: 'failed' } }),
      db.user.count({ where: { tier: 'free' } }),
      db.user.count({ where: { tier: 'paid' } }),
      db.analyticsEvent.count(),
    ])

    return reply.send({
      users: { total: totalUsers, today: newUsersToday, week: newUsersWeek, free: freeUsers, paid: paidUsers },
      runs: { total: totalRuns, today: runsToday, failed: failedRuns },
      analytics: { totalEvents },
    })
  })

  // GET /internal/users — user table with sorting
  app.get('/internal/users', { preHandler: adminGuard }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
      tier: z.enum(['free', 'paid']).optional(),
    }).parse(req.query)

    const skip = (query.page - 1) * query.limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: query.tier ? { tier: query.tier } : undefined,
        select: {
          id: true,
          email: true,
          tier: true,
          role: true,
          runCredits: true,
          createdAt: true,
          _count: { select: { agentRuns: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      db.user.count({ where: query.tier ? { tier: query.tier } : undefined }),
    ])

    return reply.send({ users, total, page: query.page, pages: Math.ceil(total / query.limit) })
  })

  // PATCH /internal/users/:id — update tier or credits (manual operator actions)
  app.patch('/internal/users/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      tier: z.enum(['free', 'paid']).optional(),
      runCredits: z.number().min(0).max(1000).optional(),
      role: z.enum(['user', 'admin']).optional(),
    }).safeParse(req.body)

    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const user = await db.user.update({
      where: { id },
      data: {
        ...(body.data.tier && { tier: body.data.tier }),
        ...(body.data.runCredits !== undefined && { runCredits: body.data.runCredits }),
        ...(body.data.role && { role: body.data.role }),
      },
    })

    return reply.send({ user })
  })

  // GET /internal/runs — agent run log
  app.get('/internal/runs', { preHandler: adminGuard }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
      status: z.enum(['queued', 'running', 'done', 'failed']).optional(),
      agentType: z.string().optional(),
    }).parse(req.query)

    const skip = (query.page - 1) * query.limit

    const where = {
      ...(query.status && { status: query.status }),
      ...(query.agentType && { agentType: query.agentType }),
    }

    const [runs, total] = await Promise.all([
      db.agentRun.findMany({
        where,
        include: { user: { select: { email: true, tier: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      db.agentRun.count({ where }),
    ])

    return reply.send({ runs, total, page: query.page, pages: Math.ceil(total / query.limit) })
  })

  // GET /internal/events — analytics event stream
  app.get('/internal/events', { preHandler: adminGuard }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(200).default(100),
      eventType: z.string().optional(),
      userId: z.string().optional(),
    }).parse(req.query)

    const skip = (query.page - 1) * query.limit
    const where = {
      ...(query.eventType && { eventType: query.eventType }),
      ...(query.userId && { userId: query.userId }),
    }

    const [events, total] = await Promise.all([
      db.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      db.analyticsEvent.count({ where }),
    ])

    return reply.send({ events, total, page: query.page, pages: Math.ceil(total / query.limit) })
  })

  // GET /internal/queue — BullMQ queue stats
  app.get('/internal/queue', { preHandler: adminGuard }, async (_req, reply) => {
    try {
      const queue = getAgentQueue()
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
      ])
      return reply.send({ agents: { waiting, active, completed, failed } })
    } catch {
      return reply.send({ agents: { waiting: 0, active: 0, completed: 0, failed: 0, error: 'Redis unavailable' } })
    }
  })
}
