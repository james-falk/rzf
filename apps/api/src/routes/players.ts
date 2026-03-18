import type { FastifyInstance } from 'fastify'
import { db } from '@rzf/db'
import { requireAuth } from '../middleware/auth.js'

export async function playersRoutes(app: FastifyInstance): Promise<void> {
  // GET /players/search?q=&position= — search players by name/position
  app.get('/players/search', { preHandler: requireAuth }, async (req, reply) => {
    const { q, position } = req.query as { q?: string; position?: string }

    if (!q || q.trim().length < 2) {
      return reply.send({ players: [] })
    }

    const query = q.trim()
    const pos = position?.toUpperCase()
    const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'FB']

    const players = await db.player.findMany({
      where: {
        team: { not: null },
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
        ],
        ...(pos && VALID_POSITIONS.includes(pos) ? { position: pos } : {}),
      },
      select: {
        sleeperId: true,
        firstName: true,
        lastName: true,
        position: true,
        team: true,
        injuryStatus: true,
        searchRank: true,
      },
      orderBy: [{ searchRank: 'asc' }, { lastName: 'asc' }],
      take: 30,
    })

    return reply.send({
      players: players.map((p) => ({
        player_id: p.sleeperId,
        full_name: `${p.firstName} ${p.lastName}`.trim(),
        position: p.position ?? '',
        team: p.team,
        injuryStatus: p.injuryStatus,
      })),
    })
  })
}
