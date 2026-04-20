/**
 * RSS Connector
 *
 * Reads active RSS sources from the ContentSource table, fetches each feed,
 * normalizes items to ContentItem rows, and resolves player mentions via aliases.
 *
 * Sources are managed in the DB — add/toggle them via the seed script or
 * the admin UI (future). The connector is intentionally source-agnostic.
 */

import Parser from 'rss-parser'
import { db } from '@rzf/db'
import { resolvePlayerMentions, extractSnippet, inferMentionContext } from '@rzf/shared'
import { inferContentTopics } from '../topics/inferTopics.js'

// rss-parser generic: <feed-level custom fields, item-level custom fields>
type CustomItem = {
  'content:encoded'?: string
  'media:content'?: { $?: { url?: string } }
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [['content:encoded', 'content:encoded'], ['media:content', 'media:content']],
  },
  timeout: 15000,
})

// ─── Shared upsert (RSS, Reddit JSON backfill, etc.) ───────────────────────────

type AliasRow = { alias: string; playerId: string; aliasType: string }

/** Insert one article-like row if `sourceUrl` is new; same semantics as RSS item processing. */
export async function upsertContentItemFromArticle(
  source: { id: string; name: string },
  item: {
    link: string
    title: string
    rawContent: string
    publishedAt: Date | null
    authorName?: string | null
    thumbnailUrl?: string | null
  },
  aliases: AliasRow[],
): Promise<boolean> {
  const existing = await db.contentItem.findUnique({
    where: { sourceUrl: item.link },
    select: { id: true },
  })
  if (existing) return false

  const topics = inferContentTopics(`${item.title} ${item.rawContent}`)
  // Titles are short and headline-style (often last-name-only), so we scan them
  // with loose matching to catch "Mahomes Throws 3 TDs". Body scan stays strict
  // to avoid false positives on common surnames in prose ("Smith said…").
  const titleMatches = resolvePlayerMentions(item.title, aliases, { strictMode: false })
  const matches =
    titleMatches.length > 0
      ? titleMatches
      : resolvePlayerMentions(item.rawContent, aliases, { strictMode: true })

  const contentItem = await db.contentItem.create({
    data: {
      sourceId: source.id,
      contentType: 'article',
      sourceUrl: item.link,
      title: item.title,
      rawContent: item.rawContent,
      authorName: item.authorName ?? source.name,
      publishedAt: item.publishedAt,
      thumbnailUrl: item.thumbnailUrl ?? undefined,
      topics,
    },
  })

  if (matches.length > 0) {
    await db.contentPlayerMention.createMany({
      data: matches.map((match) => {
        const snippet = extractSnippet(item.rawContent, match)
        return {
          contentId: contentItem.id,
          playerId: match.playerId,
          context: inferMentionContext(snippet),
          snippet,
        }
      }),
      skipDuplicates: true,
    })
  }

  return true
}

// ─── Feed Processor ───────────────────────────────────────────────────────────

async function processFeed(
  source: { id: string; name: string; feedUrl: string },
  aliases: Array<{ alias: string; playerId: string; aliasType: string }>,
): Promise<number> {
  const feed = await parser.parseURL(source.feedUrl)
  let inserted = 0

  // Batch dedup: one query for all URLs in this feed instead of N findUnique calls
  const candidateLinks = feed.items
    .filter((item) => item.link && item.title)
    .map((item) => item.link!)

  const existing = await db.contentItem.findMany({
    where: { sourceUrl: { in: candidateLinks } },
    select: { sourceUrl: true },
  })
  const existingUrls = new Set(existing.map((e) => e.sourceUrl))

  for (const item of feed.items) {
    if (!item.link || !item.title) continue
    if (existingUrls.has(item.link)) continue

    const rawContent =
      item['content:encoded'] ??
      item.contentSnippet ??
      item.content ??
      item.title

    const publishedAt =
      item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : null

    const thumbnailUrl =
      (item['media:content'] as CustomItem['media:content'])?.$?.url ?? null

    const did = await upsertContentItemFromArticle(
      source,
      {
        link: item.link,
        title: item.title,
        rawContent,
        publishedAt,
        authorName: item.creator ?? null,
        thumbnailUrl,
      },
      aliases,
    )
    if (did) {
      inserted++
      existingUrls.add(item.link)
    }
  }

  return inserted
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface RSSRunResult {
  inserted: number
  sources: number
  errors: Array<{ source: string; message: string }>
}

export const RSSConnector = {
  /**
   * Fetch all active RSS sources from the DB and process each feed.
   * Pass platform='reddit' for Reddit RSS or platform='twitter' for Nitter RSS feeds.
   * Safe to call repeatedly — deduplicates by sourceUrl.
   */
  async run(platform: 'rss' | 'reddit' | 'twitter' = 'rss'): Promise<RSSRunResult> {
    const sources = await db.contentSource.findMany({
      where: { platform, isActive: true },
    })

    if (sources.length === 0) {
      console.log('[rss] No active RSS sources in DB — run the seed script first')
      return { inserted: 0, sources: 0, errors: [] }
    }

    // Load aliases for active/current players only — excludes retired/inactive
    // to prevent false-positive matches on common words (e.g. "Jones" for a
    // retired player shadowing an active one, or single-word first-name aliases).
    const aliases = await db.playerAlias.findMany({
      where: {
        player: { status: { not: 'Inactive' } },
      },
      select: { alias: true, playerId: true, aliasType: true },
    })

    console.log(
      `[rss] Processing ${sources.length} source(s) — ${aliases.length} player aliases loaded`,
    )

    let totalInserted = 0
    const errors: RSSRunResult['errors'] = []

    for (const source of sources) {
      try {
        console.log(`[rss] Fetching "${source.name}" (${source.feedUrl})`)
        const inserted = await processFeed(source, aliases)
        totalInserted += inserted
        console.log(`[rss] "${source.name}": +${inserted} new items`)

        await db.contentSource.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date() },
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[rss] Error on "${source.name}": ${message}`)
        errors.push({ source: source.name, message })
      }
    }

    console.log(`[rss] Done — ${totalInserted} total new items across ${sources.length} sources`)
    return { inserted: totalInserted, sources: sources.length, errors }
  },
}
