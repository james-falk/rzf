import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Webhook } from 'svix'
import Stripe from 'stripe'
import { db, track } from '@rzf/db'
import { env } from '@rzf/shared/env'

interface ClerkUserCreatedEvent {
  type: 'user.created'
  data: {
    id: string
    email_addresses: Array<{ email_address: string; verification: { status: string } | null }>
  }
}

interface ClerkUserDeletedEvent {
  type: 'user.deleted'
  data: { id: string }
}

type ClerkWebhookEvent = ClerkUserCreatedEvent | ClerkUserDeletedEvent

export async function webhooksRoutes(app: FastifyInstance): Promise<void> {
  // Stripe and Svix both verify signatures against the exact raw bytes they sent.
  // Fastify parses JSON bodies before handlers run, so re-stringifying req.body
  // produces different bytes and causes signature verification to always fail.
  // Scoping this parser inside the plugin means it only applies to /webhooks/* routes.
  app.addContentTypeParser('application/json', { parseAs: 'buffer' }, function (_req, body: Buffer, done) {
    done(null, body)
  })

  // POST /webhooks/clerk — handle Clerk user lifecycle events
  // Clerk sends svix-signed webhooks
  app.post('/webhooks/clerk', async (req: FastifyRequest, reply) => {
    if (!env.CLERK_WEBHOOK_SECRET) {
      return reply.status(500).send({ error: 'Clerk webhook not configured' })
    }

    const svixId = req.headers['svix-id'] as string
    const svixTimestamp = req.headers['svix-timestamp'] as string
    const svixSignature = req.headers['svix-signature'] as string

    if (!svixId || !svixTimestamp || !svixSignature) {
      return reply.status(400).send({ error: 'Missing svix headers' })
    }

    const rawBody = (req.body as Buffer).toString('utf8')

    let event: ClerkWebhookEvent
    try {
      const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
      event = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent
    } catch {
      return reply.status(400).send({ error: 'Invalid webhook signature' })
    }

    switch (event.type) {
      case 'user.created': {
        const primaryEmail = event.data.email_addresses.find(
          (e) => e.verification?.status === 'verified',
        )?.email_address ?? event.data.email_addresses[0]?.email_address ?? ''

        await db.user.create({
          data: {
            clerkId: event.data.id,
            email: primaryEmail,
            tier: 'free',
            role: 'user',
            runCredits: 2,
          },
        })

        await track('user.signup', { email: primaryEmail, tier: 'free' })
        console.log(`[webhook] Created user for Clerk ID: ${event.data.id}`)
        break
      }

      case 'user.deleted': {
        // Soft-delete: anonymize user data but keep agent run history for analytics
        await db.user.updateMany({
          where: { clerkId: event.data.id },
          data: { email: `deleted_${event.data.id}@deleted.invalid` },
        })
        console.log(`[webhook] Soft-deleted user with Clerk ID: ${event.data.id}`)
        break
      }
    }

    return reply.status(200).send({ received: true })
  })

  // POST /webhooks/stripe — handle Stripe subscription events
  app.post('/webhooks/stripe', async (req: FastifyRequest, reply) => {
    if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
      return reply.status(503).send({ error: 'Stripe not configured' })
    }

    const sig = req.headers['stripe-signature'] as string
    if (!sig) return reply.status(400).send({ error: 'Missing stripe-signature header' })

    let event: Stripe.Event
    try {
      const stripe = new Stripe(env.STRIPE_SECRET_KEY)
      // req.body is a raw Buffer here due to the scoped content-type parser above
      event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return reply.status(400).send({ error: 'Invalid Stripe signature' })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null

        await db.user.update({
          where: { id: userId },
          data: {
            tier: 'paid',
            runCredits: 50,
            ...(customerId ? { stripeCustomerId: customerId } : {}),
          },
        })

        await track('user.upgraded', { fromTier: 'free', toTier: 'paid' }, userId)
        console.log(`[webhook] Upgraded user ${userId} to paid tier (customer: ${customerId})`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        const user = await db.user.findFirst({ where: { stripeCustomerId: customerId } })
        if (!user) {
          console.warn(`[webhook] Subscription cancelled but no user found for customer ${customerId}`)
          break
        }

        await db.user.update({
          where: { id: user.id },
          data: { tier: 'free', runCredits: 0 },
        })

        await track('user.downgraded', { fromTier: 'paid', toTier: 'free', reason: 'subscription_cancelled' }, user.id)
        console.log(`[webhook] Downgraded user ${user.id} to free tier (subscription cancelled)`)
        break
      }
    }

    return reply.status(200).send({ received: true })
  })
}
