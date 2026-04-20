import { NextResponse, type NextRequest } from 'next/server'
import { db } from '@rzf/db'
import { decodeFeedCursor, encodeFeedCursor, FEED_PAGE_SIZE } from '@/lib/feed-cursor'

const MAX_SOURCE_IDS = 200

const TIER_WEIGHTS: Record<number, number> = { 1: 3.0, 2: 1.5, 3: 1.0 }

function tierWeightedScore(tier: number | null | undefined, publishedAt: Date | null): number {
  const weight = TIER_WEIGHTS[tier ?? 3] ?? 1.0
  const ageHours = publishedAt ? (Date.now() - publishedAt.getTime()) / 3_600_000 : 9999
  return weight * Math.exp(-ageHours / 24)
}

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
        select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true, tier: true },
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

  // Sort by tier-weighted recency score: tierWeight * exp(-ageHours / 24)
  // Tier 1 (premium) = 3.0x, Tier 2 (established) = 1.5x, Tier 3 (general) = 1.0x
  const scored = items.sort(
    (a, b) =>
      tierWeightedScore(b.source?.tier, b.publishedAt) -
      tierWeightedScore(a.source?.tier, a.publishedAt),
  )

  const last = scored[scored.length - 1]
  const nextCursor =
    last?.publishedAt && scored.length === FEED_PAGE_SIZE
      ? encodeFeedCursor(last.publishedAt, last.id)
      : null

  return NextResponse.json({
    items: scored.map((it) => ({
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
