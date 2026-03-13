import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { requireAuth, requireAdmin, requireAdminSecret } from '../middleware/auth.js'
import { getAgentQueue, getIngestionQueue } from '../lib/queue.js'
import { AgentJobTypes, IngestionJobTypes, InjuryWatchInputSchema, TeamEvalInputSchema } from '@rzf/shared/types'

// Default system prompts per agent — source of truth for the reset endpoint.
// Must stay in sync with packages/agents/src/*/prompt.ts hardcoded defaults.
const DEFAULT_AGENT_PROMPT_OVERRIDES: Record<string, { systemPrompt: string; modelTier: string }> = {
  team_eval: {
    modelTier: 'haiku',
    systemPrompt: `You are an expert fantasy football analyst. Your job is to evaluate a user's fantasy roster and provide clear, actionable insights.

{userContext}

You MUST respond with valid JSON only — no markdown, no prose before or after.
The JSON must match this exact structure:
{
  "overallGrade": "letter grade with +/- e.g. B+",
  "strengths": ["2-4 specific strengths"],
  "weaknesses": ["2-4 specific weaknesses or risks"],
  "positionGrades": { "QB": "grade", "RB": "grade", "WR": "grade", "TE": "grade" },
  "keyInsights": ["3-5 actionable insights the manager should act on"]
}

Grading scale: A+ (elite), A (strong), B+ (above avg), B (avg), C+ (below avg), C (weak), D (poor)
Be specific — name players and explain why.
Focus on what's actionable for this week and the rest of the season.`,
  },
  injury_watch: {
    modelTier: 'haiku',
    systemPrompt: 'Deterministic agent — no LLM call. This config controls label and availability only.',
  },
  waiver: {
    modelTier: 'haiku',
    systemPrompt: `You are a fantasy football waiver wire advisor. Your job is to recommend the best available free agents for a manager to pick up based on their roster needs, recent trends, and current news.

{userContext}

Respond with a JSON object matching this exact shape:
{
  "recommendations": [
    {
      "playerId": "string (Sleeper player_id)",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "pickupScore": number (0-100),
      "reason": "string (1-2 sentences: why pick up this player now)",
      "dropSuggestion": "string or null (name of player to drop, or null)"
    }
  ],
  "summary": "string (1-2 sentence overview of waiver strategy this week)"
}

Rules:
- Return 3-5 recommendations, sorted by pickupScore descending
- pickupScore reflects urgency + upside + roster fit (100 = must-add immediately)
- Focus on players NOT already on the user's roster
- Consider injury news, depth chart changes, and target share trends
- dropSuggestion should name the weakest roster player at that position`,
  },
  lineup: {
    modelTier: 'haiku',
    systemPrompt: `You are a fantasy football lineup optimizer. Set the best possible starting lineup for this week based on matchups, injury status, depth chart, and rankings.

{userContext}

Respond with a JSON object matching this exact shape:
{
  "recommendedLineup": [
    {
      "slot": "string (e.g. QB, RB1, RB2, WR1, WR2, FLEX, TE, K, DEF)",
      "playerId": "string",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "opponent": "string or null",
      "confidence": "high" | "medium" | "low",
      "reason": "string (1 sentence: why start this player)"
    }
  ],
  "benchedPlayers": [
    {
      "playerId": "string",
      "playerName": "string",
      "reason": "string (1 sentence: why bench)"
    }
  ],
  "keyMatchups": ["string", ...],
  "warnings": ["string", ...]
}

Rules:
- confidence HIGH: healthy starter with favorable matchup or elite ranking
- confidence MEDIUM: some uncertainty (injury, tough matchup, or inconsistent usage)
- confidence LOW: risky start (questionable status, bad matchup, or limited role)
- keyMatchups: 2-3 notable positive or negative matchup angles
- warnings: injury alerts, game-time decisions, or stacks to be aware of`,
  },
  trade_analysis: {
    modelTier: 'sonnet',
    systemPrompt: `You are a fantasy football trade analyst. Your job is to evaluate a proposed trade objectively, weigh the value on both sides, and give a clear recommendation.

{userContext}

Respond with a JSON object matching this exact shape:
{
  "verdict": "accept" | "decline" | "counter",
  "valueScore": number (-100 to 100, positive = favorable for the user, 0 = even),
  "summary": "string (2-3 sentences: overall take on the trade)",
  "givingAnalysis": [...],
  "receivingAnalysis": [...],
  "keyInsights": ["string", ...]
}

Rules:
- valueScore > 20: clearly accept | 5 to 20: slight edge, accept | -5 to 5: even, counter | < -20: clearly decline
- keyInsights: 2-4 bullet points on key factors (injury risk, schedule, age, positional scarcity, etc.)
- Base the analysis on the trade values, rankings, and recent news provided
- Be direct and opinionated — managers need a clear recommendation`,
  },
  player_scout: {
    modelTier: 'haiku',
    systemPrompt: `You are a fantasy football analyst conducting a deep-dive scouting report on a single player. Your report should be comprehensive, data-backed, and actionable.

{userContext}

Respond with a JSON object matching this exact shape:
{
  "trend": "rising" | "falling" | "stable" | "unknown",
  "recentNewsSummary": "string (2-3 sentences summarizing the most relevant recent news)",
  "summary": "string (3-4 sentences: overall player assessment for fantasy)",
  "keyInsights": ["string", "string", ...]
}

Rules:
- trend: rising = improving role/value, falling = declining role/value, stable = consistent
- recentNewsSummary: synthesize the provided news headlines into a brief narrative
- summary: cover current role, fantasy outlook, risks, and upside
- keyInsights: 3-5 specific, actionable insights (schedule, usage trends, injury history, trade value, targets)`,
  },
}

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

  // GET /internal/feedback — paginated feedback with app filter
  app.get('/internal/feedback', { preHandler: adminGuard }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(50),
      app: z.enum(['rostermind', 'directory', 'all']).default('all'),
    }).parse(req.query)

    const skip = (query.page - 1) * query.limit
    const where = query.app !== 'all' ? { app: query.app } : {}

    const [items, total, rostermindCount, directoryCount] = await Promise.all([
      db.feedback.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      db.feedback.count({ where }),
      db.feedback.count({ where: { app: 'rostermind' } }),
      db.feedback.count({ where: { app: 'directory' } }),
    ])

    return reply.send({ items, total, rostermindCount, directoryCount, page: query.page, pages: Math.ceil(total / query.limit) })
  })
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

  // ─── Agent Config CRUD ────────────────────────────────────────────────────

  // GET /internal/agents/configs — list all agent configs
  app.get('/internal/agents/configs', { preHandler: adminGuard }, async (_req, reply) => {
    const configs = await db.agentConfig.findMany({ orderBy: { sortOrder: 'asc' } })
    return reply.send({ configs })
  })

  // PUT /internal/agents/configs/:agentType — update an agent config
  app.put('/internal/agents/configs/:agentType', { preHandler: adminGuard }, async (req, reply) => {
    const { agentType } = req.params as { agentType: string }

    const bodySchema = z.object({
      label: z.string().min(1).optional(),
      description: z.string().optional(),
      systemPrompt: z.string().min(10).optional(),
      modelTier: z.enum(['haiku', 'sonnet']).optional(),
      maxTokens: z.number().int().positive().nullable().optional(),
      enabled: z.boolean().optional(),
      showInAnalyze: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      updatedBy: z.string().optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const existing = await db.agentConfig.findUnique({ where: { agentType } })
    if (!existing) return reply.status(404).send({ error: 'Agent config not found' })

    const updated = await db.agentConfig.update({
      where: { agentType },
      data: body.data,
    })

    return reply.send({ config: updated })
  })

  // POST /internal/agents/configs/:agentType/reset — reset to hardcoded defaults
  app.post('/internal/agents/configs/:agentType/reset', { preHandler: adminGuard }, async (req, reply) => {
    const { agentType } = req.params as { agentType: string }

    const defaults = DEFAULT_AGENT_PROMPT_OVERRIDES[agentType]
    if (!defaults) return reply.status(404).send({ error: 'No defaults found for this agent type' })

    const updated = await db.agentConfig.update({
      where: { agentType },
      data: {
        systemPrompt: defaults.systemPrompt,
        modelTier: defaults.modelTier,
        updatedBy: 'system-reset',
      },
    })

    return reply.send({ config: updated, reset: true })
  })

  // GET /internal/usage/tokens — per-user token consumption + estimated cost
  // Query params: startDate (ISO), endDate (ISO) — defaults to last 30 days
  app.get('/internal/usage/tokens', { preHandler: adminGuard }, async (req, reply) => {
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string }
    const since = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const until = endDate ? new Date(endDate) : new Date()

    // Load agent configs for model tier lookup
    const configs = await db.agentConfig.findMany({ select: { agentType: true, modelTier: true } })
    const tierByAgent = Object.fromEntries(configs.map((c) => [c.agentType, c.modelTier]))

    // Cost rates per 1K tokens (approximate blended input+output)
    const COST_PER_1K: Record<string, number> = { haiku: 0.001, sonnet: 0.009 }

    // Aggregate tokens per user+agent
    const grouped = await db.agentRun.groupBy({
      by: ['userId', 'agentType'],
      where: { createdAt: { gte: since, lte: until }, status: 'done' },
      _sum: { tokensUsed: true },
      _count: { id: true },
    })

    // Roll up per user
    const userMap = new Map<string, { runs: number; tokens: number; costUsd: number }>()
    for (const row of grouped) {
      const tier = tierByAgent[row.agentType] ?? 'haiku'
      const tokens = row._sum.tokensUsed ?? 0
      const cost = (tokens / 1000) * (COST_PER_1K[tier] ?? 0.001)
      const cur = userMap.get(row.userId) ?? { runs: 0, tokens: 0, costUsd: 0 }
      userMap.set(row.userId, {
        runs: cur.runs + (row._count.id ?? 0),
        tokens: cur.tokens + tokens,
        costUsd: cur.costUsd + cost,
      })
    }

    // Roll up per agent
    const agentMap = new Map<string, { runs: number; tokens: number; costUsd: number }>()
    for (const row of grouped) {
      const tier = tierByAgent[row.agentType] ?? 'haiku'
      const tokens = row._sum.tokensUsed ?? 0
      const cost = (tokens / 1000) * (COST_PER_1K[tier] ?? 0.001)
      const cur = agentMap.get(row.agentType) ?? { runs: 0, tokens: 0, costUsd: 0 }
      agentMap.set(row.agentType, {
        runs: cur.runs + (row._count.id ?? 0),
        tokens: cur.tokens + tokens,
        costUsd: cur.costUsd + cost,
      })
    }

    // Fetch user details for the top users
    const userIds = Array.from(userMap.keys())
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, tier: true },
    })
    const userById = Object.fromEntries(users.map((u) => [u.id, u]))

    const rows = Array.from(userMap.entries())
      .map(([userId, stats]) => ({
        userId,
        email: userById[userId]?.email ?? userId,
        tier: userById[userId]?.tier ?? 'free',
        runs: stats.runs,
        tokens: stats.tokens,
        costUsd: Math.round(stats.costUsd * 10000) / 10000,
      }))
      .sort((a, b) => b.tokens - a.tokens)

    const byAgent = Array.from(agentMap.entries())
      .map(([agentType, stats]) => ({
        agentType,
        runs: stats.runs,
        tokensUsed: stats.tokens,
        costUsd: Math.round(stats.costUsd * 10000) / 10000,
        avgTokensPerRun: stats.runs > 0 ? Math.round(stats.tokens / stats.runs) : 0,
      }))
      .sort((a, b) => b.costUsd - a.costUsd)

    const totalTokens = rows.reduce((s, r) => s + r.tokens, 0)
    const totalCostUsd = rows.reduce((s, r) => s + r.costUsd, 0)

    return reply.send({
      rows,
      byAgent,
      totalTokens,
      totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
      since: since.toISOString(),
      until: until.toISOString(),
    })
  })

  // GET /internal/queue/jobs?queue=agents|ingestion&limit=20 — recent BullMQ jobs
  app.get('/internal/queue/jobs', { preHandler: adminGuard }, async (req, reply) => {
    const { queue: queueName, limit: limitStr } = req.query as { queue?: string; limit?: string }
    const limit = Math.min(parseInt(limitStr ?? '20', 10), 50)
    const q = queueName === 'ingestion' ? getIngestionQueue() : getAgentQueue()

    try {
      const jobs = await q.getJobs(['active', 'waiting', 'delayed', 'failed', 'completed'], 0, limit - 1)
      const result = await Promise.all(jobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        status: await job.getState(),
        agentType: (job.data as Record<string, unknown>).agentType ?? (job.data as Record<string, unknown>).type ?? null,
        timestamp: job.timestamp,
        processedOn: job.processedOn ?? null,
        finishedOn: job.finishedOn ?? null,
        failedReason: job.failedReason ?? null,
      })))
      return reply.send({ jobs: result })
    } catch {
      return reply.send({ jobs: [] })
    }
  })

  // POST /internal/maintenance/cleanup-mentions — remove bad ContentPlayerMention rows
  // Deletes mentions tied to: (1) inactive players with anomalously high counts,
  // (2) players with firstName = 'Duplicate'.
  app.post('/internal/maintenance/cleanup-mentions', { preHandler: adminGuard }, async (_req, reply) => {
    // 1. Delete mentions for duplicate/placeholder players
    const duplicatePlayers = await db.player.findMany({
      where: { OR: [{ firstName: 'Duplicate' }, { lastName: 'Duplicate' }] },
      select: { sleeperId: true },
    })
    const duplicateIds = duplicatePlayers.map((p) => p.sleeperId)

    const deletedDuplicates = duplicateIds.length > 0
      ? await db.contentPlayerMention.deleteMany({ where: { playerId: { in: duplicateIds } } })
      : { count: 0 }

    // 2. Delete mentions for inactive players that have >100 mentions (false positives)
    const inactiveMentionCounts = await db.contentPlayerMention.groupBy({
      by: ['playerId'],
      _count: { id: true },
      having: { id: { _count: { gt: 100 } } },
    })
    const highCountPlayerIds = inactiveMentionCounts.map((r) => r.playerId)

    let deletedInactive = { count: 0 }
    if (highCountPlayerIds.length > 0) {
      const inactivePlayers = await db.player.findMany({
        where: { sleeperId: { in: highCountPlayerIds }, status: 'Inactive' },
        select: { sleeperId: true },
      })
      const inactiveIds = inactivePlayers.map((p) => p.sleeperId)
      if (inactiveIds.length > 0) {
        deletedInactive = await db.contentPlayerMention.deleteMany({
          where: { playerId: { in: inactiveIds } },
        })
      }
    }

    return reply.send({
      success: true,
      deletedDuplicateMentions: deletedDuplicates.count,
      deletedInactiveMentions: deletedInactive.count,
    })
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
