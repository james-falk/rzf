import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { db } from '@rzf/db'
import { requireAuth } from '../middleware/auth.js'

const preferencesBody = z.object({
  leagueStyle: z.enum(['redraft', 'keeper', 'dynasty']).optional(),
  scoringPriority: z.enum(['ppr', 'half_ppr', 'standard']).optional(),
  playStyle: z.enum(['safe_floor', 'balanced', 'boom_bust']).optional(),
  reportFormat: z.enum(['detailed', 'concise']).optional(),
  priorityPositions: z.array(z.string()).optional(),
  customInstructions: z.string().max(500).nullable().optional(),
  notifyOnInjury: z.boolean().optional(),
  notifyOnTrending: z.boolean().optional(),
})

export async function preferencesRoutes(app: FastifyInstance): Promise<void> {
  // GET /preferences — get current user preferences
  app.get('/preferences', { preHandler: requireAuth }, async (req, reply) => {
    const prefs = await db.userPreferences.findUnique({
      where: { userId: req.authUser!.userId },
    })
    return reply.send({ preferences: prefs })
  })

  // PUT /preferences — upsert user preferences
  app.put('/preferences', { preHandler: requireAuth }, async (req, reply) => {
    const body = preferencesBody.safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid preferences', details: body.error.flatten() })
    }

    const userId = req.authUser!.userId
    const data = body.data

    const prefs = await db.userPreferences.upsert({
      where: { userId },
      create: {
        userId,
        leagueStyle: data.leagueStyle ?? 'redraft',
        scoringPriority: data.scoringPriority ?? 'ppr',
        playStyle: data.playStyle ?? 'balanced',
        reportFormat: data.reportFormat ?? 'detailed',
        priorityPositions: data.priorityPositions ?? [],
        customInstructions: data.customInstructions ?? null,
        notifyOnInjury: data.notifyOnInjury ?? false,
        notifyOnTrending: data.notifyOnTrending ?? false,
      },
      update: {
        ...(data.leagueStyle != null && { leagueStyle: data.leagueStyle }),
        ...(data.scoringPriority != null && { scoringPriority: data.scoringPriority }),
        ...(data.playStyle != null && { playStyle: data.playStyle }),
        ...(data.reportFormat != null && { reportFormat: data.reportFormat }),
        ...(data.priorityPositions != null && { priorityPositions: data.priorityPositions }),
        ...('customInstructions' in data && { customInstructions: data.customInstructions ?? null }),
        ...(data.notifyOnInjury != null && { notifyOnInjury: data.notifyOnInjury }),
        ...(data.notifyOnTrending != null && { notifyOnTrending: data.notifyOnTrending }),
      },
    })

    return reply.send({ preferences: prefs })
  })
}
