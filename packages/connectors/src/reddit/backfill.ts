/**
 * Reddit JSON backfill — paginate /r/{sub}/new.json to ~14 days of posts.
 * Idempotent: dedupes by permalink URL via upsertContentItemFromArticle.
 */

import { db } from '@rzf/db'
import { upsertContentItemFromArticle } from '../rss/index.js'

const USER_AGENT = 'RZF-FantasyIngest/1.0 (social content; +https://github.com)'

const MAX_PAGES = 20
const PAGE_DELAY_MS = 2000
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000

export function subredditFromFeedUrl(feedUrl: string): string | null {
  const m = feedUrl.match(/reddit\.com\/r\/([^/?#]+)/i)
  return m ? decodeURIComponent(m[1]!) : null
}

interface RedditListingChild {
  data?: {
    permalink?: string
    title?: string
    selftext?: string
    url?: string
    created_utc?: number
    author?: string
    is_self?: boolean
  }
}

interface RedditListingResponse {
  data?: {
    after?: string | null
    children?: RedditListingChild[]
  }
}

async function fetchListing(sub: string, after: string | undefined): Promise<RedditListingResponse> {
  const u = new URL(`https://www.reddit.com/r/${encodeURIComponent(sub)}/new.json`)
  u.searchParams.set('limit', '100')
  u.searchParams.set('raw_json', '1')
  if (after) u.searchParams.set('after', after)

  const res = await fetch(u.toString(), {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`Reddit HTTP ${res.status} for ${u.pathname}`)
  }
  return (await res.json()) as RedditListingResponse
}

export interface RedditBackfillResult {
  sources: number
  inserted: number
  skippedSources: number
  errors: Array<{ source: string; message: string }>
}

export async function runRedditBackfill(): Promise<RedditBackfillResult> {
  const sources = await db.contentSource.findMany({
    where: { platform: 'reddit', isActive: true },
  })

  const aliases = await db.playerAlias.findMany({
    where: { player: { status: { not: 'Inactive' } } },
    select: { alias: true, playerId: true, aliasType: true },
  })

  let inserted = 0
  let skippedSources = 0
  const errors: RedditBackfillResult['errors'] = []
  const cutoff = Date.now() - MAX_AGE_MS

  for (const source of sources) {
    const sub = subredditFromFeedUrl(source.feedUrl)
    if (!sub) {
      skippedSources++
      errors.push({ source: source.name, message: `Could not parse subreddit from feedUrl: ${source.feedUrl}` })
      continue
    }

    try {
      let after: string | undefined
      let page = 0
      let stop = false

      while (!stop && page < MAX_PAGES) {
        const json = await fetchListing(sub, after)
        const children = json.data?.children ?? []
        if (children.length === 0) break

        for (const { data: d } of children) {
          if (!d?.permalink || !d.title) continue
          const createdMs = (d.created_utc ?? 0) * 1000
          if (createdMs < cutoff) {
            stop = true
            break
          }

          const link = d.permalink.startsWith('http')
            ? d.permalink
            : `https://www.reddit.com${d.permalink}`

          const rawContent = [d.title, d.selftext ?? ''].filter(Boolean).join('\n\n')
          const publishedAt = d.created_utc ? new Date(d.created_utc * 1000) : null

          const did = await upsertContentItemFromArticle(
            { id: source.id, name: source.name },
            {
              link,
              title: d.title,
              rawContent,
              publishedAt,
              authorName: d.author ?? null,
              thumbnailUrl: null,
            },
            aliases,
          )
          if (did) inserted++
        }

        after = json.data?.after ?? undefined
        if (!after) break
        page++
        await new Promise((r) => setTimeout(r, PAGE_DELAY_MS))
      }

      await db.contentSource.update({
        where: { id: source.id },
        data: { lastFetchedAt: new Date() },
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push({ source: source.name, message })
    }
  }

  return {
    sources: sources.length,
    inserted,
    skippedSources,
    errors,
  }
}
