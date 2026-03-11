import type { FastifyRequest, FastifyReply } from 'fastify'
import { verifyToken, createClerkClient } from '@clerk/backend'
import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

export interface AuthenticatedUser {
  clerkId: string
  userId: string
  tier: string
  role: string
  runCredits: number
}

declare module 'fastify' {
  interface FastifyRequest {
    authUser?: AuthenticatedUser
  }
}

/**
 * Clerk JWT authentication hook.
 * Validates the Bearer token, then looks up our DB User by clerkId.
 * Attaches the user to req.authUser.
 */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    await reply.status(401).send({ error: 'Unauthorized', message: 'Missing Bearer token' })
    return
  }

    const token = authHeader.slice(7)

  try {
    const { sub: clerkId } = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    let user = await db.user.findUnique({ where: { clerkId } })
    if (!user) {
      // Auto-provision: webhook may not have fired (local dev or missed delivery)
      const clerkUser = await clerkClient.users.getUser(clerkId)
      const email =
        clerkUser.emailAddresses.find((e) => e.verification?.status === 'verified')?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        ''
      user = await db.user.create({
        data: { clerkId, email, tier: 'free', role: 'user', runCredits: 2 },
      })
      console.log(`[auth] Auto-provisioned user for Clerk ID: ${clerkId}`)
    }

    req.authUser = {
      clerkId,
      userId: user.id,
      tier: user.tier,
      role: user.role,
      runCredits: user.runCredits,
    }
  } catch (err) {
    console.error('[auth] Token verification failed:', err instanceof Error ? err.message : err)
    await reply.status(401).send({ error: 'Unauthorized', message: 'Invalid token' })
  }
}

/**
 * Admin-only route hook. Must be used after requireAuth.
 */
export async function requireAdmin(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!req.authUser || req.authUser.role !== 'admin') {
    await reply.status(403).send({ error: 'Forbidden', message: 'Admin access required' })
  }
}

/**
 * Internal route guard — checks ADMIN_SECRET header for non-session contexts.
 * Used by OpenClaw gateway.
 */
export async function requireAdminSecret(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const secret = req.headers['x-admin-secret']
  if (secret !== env.ADMIN_SECRET) {
    await reply.status(403).send({ error: 'Forbidden' })
  }
}
