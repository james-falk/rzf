import type { FastifyInstance } from 'fastify'
import { db } from '@rzf/db'
import { requireAuth } from '../middleware/auth.js'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // GET /users/me — current user profile + credits
  app.get('/users/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = await db.user.findUnique({
      where: { id: req.authUser!.userId },
      include: { sleeperProfile: true, preferences: true },
    })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return reply.send({ user })
  })
}
