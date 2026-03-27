/**
 * Reddit Connector
 *
 * Ingests posts from fantasy football subreddits using Reddit's public RSS feeds.
 * No auth required for read-only access to public subreddits.
 *
 * Target source: r/fantasyfootball (initial), expandable to curated allowlist.
 * Processed identically to RSS — uses the same ContentItem + ContentPlayerMention pipeline.
 *
 * The RSS connector handles platform='reddit' sources automatically.
 * This module provides the seeder that registers reddit sources in the DB.
 */

import { db } from '@rzf/db'

export { runRedditBackfill, subredditFromFeedUrl, type RedditBackfillResult } from './backfill.js'

export const DEFAULT_REDDIT_SOURCES = [
  {
    name: 'r/fantasyfootball',
    feedUrl: 'https://www.reddit.com/r/fantasyfootball/.rss?limit=25',
    tier: 2,
  },
  {
    name: 'r/DynastyFF',
    feedUrl: 'https://www.reddit.com/r/DynastyFF/.rss?limit=25',
    tier: 2,
  },
  {
    name: 'r/FFCommish',
    feedUrl: 'https://www.reddit.com/r/FFCommish/.rss?limit=25',
    tier: 3,
  },
]

export const RedditConnector = {
  /**
   * Ensure default Reddit sources are registered in the DB.
   * Safe to call multiple times — upserts by platform + feedUrl.
   */
  async seedDefaultSources(): Promise<void> {
    for (const source of DEFAULT_REDDIT_SOURCES) {
      await db.contentSource.upsert({
        where: { platform_feedUrl: { platform: 'reddit', feedUrl: source.feedUrl } },
        create: {
          name: source.name,
          platform: 'reddit',
          feedUrl: source.feedUrl,
          tier: source.tier,
          refreshIntervalMins: 60,
          isActive: true,
        },
        update: { isActive: true },
      })
    }
    console.log(`[reddit] Seeded ${DEFAULT_REDDIT_SOURCES.length} Reddit source(s)`)
  },
}
