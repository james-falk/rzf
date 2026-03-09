import type { FastifyInstance, FastifyRequest } from 'fastify'
import { Webhook } from 'svix'
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
}
