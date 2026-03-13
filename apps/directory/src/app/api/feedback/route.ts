import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()

  const body = await req.json() as { message?: string; pageUrl?: string }
  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  let userEmail: string | null = null
  let userTier: string | null = null
  let dbUserId: string | null = null

  if (clerkId) {
    try {
      const user = await db.user.findUnique({ where: { clerkId }, select: { id: true, email: true, tier: true } })
      if (user) {
        dbUserId = user.id
        userEmail = user.email
        userTier = user.tier
      }
    } catch { /* non-critical */ }
  }

  await db.feedback.create({
    data: {
      app: 'directory',
      message: body.message.trim().slice(0, 2000),
      pageUrl: body.pageUrl ?? null,
      userId: dbUserId,
      userEmail,
      userTier,
    },
  })

  return NextResponse.json({ success: true }, { status: 201 })
}
