import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@rzf/db'
import { decodeMentionCursor, encodeMentionCursor } from '@/lib/mention-cursor'

const PAGE_SIZE = 20

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: playerId } = await ctx.params
  const cursor = decodeMentionCursor(req.nextUrl.searchParams.get('cursor'))

  const rows = await db.contentPlayerMention.findMany({
    where: {
      playerId,
      ...(cursor
        ? {
            OR: [
              { content: { publishedAt: { lt: new Date(cursor.p) } } },
              {
                AND: [
                  { content: { publishedAt: new Date(cursor.p) } },
                  { contentId: { lt: cursor.cid } },
                ],
              },
            ],
          }
        : {}),
    },
    include: {
      content: {
        include: { source: true },
      },
    },
    orderBy: [{ content: { publishedAt: 'desc' } }, { contentId: 'desc' }],
    take: PAGE_SIZE,
  })

  const last = rows[rows.length - 1]
  const lastPub = last?.content.publishedAt
  const nextCursor =
    last && lastPub && rows.length === PAGE_SIZE ? encodeMentionCursor(lastPub, last.contentId) : null

  return NextResponse.json({
    items: rows.map((r) => {
      const c = r.content
      const s = c.source
      return {
        id: c.id,
        title: c.title,
        summary: c.summary,
        sourceUrl: c.sourceUrl,
        publishedAt: c.publishedAt?.toISOString() ?? null,
        thumbnailUrl: c.thumbnailUrl,
        source: s
          ? {
              name: s.name,
              avatarUrl: s.avatarUrl,
              feedUrl: s.feedUrl,
            }
          : null,
      }
    }),
    nextCursor,
  })
}
