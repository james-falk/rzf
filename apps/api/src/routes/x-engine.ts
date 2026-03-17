import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { XConnector } from '@rzf/connectors/twitter'
import { requireAdminSecret } from '../middleware/auth.js'

async function adminGuard(
  req: Parameters<typeof requireAdminSecret>[0],
  reply: Parameters<typeof requireAdminSecret>[1],
): Promise<void> {
  return requireAdminSecret(req, reply)
}

// Per-label AI reply system prompts
const REPLY_SYSTEM_PROMPTS: Record<string, string> = {
  rostermind:
    'You are RosterMind, an AI-powered fantasy football assistant from Red Zone Fantasy. Reply to the user\'s fantasy question in a concise, helpful, and confident tone. Keep replies under 200 characters. Include a reference to rzf.gg/chat when you\'d recommend they run a deeper analysis. Use 1-2 relevant hashtags like #FantasyFootball. Never be spammy.',
  directory:
    'You are RZF Directory, a fantasy football resource hub from Red Zone Fantasy. Reply with a helpful tip and, when relevant, point to tools or rankings at rzf.gg. Keep replies under 200 characters. Use 1-2 hashtags like #FantasyFootball. Be informative and punchy — no fluff.',
  custom:
    'You are a fantasy football AI assistant from Red Zone Fantasy (rzf.gg). Reply to the user\'s question helpfully. Keep replies under 200 characters. Use 1-2 relevant hashtags.',
}

// AI draft system prompts per label
const DRAFT_SYSTEM_PROMPTS: Record<string, string> = {
  rostermind:
    'You are the RosterMind social media voice — an AI fantasy football assistant. Posts should be conversational and prompt engagement (questions, polls, "Who would you start?"). Keep under 240 characters. Use #FantasyFootball #RosterMind. Max 1-2 emojis.',
  directory:
    'You are RZF Directory — a fantasy football data and tools hub. Posts should be authoritative, stat-driven, and actionable (rankings, waiver pickups, start/sit advice). Keep under 240 characters. Use #FantasyFootball #NFL. Max 1-2 emojis.',
  custom:
    'You are a fantasy football social media expert. Write punchy, engaging Twitter/X posts. Keep under 240 characters. Use #FantasyFootball. Max 1-2 emojis.',
}

const ACCOUNT_SELECT = {
  id: true,
  handle: true,
  xUserId: true,
  label: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  tokenExpiry: true,
} as const

