import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@rzf/db'
import { auth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    const { itemType, itemId, code } = await req.json() as {
      itemType: string
      itemId: string
      code: string
    }

    if (!itemType || !itemId || !code) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { userId: clerkId } = await auth()

    // Look up internal user ID if signed in
    let userId: string | null = null
    if (clerkId) {
      const user = await db.user.findUnique({ where: { clerkId }, select: { id: true } })
      userId = user?.id ?? null
    }

    await db.analyticsEvent.create({
      data: {
        eventType: 'promo.click',
        userId,
        payload: { itemType, itemId, code },
      },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
