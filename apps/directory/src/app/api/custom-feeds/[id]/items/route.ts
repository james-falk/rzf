import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'
import { parseCustomFeedConfig } from '@/lib/customFeedConfig'
import { encodeCursor, resolveCustomFeedItems } from '@/lib/customFeedResolve'

type RouteCtx = { params: Promise<{ id: string }> }

export async function GET(req: Request, ctx: RouteCtx) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const feed = await db.customFeed.findFirst({
    where: { id, userId: user.id },
  })
  if (!feed) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let config
  try {
    config = parseCustomFeedConfig(feed.config)
  } catch {
    return NextResponse.json({ error: 'Invalid feed configuration' }, { status: 500 })
  }

  const url = new URL(req.url)
  const cursor = url.searchParams.get('cursor')
  const take = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 30))

  const { items, nextCursor, error } = await resolveCustomFeedItems(user.id, config, cursor, take)

  return NextResponse.json({
    items,
    nextCursor: encodeCursor(nextCursor),
    error,
  })
}