export async function xEngineRoutes(app: FastifyInstance): Promise<void> {

  // ── Accounts ──────────────────────────────────────────────────────────────────

  // GET /internal/x/accounts — list all connected accounts
  app.get('/internal/x/accounts', { preHandler: adminGuard }, async (_req, reply) => {
    const accounts = await db.xAccount.findMany({
      where: { isActive: true },
      select: ACCOUNT_SELECT,
      orderBy: { createdAt: 'asc' },
    })
    const isConfigured = !!(process.env['X_CLIENT_ID'] && process.env['X_CLIENT_SECRET'])
    const tierNote = 'Free tier: 500 posts/month write, 100 reads/month. Upgrade to Basic ($100/mo) for full ingestion.'
    return reply.send({ accounts, isConfigured, tierNote })
  })

  // GET /internal/x/account — single account (backwards compat); accepts ?label= or ?id=
  app.get('/internal/x/account', { preHandler: adminGuard }, async (req, reply) => {
    const { label, id } = req.query as { label?: string; id?: string }
    const where = id ? { id } : label ? { label, isActive: true } : { isActive: true }
    const account = await db.xAccount.findFirst({
      where,
      select: ACCOUNT_SELECT,
    })
    const isConfigured = !!(process.env['X_CLIENT_ID'] && process.env['X_CLIENT_SECRET'])
    const tierNote = 'Free tier: 500 posts/month write, 100 reads/month. Upgrade to Basic ($100/mo) for full ingestion.'
    return reply.send({ account, isConfigured, tierNote })
  })

  // POST /internal/x/account — save tokens from OAuth callback; accepts label
  app.post('/internal/x/account', { preHandler: adminGuard }, async (req, reply) => {
    const bodySchema = z.object({
      code: z.string(),
      callbackUrl: z.string().url(),
      label: z.enum(['rostermind', 'directory', 'custom']).default('directory'),
    })
    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const result = await XConnector.exchangeCodeForTokens(body.data.code, body.data.callbackUrl)
    if (!result.success || !result.data) {
      return reply.status(400).send({ error: result.error ?? 'Token exchange failed' })
    }

    const verify = await XConnector.verifyCredentials(result.data.accessToken)
    if (!verify.success || !verify.data) {
      return reply.status(400).send({ error: 'Could not verify credentials' })
    }

    const tokenExpiry = new Date(Date.now() + result.data.expiresIn * 1000)

    const account = await db.xAccount.upsert({
      where: { xUserId: verify.data.id },
      create: {
        xUserId: verify.data.id,
        handle: verify.data.username,
        label: body.data.label,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        tokenExpiry,
        isActive: true,
      },
      update: {
        handle: verify.data.username,
        label: body.data.label,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken ?? undefined,
        tokenExpiry,
        isActive: true,
      },
    })

    return reply.send({ account: { id: account.id, handle: account.handle, xUserId: account.xUserId, label: account.label } })
  })

  // DELETE /internal/x/account/:id — disconnect account
  app.delete('/internal/x/account/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.xAccount.update({ where: { id }, data: { isActive: false } })
    return reply.send({ success: true })
  })

  // GET /internal/x/auth-url — generate OAuth authorization URL; accepts label in state
  app.get('/internal/x/auth-url', { preHandler: adminGuard }, async (req, reply) => {
    const { callbackUrl, label = 'directory' } = req.query as { callbackUrl?: string; label?: string }
    if (!callbackUrl) return reply.status(400).send({ error: 'callbackUrl required' })
    // Embed the label into the state so it survives the OAuth redirect
    const state = `${Math.random().toString(36).slice(2)}:${label}`
    const url = XConnector.buildAuthUrl(callbackUrl, state)
    return reply.send({ url, state })
  })

  // ── Scheduled Posts ───────────────────────────────────────────────────────────

  // GET /internal/x/posts — list scheduled posts; ?accountId= filter
  app.get('/internal/x/posts', { preHandler: adminGuard }, async (req, reply) => {
    const { status, page = '1', accountId } = req.query as { status?: string; page?: string; accountId?: string }
    const pageNum = Math.max(1, parseInt(page) || 1)
    const PAGE_SIZE = 20

    const where = {
      ...(status ? { status } : {}),
      ...(accountId ? { xAccountId: accountId } : {}),
    }

    const [posts, total] = await Promise.all([
      db.scheduledPost.findMany({
        where,
        orderBy: { scheduledFor: 'asc' },
        take: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
        include: { xAccount: { select: { handle: true, label: true } } },
      }),
      db.scheduledPost.count({ where }),
    ])

    return reply.send({ posts, total, pages: Math.ceil(total / PAGE_SIZE) })
  })

  // POST /internal/x/posts — create a scheduled post
  app.post('/internal/x/posts', { preHandler: adminGuard }, async (req, reply) => {
    const bodySchema = z.object({
      xAccountId: z.string(),
      content: z.string().min(1).max(280),
      postType: z.enum(['start_sit', 'waiver', 'trade', 'trending', 'matchup', 'custom']).default('custom'),
      scheduledFor: z.string().datetime(),
      mediaUrls: z.array(z.string()).optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })

    const post = await db.scheduledPost.create({
      data: {
        xAccountId: body.data.xAccountId,
        content: body.data.content,
        postType: body.data.postType,
        scheduledFor: new Date(body.data.scheduledFor),
        mediaUrls: body.data.mediaUrls ?? [],
        status: 'pending',
      },
    })

    return reply.status(201).send({ post })
  })

  // PATCH /internal/x/posts/:id — update or cancel a scheduled post
  app.patch('/internal/x/posts/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const bodySchema = z.object({
      content: z.string().min(1).max(280).optional(),
      scheduledFor: z.string().datetime().optional(),
      status: z.enum(['pending', 'cancelled']).optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const post = await db.scheduledPost.update({
      where: { id },
      data: {
        ...(body.data.content !== undefined ? { content: body.data.content } : {}),
        ...(body.data.scheduledFor !== undefined ? { scheduledFor: new Date(body.data.scheduledFor) } : {}),
        ...(body.data.status !== undefined ? { status: body.data.status } : {}),
      },
    })

    return reply.send({ post })
  })

  // POST /internal/x/posts/generate — AI-draft a tweet; uses account label for prompt voice
  app.post('/internal/x/posts/generate', { preHandler: adminGuard }, async (req, reply) => {
    const bodySchema = z.object({
      postType: z.enum(['start_sit', 'waiver', 'trade', 'trending', 'matchup', 'custom']),
      context: z.string().max(500).optional(),
      accountLabel: z.enum(['rostermind', 'directory', 'custom']).default('directory'),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const typeDescriptions: Record<string, string> = {
      start_sit: 'a Start/Sit recommendation tweet for the upcoming fantasy football week',
      waiver: 'a waiver wire pickup recommendation tweet',
      trade: 'a trade advice tweet highlighting a trending trade target',
      trending: 'a tweet about a currently trending fantasy football player',
      matchup: 'a great matchup alert tweet for fantasy football this week',
      custom: 'a fantasy football tweet',
    }

    const description = typeDescriptions[body.data.postType] ?? 'a fantasy football tweet'
    const systemPrompt = DRAFT_SYSTEM_PROMPTS[body.data.accountLabel] ?? DRAFT_SYSTEM_PROMPTS['custom']!
    const userPrompt = `Write ${description}.${body.data.context ? ` Context: ${body.data.context}` : ''} Keep it under 240 characters.`

    try {
      const result = await LLMConnector.complete({ systemPrompt, userPrompt, model: 'haiku' })
      const draft = result.content.trim().slice(0, 280)
      return reply.send({ draft })
    } catch {
      return reply.status(500).send({ error: 'Failed to generate draft' })
    }
  })

  // ── Monitor Rules ─────────────────────────────────────────────────────────────

  // GET /internal/x/rules — list monitor rules; ?accountId= filter
  app.get('/internal/x/rules', { preHandler: adminGuard }, async (req, reply) => {
    const { accountId } = req.query as { accountId?: string }
    const rules = await db.tweetMonitorRule.findMany({
      where: accountId ? { xAccountId: accountId } : {},
      orderBy: { createdAt: 'desc' },
      include: { xAccount: { select: { handle: true, label: true } } },
    })
    return reply.send({ rules })
  })

  // POST /internal/x/rules — create a monitor rule
  app.post('/internal/x/rules', { preHandler: adminGuard }, async (req, reply) => {
    const bodySchema = z.object({
      xAccountId: z.string(),
      query: z.string().min(1).max(512),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const rule = await db.tweetMonitorRule.create({
      data: { xAccountId: body.data.xAccountId, query: body.data.query },
    })

    return reply.status(201).send({ rule })
  })

  // PATCH /internal/x/rules/:id — toggle active
  app.patch('/internal/x/rules/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const bodySchema = z.object({ isActive: z.boolean() })
    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })
    const rule = await db.tweetMonitorRule.update({ where: { id }, data: { isActive: body.data.isActive } })
    return reply.send({ rule })
  })

  // DELETE /internal/x/rules/:id
  app.delete('/internal/x/rules/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.tweetMonitorRule.delete({ where: { id } })
    return reply.send({ success: true })
  })

  // POST /internal/x/rules/:id/run — pull latest tweets for a rule
  app.post('/internal/x/rules/:id/run', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const rule = await db.tweetMonitorRule.findUnique({
      where: { id },
      include: { xAccount: { select: { accessToken: true } } },
    })
    if (!rule) return reply.status(404).send({ error: 'Rule not found' })

    const result = await XConnector.searchTweets(rule.xAccount.accessToken, rule.query, 10)

    if (!result.success) {
      return reply.status(502).send({ error: result.error, rateLimited: result.rateLimited })
    }

    await db.tweetMonitorRule.update({ where: { id }, data: { lastRanAt: new Date() } })

    return reply.send({ tweets: result.data?.tweets ?? [], resultCount: result.data?.resultCount ?? 0 })
  })

  // ── Pending Replies ───────────────────────────────────────────────────────────

  // GET /internal/x/replies — ?status=, ?accountId=, ?page=
  app.get('/internal/x/replies', { preHandler: adminGuard }, async (req, reply) => {
    const { status = 'pending', page = '1', accountId } = req.query as { status?: string; page?: string; accountId?: string }
    const pageNum = Math.max(1, parseInt(page) || 1)
    const PAGE_SIZE = 20

    const where = {
      status,
      ...(accountId ? { xAccountId: accountId } : {}),
    }

    const [replies, total] = await Promise.all([
      db.pendingReply.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: PAGE_SIZE,
        skip: (pageNum - 1) * PAGE_SIZE,
        include: { xAccount: { select: { handle: true, label: true } } },
      }),
      db.pendingReply.count({ where }),
    ])

    return reply.send({ replies, total, pages: Math.ceil(total / PAGE_SIZE) })
  })

  // POST /internal/x/replies/sync — pull latest mentions; ?accountId= to target specific account
  app.post('/internal/x/replies/sync', { preHandler: adminGuard }, async (req, reply) => {
    const { accountId } = req.query as { accountId?: string }

    const account = await db.xAccount.findFirst({
      where: accountId ? { id: accountId, isActive: true } : { isActive: true },
    })
    if (!account) return reply.status(404).send({ error: 'No connected X account' })

    const result = await XConnector.getMentions(account.accessToken, account.xUserId, 20)
    if (!result.success) {
      return reply.status(502).send({ error: result.error, rateLimited: result.rateLimited })
    }

    const tweets = result.data?.tweets ?? []
    let created = 0

    for (const tweet of tweets) {
      const exists = await db.pendingReply.findUnique({ where: { tweetId: tweet.id } })
      if (exists) continue

      await db.pendingReply.create({
        data: {
          xAccountId: account.id,
          tweetId: tweet.id,
          authorHandle: tweet.authorHandle ?? tweet.authorId,
          tweetText: tweet.text,
          status: 'pending',
        },
      })
      created++
    }

    return reply.send({ synced: tweets.length, created })
  })

  // POST /internal/x/replies/:id/generate — AI-generate a reply; prompt differs by account label
  app.post('/internal/x/replies/:id/generate', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }

    const pendingReply = await db.pendingReply.findUnique({
      where: { id },
      include: { xAccount: { select: { label: true } } },
    })
    if (!pendingReply) return reply.status(404).send({ error: 'Reply not found' })

    const label = pendingReply.xAccount.label
    const systemPrompt = REPLY_SYSTEM_PROMPTS[label] ?? REPLY_SYSTEM_PROMPTS['custom']!
    const userPrompt = `The user @${pendingReply.authorHandle} posted: "${pendingReply.tweetText}"\n\nWrite a helpful fantasy football reply. Keep it under 200 characters.`

    try {
      const result = await LLMConnector.complete({ systemPrompt, userPrompt, model: 'haiku' })
      const aiReply = result.content.trim().slice(0, 280)

      await db.pendingReply.update({ where: { id }, data: { aiReply } })

      return reply.send({ aiReply })
    } catch {
      return reply.status(500).send({ error: 'Failed to generate reply' })
    }
  })

  // POST /internal/x/replies/:id/send — approve and send
  app.post('/internal/x/replies/:id/send', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const bodySchema = z.object({ content: z.string().min(1).max(280) })
    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const pendingReply = await db.pendingReply.findUnique({
      where: { id },
      include: { xAccount: true },
    })
    if (!pendingReply) return reply.status(404).send({ error: 'Reply not found' })

    const result = await XConnector.replyToTweet(
      pendingReply.xAccount.accessToken,
      pendingReply.tweetId,
      body.data.content,
    )

    if (!result.success) {
      return reply.status(502).send({ error: result.error, rateLimited: result.rateLimited })
    }

    await db.pendingReply.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date(), aiReply: body.data.content },
    })

    return reply.send({ success: true, tweetId: result.data?.id })
  })

  // PATCH /internal/x/replies/:id/skip
  app.patch('/internal/x/replies/:id/skip', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await db.pendingReply.update({ where: { id }, data: { status: 'skipped' } })
    return reply.send({ success: true })
  })

  // ── Stats ─────────────────────────────────────────────────────────────────────

  // GET /internal/x/stats — ?accountId= for per-account stats, or aggregate across all
  app.get('/internal/x/stats', { preHandler: adminGuard }, async (req, reply) => {
    const { accountId } = req.query as { accountId?: string }

    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)

    const postWhere = accountId
      ? { xAccountId: accountId }
      : {}

    const [postedThisWeek, pendingPosts, activeRules, pendingReplies] = await Promise.all([
      db.scheduledPost.count({ where: { ...postWhere, status: 'posted', updatedAt: { gte: weekStart } } }),
      db.scheduledPost.count({ where: { ...postWhere, status: 'pending' } }),
      db.tweetMonitorRule.count({ where: { ...(accountId ? { xAccountId: accountId } : {}), isActive: true } }),
      db.pendingReply.count({ where: { ...(accountId ? { xAccountId: accountId } : {}), status: 'pending' } }),
    ])

    return reply.send({ postedThisWeek, pendingPosts, activeRules, pendingReplies })
  })
}
