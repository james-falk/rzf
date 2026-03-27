import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@rzf/db'
import { decodeFeedCursor, encodeFeedCursor, FEED_PAGE_SIZE } from '@/lib/feed-cursor'

const MAX_SOURCE_IDS = 200

function parseSourceIdsParam(raw: string | null): string[] | null {
  if (!raw || !raw.trim()) return null
  const ids = [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))]
  if (ids.length === 0) return null
  if (ids.length > MAX_SOURCE_IDS) return null
  const safe = /^[a-zA-Z0-9_-]{1,64}$/
  if (!ids.every((id) => safe.test(id))) return null
  return ids
}

export async function GET(req: NextRequest) {
  const cursor = decodeFeedCursor(req.nextUrl.searchParams.get('cursor'))
  const sourceIds = parseSourceIdsParam(req.nextUrl.searchParams.get('sources'))
  if (req.nextUrl.searchParams.get('sources')?.trim() && sourceIds === null) {
    return NextResponse.json({ error: 'Invalid or too many sources' }, { status: 400 })
  }

  const items = await db.contentItem.findMany({
    where: {
      source: { isActive: true },
      publishedAt: { not: null },
      ...(sourceIds ? { sourceId: { in: sourceIds } } : {}),
      ...(cursor
        ? {
            OR: [
              { publishedAt: { lt: new Date(cursor.p) } },
              {
                AND: [
                  { publishedAt: new Date(cursor.p) },
                  { id: { lt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    },
    include: {
      source: {
        select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
      },
      playerMentions: {
        include: {
          player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } },
        },
        take: 6,
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: FEED_PAGE_SIZE,
  })

  const last = items[items.length - 1]
  const nextCursor =
    last?.publishedAt && items.length === FEED_PAGE_SIZE ? encodeFeedCursor(last.publishedAt, last.id) : null

  return NextResponse.json({
    items: items.map((it) => ({
      ...it,
      publishedAt: it.publishedAt?.toISOString() ?? null,
      fetchedAt: it.fetchedAt.toISOString(),
      source: it.source
        ? {
            ...it.source,
            feedUrl: it.source.feedUrl ?? null,
          }
        : null,
      playerMentions: it.playerMentions.map((m) => ({
        player: m.player,
      })),
    })),
    nextCursor,
  })
}
