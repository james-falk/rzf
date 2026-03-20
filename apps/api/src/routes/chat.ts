import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { runChatAgent } from '@rzf/agents/chat'
import { writeLearningSignal } from '@rzf/agents/context-revision'
import { requireAuth } from '../middleware/auth.js'

const FAILURE_PHRASES = ["can't", "cannot", "unable to", "don't have access", "not sure how to", "i don't know how"]
const AGENT_INTENT_PATTERNS = /\b(scout|compare|add to trade|waiver|lineup|start|sit|trade analysis|injury)\b/i

async function detectChatFailure(userMessage: string, output: Awaited<ReturnType<typeof runChatAgent>>) {
  if (output.type !== 'answer') return

  const reply = output.reply.toLowerCase()
  const hasFailurePhrase = FAILURE_PHRASES.some((p) => reply.includes(p))
  const answeredWhenShouldRoute = AGENT_INTENT_PATTERNS.test(userMessage) && output.type === 'answer'

  if (!hasFailurePhrase && !answeredWhenShouldRoute) return

  const detectedPattern = hasFailurePhrase
    ? 'failure_phrase_in_answer'
    : 'answered_when_should_have_routed'

  await writeLearningSignal({
    agentType: 'chat',
    signalType: 'chat_failure',
    userMessage: userMessage.slice(0, 500),
    agentResponse: output.reply.slice(0, 500),
    detectedPattern,
  })
}

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // POST /agents/chat — general-purpose conversational assistant
  // No credit cost. Answers questions about the user's team or routes to a specialist agent.
  app.post('/agents/chat', { preHandler: requireAuth }, async (req, reply) => {
    const user = req.authUser!

    const bodySchema = z.object({
      message: z.string().min(1).max(1000),
      leagueId: z.string().optional(),
      sessionId: z.string().optional(),
      reportContext: z
        .object({
          agentType: z.string(),
          runId: z.string(),
        })
        .optional(),
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
        reportContext: body.data.reportContext,
      })

      // Chat failure signal detection — fire-and-forget, never blocks response
      detectChatFailure(body.data.message, output).catch(() => {})

      return reply.send(output)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      app.log.error({ err }, '[chat] Agent error')
      return reply.status(500).send({ error: 'Chat agent failed', message: msg })
    }
  })
}
