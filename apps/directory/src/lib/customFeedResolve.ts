import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import type { CustomFeedConfig } from './customFeedConfig'

export type FeedCursor = { publishedAt: string; id: string } | null

const DEFAULT_TAKE = 30

function decodeCursor(q: string | null): FeedCursor {
  if (!q) return null
  try {
    const j = JSON.parse(Buffer.from(q, 'base64url').toString('utf8')) as { publishedAt?: string; id?: string }
    if (j.publishedAt && j.id) return { publishedAt: j.publishedAt, id: j.id }
  } catch { /* ignore */ }
  return null
}

export function encodeCursor(c: FeedCursor): string | null {
  if (!c) return null
  return Buffer.from(JSON.stringify({ publishedAt: c.publishedAt, id: c.id }), 'utf8').toString('base64url')
}

function cursorWhere(cursor: FeedCursor) {
  if (!cursor) return {}
  const d = new Date(cursor.publishedAt)
  return {
    OR: [
      { publishedAt: { lt: d } },
      { AND: [{ publishedAt: d }, { id: { lt: cursor.id } }] },
    ],
  }
}

async function resolvePlayerIdsForSleeper(
  userId: string,
  sleeperLeagueId: string,
): Promise<{ playerIds: string[]; error?: string }> {
  const profile = await db.sleeperProfile.findUnique({
    where: { userId },
    select: { sleeperId: true },
  })
  if (!profile) return { playerIds: [], error: 'Connect Sleeper in Account settings.' }

  try {
    const roster = await SleeperConnector.getUserRoster(sleeperLeagueId, profile.sleeperId)
    const ids = roster?.players ?? []
    if (ids.length === 0) return { playerIds: [], error: 'No players on roster for this league.' }
    return { playerIds: ids }
  } catch {
    return { playerIds: [], error: 'Could not load Sleeper roster for this league.' }
  }
}

export async function resolveCustomFeedItems(
  userId: string,
  config: CustomFeedConfig,
  cursorParam: string | null,
  take = DEFAULT_TAKE,
): Promise<{
  items: Awaited<ReturnType<typeof db.contentItem.findMany>>
  nextCursor: FeedCursor
  error?: string
}> {
  const cursor = decodeCursor(cursorParam)

  if (config.feedType === 'sleeper') {
    const { playerIds, error } = await resolvePlayerIdsForSleeper(userId, config.sleeperLeagueId)
    if (error || playerIds.length === 0) {
      return { items: [], nextCursor: null, error }
    }
    const where = {
      publishedAt: { not: null },
      ...cursorWhere(cursor),
      playerMentions: { some: { playerId: { in: playerIds } } },
    }
    const items = await db.contentItem.findMany({
      where,
      include: {
        source: {
          select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
        },
        playerMentions: {
          include: { player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } } },
          take: 6,
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    })
    const hasMore = items.length > take
    const page = hasMore ? items.slice(0, take) : items
    const last = page[page.length - 1]
    const nextCursor =
      hasMore && last?.publishedAt
        ? { publishedAt: last.publishedAt.toISOString(), id: last.id }
        : null
    return { items: page, nextCursor }
  }

  if (config.feedType === 'players') {
    const where = {
      publishedAt: { not: null },
      ...cursorWhere(cursor),
      playerMentions: { some: { playerId: { in: config.playerIds } } },
    }
    const items = await db.contentItem.findMany({
      where,
      include: {
        source: {
          select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
        },
        playerMentions: {
          include: { player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } } },
          take: 6,
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    })
    const hasMore = items.length > take
    const page = hasMore ? items.slice(0, take) : items
    const last = page[page.length - 1]
    const nextCursor =
      hasMore && last?.publishedAt
        ? { publishedAt: last.publishedAt.toISOString(), id: last.id }
        : null
    return { items: page, nextCursor }
  }

  if (config.feedType === 'team') {
    const team = config.teamAbbr
    const where = {
      publishedAt: { not: null },
      ...cursorWhere(cursor),
      playerMentions: { some: { player: { team } } },
    }
    const items = await db.contentItem.findMany({
      where,
      include: {
        source: {
          select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
        },
        playerMentions: {
          include: { player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } } },
          take: 6,
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    })
    const hasMore = items.length > take
    const page = hasMore ? items.slice(0, take) : items
    const last = page[page.length - 1]
    const nextCursor =
      hasMore && last?.publishedAt
        ? { publishedAt: last.publishedAt.toISOString(), id: last.id }
        : null
    return { items: page, nextCursor }
  }

  // sources
  const ct = config.contentTypes?.length ? config.contentTypes : undefined
  const where = {
    publishedAt: { not: null },
    sourceId: { in: config.sourceIds },
    ...cursorWhere(cursor),
    ...(ct?.length ? { contentType: { in: ct } } : {}),
  }
  const items = await db.contentItem.findMany({
    where,
    include: {
      source: {
        select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
      },
      playerMentions: {
        include: { player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } } },
        take: 6,
      },
    },
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    take: take + 1,
  })
  const hasMore = items.length > take
  const page = hasMore ? items.slice(0, take) : items
  const last = page[page.length - 1]
  const nextCursor =
    hasMore && last?.publishedAt ? { publishedAt: last.publishedAt.toISOString(), id: last.id } : null
  return { items: page, nextCursor }
}
