/**
 * Nitter RSS Scraper — free, no-API-key Twitter ingestion
 *
 * Nitter is a privacy-respecting Twitter frontend that exposes RSS feeds
 * for any public Twitter handle. We use it as a zero-cost read path for
 * following beat reporters, NFL team accounts, and fantasy analysts.
 *
 * The feeds are processed through the existing RSSConnector pipeline,
 * so player tagging, dedup, and content storage all happen automatically.
 *
 * Multiple Nitter instances are tried in order for redundancy.
 *
 * WRITE operations (posting to X) still require the official API.
 */

import { db } from '@rzf/db'
import { parseNitterBaseUrls } from '@rzf/shared'
import { env } from '@rzf/shared/env'

/** @deprecated use DEFAULT_NITTER_BASE_URLS from @rzf/shared */
export const NITTER_INSTANCES = [
  'https://nitter.cz',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://lightbrd.com',
]

/** Active Nitter bases: env override or defaults */
export function getNitterBases(): string[] {
  return parseNitterBaseUrls(env.NITTER_BASE_URLS)
}

/**
 * Default fantasy-relevant Twitter handles to follow via Nitter RSS.
 * Tier 1 = primary beat reporters / breaking news
 * Tier 2 = fantasy analysts and secondary sources
 */
export const DEFAULT_NITTER_HANDLES: Array<{
  handle: string
  name: string
  tier: 1 | 2
}> = [
  // NFL beat reporters — breaking injury / transaction news
  { handle: 'AdamSchefter', name: 'Adam Schefter (ESPN)', tier: 1 },
  { handle: 'RapSheet', name: 'Ian Rapoport (NFL Network)', tier: 1 },
  { handle: 'TomPelissero', name: 'Tom Pelissero (NFL Network)', tier: 1 },
  { handle: 'MikeGarafolo', name: 'Mike Garafolo (NFL Network)', tier: 1 },
  { handle: 'FieldYates', name: 'Field Yates (ESPN)', tier: 1 },
  { handle: 'JordanRaanan', name: 'Jordan Raanan (ESPN)', tier: 1 },
  { handle: 'mortreport', name: 'Chris Mortensen (ESPN)', tier: 1 },
  { handle: 'AlbertBreer', name: 'Albert Breer (SI)', tier: 1 },
  { handle: 'CharlesRobinson', name: 'Charles Robinson (Yahoo)', tier: 1 },
  { handle: 'DMRussini', name: 'Dianna Russini (The Athletic)', tier: 1 },
  { handle: 'JFowlerESPN', name: 'Jeremy Fowler (ESPN)', tier: 1 },
  // Fantasy analysts
  { handle: 'matthewberrytmr', name: 'Matthew Berry (NBC)', tier: 2 },
  { handle: 'JJZachariason', name: 'JJ Zachariason (Late Round)', tier: 2 },
  { handle: 'evansilva', name: 'Evan Silva (Establish The Run)', tier: 2 },
  { handle: 'AdamLevitan', name: 'Adam Levitan (Establish The Run)', tier: 2 },
  { handle: 'hayden_winks', name: 'Hayden Winks (Underdog)', tier: 2 },
  { handle: 'ScottBarrettDFB', name: 'Scott Barrett (Fantasy Points)', tier: 2 },
  { handle: 'GrahamBarfield', name: 'Graham Barfield (Fantasy Points)', tier: 2 },
  { handle: 'PFF', name: 'Pro Football Focus', tier: 2 },
  { handle: 'PFF_Fantasy', name: 'PFF Fantasy', tier: 2 },
  { handle: 'FantasyPros', name: 'FantasyPros', tier: 2 },
  { handle: 'FFTodayNews', name: 'FFToday News', tier: 2 },
  { handle: 'thefantasyfballrs', name: 'The Fantasy Footballers', tier: 2 },
]

/**
 * Build a Nitter RSS URL for a given handle.
 * Returns an array of fallback URLs across multiple Nitter instances.
 */
export function nitterRssUrls(handle: string): string[] {
  return getNitterBases().map((base) => `${base}/${handle}/rss`)
}

/**
 * Seed default Nitter-based Twitter handles as ContentSource rows.
 * Uses the first Nitter instance as the feedUrl (the RSS connector will fetch it).
 * Safe to call multiple times — upserts by platform + feedUrl.
 */
export async function seedNitterSources(): Promise<{ seeded: number; existing: number }> {
  let seeded = 0
  let existing = 0

  const bases = getNitterBases()
  for (const entry of DEFAULT_NITTER_HANDLES) {
    const feedUrl = `${bases[0]}/${entry.handle}/rss`
    const existing_row = await db.contentSource.findFirst({
      where: { platform: 'twitter', feedUrl },
    })
    if (existing_row) {
      existing++
      // Ensure it's active
      if (!existing_row.isActive) {
        await db.contentSource.update({ where: { id: existing_row.id }, data: { isActive: true } })
      }
      continue
    }

    await db.contentSource.create({
      data: {
        name: entry.name,
        platform: 'twitter',
        feedUrl,
        tier: entry.tier,
        refreshIntervalMins: 60,
        isActive: true,
      },
    })
    seeded++
  }

  console.log(`[nitter] Seed complete — seeded=${seeded} existing=${existing}`)
  return { seeded, existing }
}
