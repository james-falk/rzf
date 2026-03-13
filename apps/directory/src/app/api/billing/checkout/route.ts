import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripeKey = process.env['STRIPE_SECRET_KEY']
  const priceId = process.env['DIRECTORY_STRIPE_PRICE_ID']
  if (!stripeKey || !priceId) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 })
  }

  const stripe = new Stripe(stripeKey)

  const { successUrl, cancelUrl } = await req.json() as { successUrl?: string; cancelUrl?: string }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl ?? `${req.nextUrl.origin}/?upgraded=1`,
    cancel_url: cancelUrl ?? `${req.nextUrl.origin}/`,
    metadata: { clerkUserId: userId, product: 'directory_pro' },
  })

  return NextResponse.json({ url: session.url })
}
