import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@rzf/db'
import { customFeedConfigSchema } from '@/lib/customFeedConfig'

const createBody = z.object({
  name: z.string().min(1).max(80).trim(),
  config: customFeedConfigSchema,
})

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return db.user.findUnique({ where: { clerkId } })
}

function maxFeedsForTier(tier: string): number {
  return tier === 'paid' ? 5 : 2
}

async function validateSourceIds(sourceIds: string[]): Promise<boolean> {
  const n = await db.contentSource.count({
    where: { id: { in: sourceIds }, isActive: true },
  })
  return n === sourceIds.length
}

export async function GET() {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const feeds = await db.customFeed.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, name: true, config: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json({ feeds, limit: maxFeedsForTier(user.tier), tier: user.tier })
}

export async function POST(req: Request) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof createBody>
  try {
    body = createBody.parse(await req.json())
  } catch (e) {
    return NextResponse.json({ error: 'Invalid body', details: e instanceof z.ZodError ? e.flatten() : String(e) }, { status: 400 })
  }

  const max = maxFeedsForTier(user.tier)
  const existing = await db.customFeed.count({ where: { userId: user.id } })
  if (existing >= max) {
    return NextResponse.json(
      { error: 'Feed limit reached', message: `Maximum ${max} custom feeds for your plan.` },
      { status: 403 },
    )
  }

  if (body.config.feedType === 'sources') {
    const ok = await validateSourceIds(body.config.sourceIds)
    if (!ok) return NextResponse.json({ error: 'One or more source IDs are invalid or inactive.' }, { status: 400 })
  }

  const feed = await db.customFeed.create({
    data: {
      userId: user.id,
      name: body.name,
      config: body.config as object,
    },
    select: { id: true, name: true, config: true, createdAt: true },
  })

  return NextResponse.json({ feed })
}
