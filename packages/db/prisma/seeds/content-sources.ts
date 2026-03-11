/**
 * Content Source Seed
 *
 * Populates the ContentSource table with the initial set of RSS feeds.
 * This is the source-of-truth for bootstrapping — after first run, manage
 * sources via the admin UI or by editing this file and re-running.
 *
 * Run:
 *   pnpm --filter @rzf/db exec tsx prisma/seeds/content-sources.ts
 *
 * Safe to re-run — upserts by (platform, feedUrl) so no duplicates.
 *
 * ─── Adding a new source ──────────────────────────────────────────────────────
 * 1. Add an entry to RSS_SOURCES (or the future YOUTUBE_SOURCES, etc.)
 * 2. Re-run this script
 * 3. Trigger a CONTENT_REFRESH job from the admin UI or via the API
 *
 * ─── Disabling a source ───────────────────────────────────────────────────────
 * Set isActive: false — the connector skips inactive sources at runtime.
 * Do NOT delete rows; that would orphan any ContentItems that reference them.
 */

import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// ─── RSS Sources ──────────────────────────────────────────────────────────────
// Review and confirm these URLs before running. Mark isActive: false to skip.

const RSS_SOURCES = [
  // ── Rotowire ─────────────────────────────────────────────────────────────
  // High-quality injury reports, depth chart news, waiver wire analysis.
  // Free feed, no auth required.
  {
    name: 'Rotowire NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.rotowire.com/rss/news.php?type=NFL',
    avatarUrl: 'https://www.rotowire.com/favicon.ico',
    refreshIntervalMins: 30,
    isActive: true,
  },

  // ── NFL.com ───────────────────────────────────────────────────────────────
  // Disabled: their RSS feed contains malformed XML ("Attribute without value")
  // that rss-parser cannot handle. Use a different NFL news source instead.
  // {
  //   name: 'NFL.com News',
  //   platform: 'rss' as const,
  //   feedUrl: 'https://www.nfl.com/rss/rsslanding?searchString=news',
  //   avatarUrl: 'https://www.nfl.com/favicon.ico',
  //   refreshIntervalMins: 60,
  //   isActive: false,
  // },

  // ── CBS Sports NFL ────────────────────────────────────────────────────────
  // Broad NFL coverage as a replacement for NFL.com. Clean RSS feed.
  {
    name: 'CBS Sports NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.cbssports.com/rss/headlines/nfl/',
    avatarUrl: 'https://www.cbssports.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
  },

  // ── ESPN NFL ──────────────────────────────────────────────────────────────
  // Broad NFL coverage: scores, analysis, injury updates.
  {
    name: 'ESPN NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.espn.com/espn/rss/nfl/news',
    avatarUrl: 'https://a.espncdn.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
  },

  // ── Pro Football Talk (PFT) ───────────────────────────────────────────────
  // Breaking news, rumor mill, transaction wire. High volume.
  {
    name: 'Pro Football Talk',
    platform: 'rss' as const,
    feedUrl: 'https://profootballtalk.nbcsports.com/feed/',
    avatarUrl: 'https://profootballtalk.nbcsports.com/favicon.ico',
    refreshIntervalMins: 30,
    isActive: true,
  },

  // ── Field Yates / Adam Schefter (ESPN) ────────────────────────────────────
  // TODO: confirm URL — ESPN does not always publish reporter-specific RSS.
  // Leaving inactive until URL is verified.
  // {
  //   name: 'ESPN NFL Insider',
  //   platform: 'rss' as const,
  //   feedUrl: 'https://www.espn.com/espn/rss/nfl/insider',
  //   refreshIntervalMins: 60,
  //   isActive: false,
  // },
] as const

// ─── Seed ─────────────────────────────────────────────────────────────────────

// Feed URLs that are known-bad and should be deactivated if present in the DB.
const DISABLED_FEED_URLS: string[] = [
  // Malformed XML — "Attribute without value" in their RSS output
  'https://www.nfl.com/rss/rsslanding?searchString=news',
]

async function seed() {
  console.log('Seeding content sources...\n')

  for (const source of RSS_SOURCES) {
    await db.contentSource.upsert({
      where: {
        platform_feedUrl: {
          platform: source.platform,
          feedUrl: source.feedUrl,
        },
      },
      create: source,
      update: {
        name: source.name,
        avatarUrl: source.avatarUrl,
        refreshIntervalMins: source.refreshIntervalMins,
        isActive: source.isActive,
      },
    })
    console.log(`  ${source.isActive ? '✓' : '○'} ${source.name}`)
  }

  // Deactivate any known-bad sources
  if (DISABLED_FEED_URLS.length > 0) {
    const disabled = await db.contentSource.updateMany({
      where: { feedUrl: { in: DISABLED_FEED_URLS } },
      data: { isActive: false },
    })
    if (disabled.count > 0) {
      console.log(`\n  Deactivated ${disabled.count} known-bad source(s)`)
    }
  }

  const total = await db.contentSource.count()
  console.log(`\nDone — ${total} total source(s) in DB (${RSS_SOURCES.filter(s => s.isActive).length} active).`)
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
