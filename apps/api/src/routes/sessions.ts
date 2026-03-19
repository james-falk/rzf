import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { LLMConnector } from '@rzf/connectors/llm'
import { requireAuth } from '../middleware/auth.js'

export async function sessionsRoutes(app: FastifyInstance): Promise<void> {
  // POST /sessions — lazily create a new chat session
  app.post('/sessions', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const session = await db.chatSession.create({
      data: { userId: user.userId },
    })

    return reply.status(201).send({ sessionId: session.id })
  })

  // POST /sessions/:id/messages — append a message to a session (fire-and-forget friendly)
  app.post('/sessions/:id/messages', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const { id: sessionId } = req.params as { id: string }
    const bodySchema = z.object({
      role: z.enum(['user', 'assistant']),
      type: z.string(),
      content: z.string(),
      agentRunId: z.string().optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'Invalid request' })

    const session = await db.chatSession.findFirst({ where: { id: sessionId, userId: user.userId } })
    if (!session) return reply.status(404).send({ error: 'Session not found' })

    const message = await db.chatMessage.create({
      data: {
        sessionId,
        role: body.data.role,
        type: body.data.type,
        content: body.data.content,
        agentRunId: body.data.agentRunId ?? null,
      },
    })

    return reply.status(201).send({ messageId: message.id })
  })

  // GET /sessions — list sessions for the current user (most recent first)
  app.get('/sessions', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const sessions = await db.chatSession.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        summary: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
    })

    return reply.send({ sessions })
  })

  // POST /sessions/:id/summary — generate an LLM summary of the session
  app.post('/sessions/:id/summary', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser
    if (!user) return reply.status(401).send({ error: 'Unauthorized' })

    const { id: sessionId } = req.params as { id: string }

    const session = await db.chatSession.findFirst({
      where: { id: sessionId, userId: user.userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          where: { type: { in: ['user', 'text', 'result'] } },
        },
      },
    })

    if (!session) return reply.status(404).send({ error: 'Session not found' })
    if (session.messages.length < 2) return reply.status(422).send({ error: 'Not enough messages to summarize' })

    const transcript = session.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 300)}`)
      .join('\n')

    const systemPrompt = `You are a concise fantasy football assistant. Summarize this conversation in 2-3 sentences, highlighting the key insights and any actions the manager should take. Be direct and actionable.`
    const userPrompt = `[Chat Transcript]\n${transcript}\n\nSummarize the key takeaways from this session.`

    try {
      const result = await LLMConnector.complete({ systemPrompt, userPrompt, model: 'haiku' })
      const summary = result.content.trim()

      await db.chatSession.update({
        where: { id: sessionId },
        data: { summary },
      })

      return reply.send({ summary })
    } catch {
      return reply.status(500).send({ error: 'Failed to generate summary' })
    }
  })
}
