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

  // POST /billing/verify-checkout — verify a completed Stripe Checkout Session and
  // immediately apply the upgrade. Called by the client on return from Stripe to
  // eliminate the webhook race condition.
  app.post('/billing/verify-checkout', { preHandler: requireAuth }, async (req, reply) => {
    if (!env.STRIPE_SECRET_KEY) {
      return reply.status(503).send({ error: 'Payments not configured' })
    }

    const body = z.object({ sessionId: z.string() }).safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'sessionId required' })

    const userId = req.authUser!.userId

    const stripe = getStripe()
    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.retrieve(body.data.sessionId)
    } catch {
      return reply.status(400).send({ error: 'Could not retrieve Stripe session' })
    }

    // Guard: only apply if this session belongs to the calling user and is paid
    if (session.metadata?.userId !== userId) {
      return reply.status(403).send({ error: 'Session does not belong to this user' })
    }
    if (session.payment_status !== 'paid') {
      return reply.status(400).send({ error: 'Session is not paid' })
    }

    // Idempotent: if already upgraded, just return current state
    const existing = await db.user.findUnique({ where: { id: userId }, select: { tier: true, runCredits: true } })
    if (existing?.tier === 'paid') {
      return reply.send({ tier: existing.tier, runCredits: existing.runCredits, alreadyApplied: true })
    }

    const customerId = typeof session.customer === 'string' ? session.customer : (session.customer as Stripe.Customer | null)?.id ?? null

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        tier: 'paid',
        runCredits: 50,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
      },
      select: { tier: true, runCredits: true },
    })

    console.log(`[billing] verify-checkout: upgraded user ${userId} to paid (session: ${session.id})`)
    return reply.send({ tier: updated.tier, runCredits: updated.runCredits })
  })
}
