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
  // Tier 1: Injury reports, depth chart news, waiver wire analysis.
  // Fantasy-specific, high signal, free feed.
  {
    name: 'Rotowire NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.rotowire.com/rss/news.php?type=NFL',
    avatarUrl: 'https://www.rotowire.com/favicon.ico',
    refreshIntervalMins: 30,
    isActive: true,
    tier: 1,
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
  //   tier: 2,
  // },

  // ── CBS Sports NFL ────────────────────────────────────────────────────────
  // Tier 2: Broad NFL coverage. Clean feed.
  {
    name: 'CBS Sports NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.cbssports.com/rss/headlines/nfl/',
    avatarUrl: 'https://www.cbssports.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
    tier: 2,
  },

  // ── ESPN NFL ──────────────────────────────────────────────────────────────
  // Tier 2: Broad NFL coverage — scores, analysis, injury updates.
  {
    name: 'ESPN NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.espn.com/espn/rss/nfl/news',
    avatarUrl: 'https://a.espncdn.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
    tier: 2,
  },

  // ── Pro Football Talk (PFT) ───────────────────────────────────────────────
  // Tier 1: Breaking news, rumor mill, transaction wire. High volume, high signal.
  {
    name: 'Pro Football Talk',
    platform: 'rss' as const,
    feedUrl: 'https://profootballtalk.nbcsports.com/feed/',
    avatarUrl: 'https://profootballtalk.nbcsports.com/favicon.ico',
    refreshIntervalMins: 30,
    isActive: true,
    tier: 1,
  },

  // ── FantasyPros NFL News ──────────────────────────────────────────────────
  // Tier 2: Fantasy-specific news and analysis aggregation.
  // NOTE: Verify feed URL before running — FantasyPros may not expose a standard RSS.
  {
    name: 'FantasyPros NFL News',
    platform: 'rss' as const,
    feedUrl: 'https://www.fantasypros.com/nfl/rss/news.php',
    avatarUrl: 'https://www.fantasypros.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
    tier: 2,
  },

  // ── The Ringer NFL ───────────────────────────────────────────────────────
  // Tier 2: Analytical NFL coverage. Good depth on trends and player analysis.
  {
    name: 'The Ringer NFL',
    platform: 'rss' as const,
    feedUrl: 'https://www.theringer.com/nfl.rss',
    avatarUrl: 'https://www.theringer.com/favicon.ico',
    refreshIntervalMins: 120,
    isActive: true,
    tier: 2,
  },

  // ── Football Outsiders ────────────────────────────────────────────────────
  // Tier 2: Data-driven, advanced stats and analytical coverage.
  {
    name: 'Football Outsiders',
    platform: 'rss' as const,
    feedUrl: 'https://www.footballoutsiders.com/rss.xml',
    avatarUrl: 'https://www.footballoutsiders.com/favicon.ico',
    refreshIntervalMins: 120,
    isActive: true,
    tier: 2,
  },

  // ── 4for4 Fantasy Football ────────────────────────────────────────────────
  // Tier 2: Data-driven fantasy articles, projections, start/sit analysis.
  // NOTE: Verify feed URL before running.
  {
    name: '4for4 Fantasy Football Articles',
    platform: 'rss' as const,
    feedUrl: 'https://www.4for4.com/content/rss.xml',
    avatarUrl: 'https://www.4for4.com/favicon.ico',
    refreshIntervalMins: 60,
    isActive: true,
    tier: 2,
  },

  // ── NFL Trade Rumors ──────────────────────────────────────────────────────
  // Tier 2: Trade and transaction news aggregation.
  {
    name: 'NFL Trade Rumors',
    platform: 'rss' as const,
    feedUrl: 'https://www.nfltraderumors.co/feed/',
    avatarUrl: null,
    refreshIntervalMins: 60,
    isActive: true,
    tier: 2,
  },
] as const

// ─── YouTube Sources ──────────────────────────────────────────────────────────
// Channel identifier can be a raw UCxxxxxx ID or an @handle (resolved at first run).

