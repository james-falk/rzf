import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { db } from '@rzf/db'
import { customFeedConfigSchema } from '@/lib/customFeedConfig'

const patchBody = z.object({
  name: z.string().min(1).max(80).trim().optional(),
  config: customFeedConfigSchema.optional(),
})

async function getUser() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null
  return db.user.findUnique({ where: { clerkId } })
}

async function validateSourceIds(sourceIds: string[]): Promise<boolean> {
  const n = await db.contentSource.count({
    where: { id: { in: sourceIds }, isActive: true },
  })
  return n === sourceIds.length
}

type RouteCtx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: RouteCtx) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const existing = await db.customFeed.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let body: z.infer<typeof patchBody>
  try {
    body = patchBody.parse(await req.json())
  } catch (e) {
    return NextResponse.json({ error: 'Invalid body', details: e instanceof z.ZodError ? e.flatten() : String(e) }, { status: 400 })
  }

  if (body.config?.feedType === 'sources') {
    const ok = await validateSourceIds(body.config.sourceIds)
    if (!ok) return NextResponse.json({ error: 'One or more source IDs are invalid or inactive.' }, { status: 400 })
  }

  const feed = await db.customFeed.update({
    where: { id },
    data: {
      ...(body.name ? { name: body.name } : {}),
      ...(body.config ? { config: body.config as object } : {}),
    },
    select: { id: true, name: true, config: true, updatedAt: true },
  })

  return NextResponse.json({ feed })
}

export async function DELETE(_req: Request, ctx: RouteCtx) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const deleted = await db.customFeed.deleteMany({
    where: { id, userId: user.id },
  })
  if (deleted.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
