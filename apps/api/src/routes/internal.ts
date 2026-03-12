import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { requireAuth, requireAdmin, requireAdminSecret } from '../middleware/auth.js'
import { getAgentQueue, getIngestionQueue } from '../lib/queue.js'
import { AgentJobTypes, IngestionJobTypes, InjuryWatchInputSchema, TeamEvalInputSchema } from '@rzf/shared/types'

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

  // POST /internal/agents/run — operator-triggered agent run (OpenClaw / on-prem)
  // Bypasses credit check — for admin use only
  app.post('/internal/agents/run', { preHandler: adminGuard }, async (req, reply) => {
    const body = z.object({
      userId: z.string(),
      agentType: z.enum([AgentJobTypes.TEAM_EVAL, AgentJobTypes.INJURY_WATCH]),
      input: z.unknown(),
    }).safeParse(req.body)

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { userId, agentType, input } = body.data

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return reply.status(404).send({ error: 'User not found' })

    let validatedInput: ReturnType<typeof TeamEvalInputSchema.parse> | ReturnType<typeof InjuryWatchInputSchema.parse>
    switch (agentType) {
      case AgentJobTypes.TEAM_EVAL: {
        const result = TeamEvalInputSchema.safeParse({ ...input as object, userId })
        if (!result.success) {
          return reply.status(400).send({ error: 'Invalid input', details: result.error.flatten() })
        }
        validatedInput = result.data
        break
      }
      case AgentJobTypes.INJURY_WATCH: {
        const result = InjuryWatchInputSchema.safeParse({ ...input as object, userId })
        if (!result.success) {
          return reply.status(400).send({ error: 'Invalid input', details: result.error.flatten() })
        }
        validatedInput = result.data
        break
      }
    }

    const agentRun = await db.agentRun.create({
      data: { userId, agentType, status: 'queued', inputJson: JSON.parse(JSON.stringify(validatedInput!)) },
    })

    const queue = getAgentQueue()
    await queue.add(agentType, { agentRunId: agentRun.id, agentType, input: validatedInput! })

    return reply.status(202).send({ agentRunId: agentRun.id, status: 'queued' })
  })

  // POST /internal/ingestion/trigger — manually kick off an ingestion job
  // Useful for seeding data without waiting for the scheduled cron
  app.post('/internal/ingestion/trigger', { preHandler: adminGuard }, async (req, reply) => {
    const body = z.object({
      type: z.enum([
        IngestionJobTypes.PLAYER_REFRESH,
        IngestionJobTypes.TRENDING_REFRESH,
        IngestionJobTypes.RANKINGS_REFRESH,
        IngestionJobTypes.CONTENT_REFRESH,
        IngestionJobTypes.CREDITS_REFILL,
        IngestionJobTypes.YOUTUBE_REFRESH,
        IngestionJobTypes.TRADE_REFRESH,
        IngestionJobTypes.TRADE_VALUES_REFRESH,
        IngestionJobTypes.ADP_REFRESH,
        IngestionJobTypes.DYNASTY_DADDY_REFRESH,
      ]),
    }).safeParse(req.body)

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const queue = getIngestionQueue()
    const job = await queue.add(body.data.type, { type: body.data.type })

    return reply.status(202).send({ jobId: job.id, type: body.data.type, status: 'queued' })
  })

  // GET /internal/runs/stats — aggregate agent run analytics (last 30 days)
  app.get('/internal/runs/stats', { preHandler: adminGuard }, async (_req, reply) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const [allRuns, recentRuns, agentTypeAgg] = await Promise.all([
      db.agentRun.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { status: true, tokensUsed: true, durationMs: true, agentType: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      db.agentRun.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { status: true },
      }),
      db.agentRun.groupBy({
        by: ['agentType', 'status'],
        _count: { id: true },
        _avg: { tokensUsed: true, durationMs: true },
      }),
    ])

    // Build daily buckets for the last 30 days
    const dailyMap = new Map<string, { date: string; done: number; failed: number; queued: number; running: number; tokens: number }>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      dailyMap.set(key, { date: key, done: 0, failed: 0, queued: 0, running: 0, tokens: 0 })
    }
    for (const run of allRuns) {
      const key = run.createdAt.toISOString().slice(0, 10)
      const bucket = dailyMap.get(key)
      if (bucket) {
        bucket[run.status as 'done' | 'failed' | 'queued' | 'running'] = (bucket[run.status as 'done' | 'failed' | 'queued' | 'running'] ?? 0) + 1
        bucket.tokens += run.tokensUsed ?? 0
      }
    }

    // Per-agent-type summary
    const agentSummary = new Map<string, { agentType: string; total: number; done: number; failed: number; avgTokens: number; avgDurationMs: number }>()
    for (const row of agentTypeAgg) {
      const existing = agentSummary.get(row.agentType) ?? { agentType: row.agentType, total: 0, done: 0, failed: 0, avgTokens: 0, avgDurationMs: 0 }
      existing.total += row._count.id
      if (row.status === 'done') {
        existing.done += row._count.id
        existing.avgTokens = row._avg.tokensUsed ?? 0
        existing.avgDurationMs = row._avg.durationMs ?? 0
      }
      if (row.status === 'failed') existing.failed += row._count.id
      agentSummary.set(row.agentType, existing)
    }

    const doneRuns = allRuns.filter((r) => r.status === 'done')
    const successRate = allRuns.length > 0 ? Math.round((doneRuns.length / allRuns.length) * 100) : 0
    const avgTokens = doneRuns.length > 0 ? Math.round(doneRuns.reduce((s, r) => s + (r.tokensUsed ?? 0), 0) / doneRuns.length) : 0
    const avgDuration = doneRuns.length > 0 ? Math.round(doneRuns.reduce((s, r) => s + (r.durationMs ?? 0), 0) / doneRuns.length) : 0

    return reply.send({
      summary: {
        totalLast30Days: allRuns.length,
        today: recentRuns.length,
        week: allRuns.filter((r) => r.createdAt >= weekStart).length,
        successRate,
        avgTokens,
        avgDurationMs: avgDuration,
        failed: allRuns.filter((r) => r.status === 'failed').length,
      },
      daily: Array.from(dailyMap.values()),
      byAgentType: Array.from(agentSummary.values()),
    })
  })

  // GET /internal/sources — all content sources with health stats
  app.get('/internal/sources', { preHandler: adminGuard }, async (_req, reply) => {
    const sources = await db.contentSource.findMany({
      include: {
        _count: { select: { items: true } },
        items: {
          orderBy: { fetchedAt: 'desc' },
          take: 1,
          select: { fetchedAt: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    const now = new Date()
    const enriched = sources.map((s) => {
      const lastFetch = s.items[0]?.fetchedAt ?? s.lastFetchedAt
      const staleCutoffMs = s.refreshIntervalMins * 2 * 60 * 1000
      const isStale = lastFetch ? now.getTime() - lastFetch.getTime() > staleCutoffMs : true
      const health = !s.isActive ? 'inactive' : isStale ? 'stale' : 'healthy'
      return {
        id: s.id,
        name: s.name,
        platform: s.platform,
        feedUrl: s.feedUrl,
        avatarUrl: s.avatarUrl,
        isActive: s.isActive,
        refreshIntervalMins: s.refreshIntervalMins,
        lastFetchedAt: lastFetch,
        itemCount: s._count.items,
        health,
      }
    })

    const totalItems = enriched.reduce((s, src) => s + src.itemCount, 0)
    const activeCount = enriched.filter((s) => s.isActive).length
    const staleCount = enriched.filter((s) => s.health === 'stale').length

    return reply.send({
      sources: enriched,
      summary: { total: enriched.length, active: activeCount, stale: staleCount, totalItems },
    })
  })

  // GET /internal/sources/:id/items — paginated items for a single source
  app.get('/internal/sources/:id/items', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const query = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    }).parse(req.query)

    const skip = (query.page - 1) * query.limit

    const [items, total] = await Promise.all([
      db.contentItem.findMany({
        where: { sourceId: id },
        select: {
          id: true,
          title: true,
          contentType: true,
          sourceUrl: true,
          publishedAt: true,
          fetchedAt: true,
          topics: true,
          importanceScore: true,
          _count: { select: { playerMentions: true } },
        },
        orderBy: { fetchedAt: 'desc' },
        skip,
        take: query.limit,
      }),
      db.contentItem.count({ where: { sourceId: id } }),
    ])

    return reply.send({ items, total, page: query.page, pages: Math.ceil(total / query.limit) })
  })

  // GET /internal/content/stats — aggregate content analytics (last 30 days)
  app.get('/internal/content/stats', { preHandler: adminGuard }, async (_req, reply) => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    const [recentItems, platformAgg, typeAgg, topMentions, totalItems, totalSources, activeSources] = await Promise.all([
      db.contentItem.findMany({
        where: { fetchedAt: { gte: thirtyDaysAgo } },
        select: { contentType: true, fetchedAt: true, topics: true, source: { select: { platform: true } } },
        orderBy: { fetchedAt: 'asc' },
      }),
      db.contentItem.groupBy({
        by: ['sourceId'],
        where: { source: { isNot: null } },
        _count: { id: true },
      }),
      db.contentItem.groupBy({
        by: ['contentType'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      db.contentPlayerMention.groupBy({
        by: ['playerId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 20,
      }),
      db.contentItem.count(),
      db.contentSource.count(),
      db.contentSource.count({ where: { isActive: true } }),
    ])

    // Build daily buckets
    const dailyMap = new Map<string, { date: string; [contentType: string]: number | string }>()
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      dailyMap.set(key, { date: key })
    }
    for (const item of recentItems) {
      const key = item.fetchedAt.toISOString().slice(0, 10)
      const bucket = dailyMap.get(key)
      if (bucket) {
        const current = bucket[item.contentType]
        bucket[item.contentType] = (typeof current === 'number' ? current : 0) + 1
      }
    }

    // Topic distribution
    const topicMap = new Map<string, number>()
    for (const item of recentItems) {
      for (const topic of item.topics) {
        topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1)
      }
    }
    const topics = Array.from(topicMap.entries())
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)

    // Platform distribution from recent items
    const platformMap = new Map<string, number>()
    for (const item of recentItems) {
      const platform = item.source?.platform ?? 'unknown'
      platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1)
    }

    // Resolve top player mentions with names
    const playerIds = topMentions.map((m) => m.playerId)
    const players = await db.player.findMany({
      where: { sleeperId: { in: playerIds } },
      select: { sleeperId: true, firstName: true, lastName: true, position: true, team: true },
    })
    const playerMap = new Map(players.map((p) => [p.sleeperId, p]))
    const topPlayers = topMentions.map((m) => ({
      playerId: m.playerId,
      name: playerMap.has(m.playerId)
        ? `${playerMap.get(m.playerId)!.firstName} ${playerMap.get(m.playerId)!.lastName}`
        : m.playerId,
      position: playerMap.get(m.playerId)?.position ?? '',
      team: playerMap.get(m.playerId)?.team ?? '',
      mentions: m._count.id,
    }))

    return reply.send({
      summary: {
        totalItems,
        itemsThisWeek: recentItems.filter((i) => i.fetchedAt >= weekStart).length,
        totalSources,
        activeSources,
        avgItemsPerSource: activeSources > 0 ? Math.round(totalItems / activeSources) : 0,
        uniquePlayersMentioned: (await db.contentPlayerMention.groupBy({ by: ['playerId'] })).length,
      },
      daily: Array.from(dailyMap.values()),
      byContentType: typeAgg.map((r) => ({ type: r.contentType, count: r._count.id })),
      byPlatform: Array.from(platformMap.entries()).map(([platform, count]) => ({ platform, count })),
      topics,
      topPlayers,
    })
  })

  // POST /internal/sources — create a new content source
  app.post('/internal/sources', { preHandler: adminGuard }, async (req, reply) => {
    const body = z.object({
      name: z.string().min(1).max(200),
      platform: z.enum(['rss', 'youtube', 'twitter', 'podcast', 'reddit', 'api', 'manual']),
      feedUrl: z.string().min(1),
      refreshIntervalMins: z.number().int().min(5).max(1440).default(60),
      isActive: z.boolean().default(true),
      avatarUrl: z.string().url().optional(),
      platformConfig: z.record(z.string(), z.unknown()).default({}),
    }).safeParse(req.body)

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error.flatten() })
    }

    const existing = await db.contentSource.findFirst({
      where: { platform: body.data.platform, feedUrl: body.data.feedUrl },
    })
    if (existing) {
      return reply.status(409).send({ error: 'Source with this platform + feedUrl already exists', id: existing.id })
    }

    const source = await db.contentSource.create({
      data: {
        name: body.data.name,
        platform: body.data.platform,
        feedUrl: body.data.feedUrl,
        refreshIntervalMins: body.data.refreshIntervalMins,
        isActive: body.data.isActive,
        avatarUrl: body.data.avatarUrl ?? null,
        platformConfig: body.data.platformConfig as Record<string, string>,
      },
    })

    return reply.status(201).send(source)
  })

  // PUT /internal/sources/:id — update an existing source
  app.put('/internal/sources/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const body = z.object({
      name: z.string().min(1).max(200).optional(),
      feedUrl: z.string().min(1).optional(),
      refreshIntervalMins: z.number().int().min(5).max(1440).optional(),
      isActive: z.boolean().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      platformConfig: z.record(z.string(), z.unknown()).optional(),
    }).safeParse(req.body)

    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid input', details: body.error.flatten() })
    }

    const existing = await db.contentSource.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ error: 'Source not found' })

    const updated = await db.contentSource.update({
      where: { id },
      data: {
        ...(body.data.name !== undefined && { name: body.data.name }),
        ...(body.data.feedUrl !== undefined && { feedUrl: body.data.feedUrl }),
        ...(body.data.refreshIntervalMins !== undefined && { refreshIntervalMins: body.data.refreshIntervalMins }),
        ...(body.data.isActive !== undefined && { isActive: body.data.isActive }),
        ...(body.data.avatarUrl !== undefined && { avatarUrl: body.data.avatarUrl }),
        ...(body.data.platformConfig !== undefined && {
          platformConfig: { ...(existing.platformConfig as Record<string, unknown>), ...body.data.platformConfig } as Record<string, string>,
        }),
      },
    })

    return reply.send(updated)
  })

  // DELETE /internal/sources/:id — remove source and cascade items
  app.delete('/internal/sources/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const existing = await db.contentSource.findUnique({ where: { id } })
    if (!existing) return reply.status(404).send({ error: 'Source not found' })

    // Cascade: delete content items first (playerMentions cascade from items)
    await db.contentItem.deleteMany({ where: { sourceId: id } })
    await db.contentSource.delete({ where: { id } })

    return reply.send({ success: true, deleted: id })
  })

  // POST /internal/sources/:id/refresh — enqueue a targeted content refresh
  app.post('/internal/sources/:id/refresh', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const source = await db.contentSource.findUnique({ where: { id } })
    if (!source) return reply.status(404).send({ error: 'Source not found' })

    const queue = getIngestionQueue()
    const job = await queue.add(
      'content-refresh-targeted',
      { type: IngestionJobTypes.CONTENT_REFRESH },
    )

    return reply.send({ success: true, jobId: job.id, sourceId: id, sourceName: source.name })
  })

  // GET /internal/queue — BullMQ queue stats
  app.get('/internal/queue', { preHandler: adminGuard }, async (_req, reply) => {
    try {
      const agentQueue = getAgentQueue()
      const ingestionQueue = getIngestionQueue()
      const [agentCounts, ingestionCounts] = await Promise.all([
        agentQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
        ingestionQueue.getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed'),
      ])
      return reply.send({
        agents: {
          waiting: agentCounts.waiting ?? 0,
          active: agentCounts.active ?? 0,
          completed: agentCounts.completed ?? 0,
          failed: agentCounts.failed ?? 0,
          delayed: agentCounts.delayed ?? 0,
        },
        ingestion: {
          waiting: ingestionCounts.waiting ?? 0,
          active: ingestionCounts.active ?? 0,
          completed: ingestionCounts.completed ?? 0,
          failed: ingestionCounts.failed ?? 0,
          delayed: ingestionCounts.delayed ?? 0,
        },
      })
    } catch {
      return reply.send({
        agents: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, error: 'Redis unavailable' },
        ingestion: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0, error: 'Redis unavailable' },
      })
    }
  })
}
