import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { requireAuth } from '../middleware/auth.js'

const connectSleeperBody = z.object({
  username: z.string().min(1),
  season: z.string().regex(/^\d{4}$/).default('2025'),
})

export async function sleeperRoutes(app: FastifyInstance): Promise<void> {
  // POST /sleeper/connect — link a Sleeper username to the current user
  app.post('/sleeper/connect', { preHandler: requireAuth }, async (req, reply) => {
    const body = connectSleeperBody.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const { username, season } = body.data

    try {
      // Resolve username → user_id via Sleeper API
      const sleeperUser = await SleeperConnector.getUser(username)

      // Fetch all leagues for this user/season
      const leagues = await SleeperConnector.getLeaguesForUser(sleeperUser.user_id, season)

      // Upsert in our DB (allows reconnecting / updating)
      const leaguesJson = JSON.parse(JSON.stringify(leagues))
      const profile = await db.sleeperProfile.upsert({
        where: { userId: req.authUser!.userId },
        create: {
          userId: req.authUser!.userId,
          sleeperId: sleeperUser.user_id,
          displayName: sleeperUser.display_name,
          leagues: leaguesJson,
        },
        update: {
          sleeperId: sleeperUser.user_id,
          displayName: sleeperUser.display_name,
          leagues: leaguesJson,
        },
      })

      return reply.send({ profile })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect Sleeper account'
      return reply.status(400).send({ error: message })
    }
  })

  // GET /sleeper/leagues?season=YYYY — get linked leagues for current user
  // If ?season= is provided, fetches live from Sleeper for that year.
  // Without ?season=, returns the cached leagues from the initial connect.
  app.get('/sleeper/leagues', { preHandler: requireAuth }, async (req, reply) => {
    const { season } = req.query as { season?: string }

    const profile = await db.sleeperProfile.findUnique({
      where: { userId: req.authUser!.userId },
    })
    if (!profile) {
      return reply.status(404).send({ error: 'No Sleeper account connected' })
    }

    if (season && /^\d{4}$/.test(season)) {
      try {
        const leagues = await SleeperConnector.getLeaguesForUser(profile.sleeperId, season)
        return reply.send({ leagues })
      } catch {
        return reply.status(502).send({ error: `Failed to fetch leagues for season ${season}` })
      }
    }

    return reply.send({ leagues: profile.leagues })
  })
}
