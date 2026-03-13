import type { FastifyInstance } from 'fastify'
import Stripe from 'stripe'
import { z } from 'zod'
import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'
import { requireAuth } from '../middleware/auth.js'

function getStripe(): Stripe {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(env.STRIPE_SECRET_KEY)
}

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  // POST /billing/checkout — create a Stripe Checkout Session and return the URL
  app.post('/billing/checkout', { preHandler: requireAuth }, async (req, reply) => {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_PRICE_ID) {
      return reply.status(503).send({ error: 'Payments not configured' })
    }

    const body = z.object({ successUrl: z.string().url(), cancelUrl: z.string().url() }).safeParse(req.body)
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid request', details: body.error.flatten() })
    }

    const userId = req.authUser!.userId
    const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
    if (!user) return reply.status(404).send({ error: 'User not found' })

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      customer_email: user.email,
      allow_promotion_codes: true,
      success_url: body.data.successUrl,
      cancel_url: body.data.cancelUrl,
      metadata: { userId },
    })

    return reply.send({ url: session.url, sessionId: session.id })
  })
}
