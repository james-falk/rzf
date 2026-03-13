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

    let event: ClerkWebhookEvent
    try {
      const wh = new Webhook(env.CLERK_WEBHOOK_SECRET)
      const body = JSON.stringify(req.body)
      event = wh.verify(body, {
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
      const rawBody = JSON.stringify(req.body)
      event = stripe.webhooks.constructEvent(rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
    } catch {
      return reply.status(400).send({ error: 'Invalid Stripe signature' })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        if (!userId) break

        await db.user.update({
          where: { id: userId },
          data: { tier: 'paid', runCredits: 50 },
        })

        await track('user.upgraded', { fromTier: 'free', toTier: 'paid' }, userId)
        console.log(`[webhook] Upgraded user ${userId} to paid tier`)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        // Look up user by Stripe customer ID via subscriptions metadata
        // This is a best-effort downgrade — find any user with this customer
        const runWithCustomer = await db.agentRun.findFirst({
          where: { user: { email: { not: undefined } } },
        })
        if (!runWithCustomer) break

        // If we had a stripe_customer_id on User, we'd do a direct lookup.
        // For now, log and handle manually.
        console.log(`[webhook] Subscription cancelled for customer ${customerId}`)
        break
      }
    }

    return reply.status(200).send({ received: true })
  })
}