const YOUTUBE_SOURCES = [
  {
    name: '4for4 Fantasy Football',
    platform: 'youtube' as const,
    feedUrl: '@4for4FantasyFootball',
    platformConfig: { channelId: '@4for4FantasyFootball' },
    avatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_k3sL9nPe-GGHVKQb4CwKhNj_r-vKM5Y_OCBn6gMg=s176-c-k-c0x00ffffff-no-rj',
    refreshIntervalMins: 120,
    isActive: true,
    featured: true,
    partnerTier: 'gold',
    tier: 2,
  },
  {
    name: 'ESPN Fantasy Sports',
    platform: 'youtube' as const,
    feedUrl: '@ESPNFantasySports',
    platformConfig: { channelId: '@ESPNFantasySports' },
    avatarUrl: 'https://a.espncdn.com/favicon.ico',
    refreshIntervalMins: 120,
    isActive: true,
    featured: true,
    partnerTier: 'gold',
    tier: 2,
  },
  {
    name: 'CBS Sports Fantasy Football',
    platform: 'youtube' as const,
    feedUrl: '@CBSSportsFantasy',
    platformConfig: { channelId: '@CBSSportsFantasy' },
    avatarUrl: 'https://www.cbssports.com/favicon.ico',
    refreshIntervalMins: 120,
    isActive: true,
    featured: false,
    tier: 2,
  },
  {
    name: 'Flock Fantasy',
    platform: 'youtube' as const,
    feedUrl: '@FlockFantasy',
    platformConfig: { channelId: '@FlockFantasy' },
    avatarUrl: null,
    refreshIntervalMins: 120,
    isActive: true,
    featured: false,
    tier: 3,
  },
  {
    name: 'Domain Fantasy Football',
    platform: 'youtube' as const,
    feedUrl: '@domainfantasyfootball',
    platformConfig: { channelId: '@domainfantasyfootball' },
    avatarUrl: null,
    refreshIntervalMins: 120,
    isActive: true,
    featured: false,
    tier: 3,
  },
  {
    name: 'FantasyPros Dynasty',
    platform: 'youtube' as const,
    feedUrl: '@FantasyPros',
    platformConfig: { channelId: '@FantasyPros' },
    avatarUrl: null,
    refreshIntervalMins: 120,
    isActive: true,
    featured: false,
    tier: 2,
  },
] as const

// ─── Seed ─────────────────────────────────────────────────────────────────────

// Feed URLs that are known-bad and should be deactivated if present in the DB.
const DISABLED_FEED_URLS: string[] = [
  // Malformed XML — "Attribute without value" in their RSS output
  'https://www.nfl.com/rss/rsslanding?searchString=news',
]

// Raw UC-format channel IDs that were manually added as duplicates.
// Each has a canonical @handle-based entry — delete the raw-ID version.
const DUPLICATE_UC_IDS: string[] = [
  'UCyq56KOEzJ8x0C_eRUy4t8A',   // 4for4 (duplicate of @4for4FantasyFootball)
  'UCFbCLm1ZJuJHHaXQjOHYgig',   // CBS Sports Fantasy (duplicate of @CBSSportsFantasy)
  'UCBNJGCLm1ZJuJHHaXQjOHYgig', // Fantasy Football Today/CBS (duplicate)
  'UCAK8g7FKFkrfpfFAH_GcXmQ',   // ESPN Fantasy (duplicate of @ESPNFantasySports)
  'UCSeCkMXMx7q0OM0RbJMWTDA',   // Establish the Run (no items — remove)
  'UCIsgMz9HZIGFSmzLqtOFO1g',   // Banged Up Bills (no items — remove)
]

async function seed() {
  console.log('Seeding content sources...\n')

  // ── Cleanup duplicate UC-format YouTube sources ──────────────────────────
  // These were manually added and duplicate @handle-based canonical entries.
  // Only delete sources with 0 content items to avoid orphaning data.
  console.log('Cleaning up duplicate UC-format YouTube sources:')
  for (const ucId of DUPLICATE_UC_IDS) {
    const source = await db.contentSource.findFirst({
      where: { feedUrl: ucId, platform: 'youtube' },
      include: { _count: { select: { items: true } } },
    })
    if (source) {
      if (source._count.items === 0) {
        await db.contentSource.delete({ where: { id: source.id } })
        console.log(`  ✗ Deleted "${source.name}" (${ucId}) — 0 items`)
      } else {
        console.log(`  ~ Skipped "${source.name}" (${ucId}) — has ${source._count.items} items`)
      }
    }
  }

  console.log('\nRSS sources:')
  for (const source of RSS_SOURCES) {
    await db.contentSource.upsert({
      where: { platform_feedUrl: { platform: source.platform, feedUrl: source.feedUrl } },
      create: source,
      update: {
        name: source.name,
        avatarUrl: source.avatarUrl,
        refreshIntervalMins: source.refreshIntervalMins,
        isActive: source.isActive,
        tier: source.tier,
      },
    })
    console.log(`  ${source.isActive ? '✓' : '○'} ${source.name} [Tier ${source.tier}]`)
  }

  console.log('\nYouTube sources:')
  for (const source of YOUTUBE_SOURCES) {
    const { platformConfig, ...rest } = source
    await db.contentSource.upsert({
      where: { platform_feedUrl: { platform: source.platform, feedUrl: source.feedUrl } },
      create: { ...rest, platformConfig },
      update: {
        name: source.name,
        refreshIntervalMins: source.refreshIntervalMins,
        isActive: source.isActive,
        featured: source.featured,
        tier: source.tier,
        ...(source.avatarUrl ? { avatarUrl: source.avatarUrl } : {}),
        ...('partnerTier' in source ? { partnerTier: source.partnerTier } : {}),
      },
    })
    console.log(`  ${source.isActive ? '✓' : '○'} ${source.name}${source.featured ? ' [featured]' : ''} [Tier ${source.tier}]`)
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
  console.log(`\nDone — ${total} total source(s) in DB.`)
}

seed()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
