import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { runChatAgent } from '@rzf/agents/chat'
import { requireAuth } from '../middleware/auth.js'

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/chat — general-purpose conversational assistant
  // No credit cost. Answers questions about the user's team or routes to a specialist agent.
  app.post('/agents/chat', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!

    const bodySchema = z.object({
      message: z.string().min(1).max(1000),
      leagueId: z.string().optional(),
      sessionId: z.string().optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    try {
      const output = await runChatAgent({
        userId: user.userId,
        message: body.data.message,
        leagueId: body.data.leagueId,
        sessionId: body.data.sessionId,
      })

      return reply.send(output)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      app.log.error({ err }, '[chat] Agent error')
      return reply.status(500).send({ error: 'Chat agent failed', message: msg })
    }
  })
}
