import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { verifyToken } from '@clerk/backend'
import { env } from '@rzf/shared/env'

function getAuthorizedParties(): string[] {
  const list = env.CORS_ORIGIN ?? 'http://localhost:3000,https://rzf-web.vercel.app'
  return list.split(',').map((o) => o.trim()).filter(Boolean)
}

async function tryGetUser(req: FastifyRequest): Promise<{ userId: string | null; userEmail: string | null; userTier: string | null }> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ') || !env.CLERK_SECRET_KEY) {
    return { userId: null, userEmail: null, userTier: null }
  }
  try {
    const token = authHeader.slice(7)
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: getAuthorizedParties(),
    })
    const clerkId = payload.sub as string
    const user = await db.user.findUnique({ where: { clerkId }, select: { id: true, email: true, tier: true } })
    if (!user) return { userId: null, userEmail: null, userTier: null }
    return { userId: user.id, userEmail: user.email, userTier: user.tier }
  } catch {
    return { userId: null, userEmail: null, userTier: null }
  }
}

export async function feedbackRoutes(app: FastifyInstance): Promise<void> {
  // POST /feedback — submit feedback (optional auth)
  app.post('/feedback', async (req: FastifyRequest, reply) => {
    const bodySchema = z.object({
      app: z.enum(['rostermind', 'directory']),
      message: z.string().min(1).max(2000),
      pageUrl: z.string().url().optional(),
    })

    const body = bodySchema.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { userId, userEmail, userTier } = await tryGetUser(req)

    await db.feedback.create({
      data: {
        app: body.data.app,
        message: body.data.message,
        pageUrl: body.data.pageUrl ?? null,
        userId,
        userEmail,
        userTier,
      },
    })

    return reply.status(201).send({ success: true })
  })
}
