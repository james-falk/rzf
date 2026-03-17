/**
 * Content Injector
 *
 * Unified utility for fetching and scoring content items to inject into
 * agent prompts. Replaces all ad-hoc contentPlayerMention queries across agents.
 *
 * Features:
 * - Filters by source tier (1=premium, 2=established, 3=general)
 * - Filters by platform (rss, youtube, twitter, etc.)
 * - Filters by recency window (hours)
 * - Deduplicates by URL, caps at 2 items per player and maxContentItems total
 * - Computes a 0-100 confidence score from tier quality, player coverage, and recency
 */

import { db } from '@rzf/db'
import { adjustWindowForSchedule } from './nfl-schedule.js'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InjectedContent {
  playerId: string
  title: string
  snippet: string
  sourceUrl: string
  sourceName: string
  sourceTier: number
  platform: string
  publishedAt: Date | null
  contentType: string
  topics: string[]
}

export interface SourceUsed {
  sourceId: string
  sourceName: string
  tier: number
  platform: string
  itemCount: number
}

export interface ConfidenceBreakdown {
  tierScore: number      // 0-40: quality of sources
  coverageScore: number  // 0-35: % of players with news
  recencyScore: number   // 0-25: how fresh the content is
}

export interface ContentInjectionResult {
  items: InjectedContent[]
  confidenceScore: number
  confidenceBreakdown: ConfidenceBreakdown
  sourcesUsed: SourceUsed[]
}

export interface ContentInjectorConfig {
  agentType: string
  recencyWindowHours: number
  maxItemsPerPlayer?: number
  maxItemsTotal: number
  allowedTiers: number[]
  allowedPlatforms: string[]
}

// ─── Default config values ────────────────────────────────────────────────────

const DEFAULT_MAX_ITEMS_PER_PLAYER = 2

// ─── Confidence Scoring ───────────────────────────────────────────────────────

function computeConfidence(
  items: InjectedContent[],
  playerIds: string[],
  windowMs: number,
  now: number,
): { score: number; breakdown: ConfidenceBreakdown } {
  if (items.length === 0) {
    return { score: 0, breakdown: { tierScore: 0, coverageScore: 0, recencyScore: 0 } }
  }

  // Tier score (0-40): weighted average quality of sources used
  const tierWeights: Record<number, number> = { 1: 1.0, 2: 0.625, 3: 0.375 }
  const avgTierWeight =
    items.reduce((sum, item) => sum + (tierWeights[item.sourceTier] ?? 0.375), 0) / items.length
  const tierScore = Math.round(avgTierWeight * 40)

  // Coverage score (0-35): what % of analyzed players have at least one news item
  const coveredPlayerIds = new Set(items.map((i) => i.playerId))
  const coverageScore =
    playerIds.length > 0 ? Math.round((coveredPlayerIds.size / playerIds.length) * 35) : 0

  // Recency score (0-25): average freshness fraction of items
  const avgFreshness =
    items.reduce((sum, item) => {
      const ts = item.publishedAt?.getTime() ?? now - windowMs
      const age = Math.max(0, now - ts)
      const freshness = Math.max(0, 1 - age / windowMs)
      return sum + freshness
    }, 0) / items.length
  const recencyScore = Math.round(avgFreshness * 25)

  const score = Math.min(100, tierScore + coverageScore + recencyScore)
  return { score, breakdown: { tierScore, coverageScore, recencyScore } }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Fetch and score content items relevant to the given player IDs.
 *
 * @param playerIds - Sleeper player IDs to find news for
 * @param config - injection configuration (from AgentConfig + agent defaults)
 * @returns InjectedContent[] with confidence score and source breakdown
 */
export async function injectContent(
  playerIds: string[],
  config: ContentInjectorConfig,
): Promise<ContentInjectionResult> {
  if (playerIds.length === 0) {
    return {
      items: [],
      confidenceScore: 0,
      confidenceBreakdown: { tierScore: 0, coverageScore: 0, recencyScore: 0 },
      sourcesUsed: [],
    }
  }

  const {
    agentType,
    recencyWindowHours,
    maxItemsPerPlayer = DEFAULT_MAX_ITEMS_PER_PLAYER,
    maxItemsTotal,
    allowedTiers,
    allowedPlatforms,
  } = config

  // Adjust window based on NFL schedule
  const adjustedWindowHours = adjustWindowForSchedule(agentType, recencyWindowHours)
  const cutoff = new Date(Date.now() - adjustedWindowHours * 60 * 60 * 1000)

  console.log(
    `[content-injector] ${agentType} — window=${adjustedWindowHours}h cutoff=${cutoff.toISOString()} players=${playerIds.length}`,
  )

  // Fetch mentions with source tier + platform + recency filters
  // Overfetch (3x max) then deduplicate and cap per player
  const overfetchLimit = maxItemsTotal * 3

  const mentions = await db.contentPlayerMention.findMany({
    where: {
      playerId: { in: playerIds },
      content: {
        source: {
          tier: { in: allowedTiers },
          platform: { in: allowedPlatforms as string[] as never },
          isActive: true,
        },
        publishedAt: { gte: cutoff },
      },
    },
    include: {
      content: {
        include: {
          source: {
            select: {
              id: true,
              name: true,
              tier: true,
              platform: true,
            },
          },
        },
      },
    },
    orderBy: { content: { publishedAt: 'desc' } },
    take: overfetchLimit,
  })

  // Group by player, deduplicate by URL, cap per player
  const seenUrls = new Set<string>()
  const perPlayerCount = new Map<string, number>()
  const items: InjectedContent[] = []

  for (const mention of mentions) {
    if (items.length >= maxItemsTotal) break

    const { content } = mention
    if (!content.source) continue  // guard: source should always be present but satisfy TS

    const url = content.sourceUrl

    // Skip duplicate URLs
    if (seenUrls.has(url)) continue

    // Skip if this player already has maxItemsPerPlayer items
    const playerCount = perPlayerCount.get(mention.playerId) ?? 0
    if (playerCount >= maxItemsPerPlayer) continue

    seenUrls.add(url)
    perPlayerCount.set(mention.playerId, playerCount + 1)

    // Build a snippet: prefer rawContent snippet, fall back to snippet field, then title
    const raw = (content as { rawContent?: string | null }).rawContent ?? ''
    const snippet = raw.length > 0 ? raw.slice(0, 280).replace(/\s+/g, ' ').trim() : content.title

    items.push({
      playerId: mention.playerId,
      title: content.title,
      snippet,
      sourceUrl: url,
      sourceName: content.source.name,
      sourceTier: content.source.tier,
      platform: content.source.platform,
      publishedAt: content.publishedAt,
      contentType: content.contentType,
      topics: content.topics ?? [],
    })
  }

  // Build sourcesUsed summary
  const sourceMap = new Map<string, SourceUsed>()
  for (const item of items) {
    const existing = sourceMap.get(item.sourceName)
    if (existing) {
      existing.itemCount++
    } else {
      const match = mentions.find((m) => m.content.source?.name === item.sourceName)
      sourceMap.set(item.sourceName, {
        sourceId: match?.content.source?.id ?? '',
        sourceName: item.sourceName,
        tier: item.sourceTier,
        platform: item.platform,
        itemCount: 1,
      })
    }
  }
  const sourcesUsed = Array.from(sourceMap.values())

  // Compute confidence
  const windowMs = adjustedWindowHours * 60 * 60 * 1000
  const { score: confidenceScore, breakdown: confidenceBreakdown } = computeConfidence(
    items,
    playerIds,
    windowMs,
    Date.now(),
  )

  console.log(
    `[content-injector] ${agentType} — found=${items.length} confidence=${confidenceScore} sources=${sourcesUsed.length}`,
  )

  return { items, confidenceScore, confidenceBreakdown, sourcesUsed }
}

// ─── Prompt Formatting ────────────────────────────────────────────────────────

/**
 * Format injected content items into a prompt section string.
 * Each item shows the source name, tier, relative publish time, and headline/snippet.
 */
export function formatContentForPrompt(items: InjectedContent[], playerName?: string): string {
  if (items.length === 0) return ''

  const now = Date.now()
  const lines: string[] = []

  if (playerName) {
    lines.push(`[Recent News — ${playerName}]`)
  } else {
    lines.push('[Recent News]')
  }

  for (const item of items) {
    const tierLabel = item.sourceTier === 1 ? 'Tier 1' : item.sourceTier === 2 ? 'Tier 2' : 'Tier 3'
    const ageMs = item.publishedAt ? now - item.publishedAt.getTime() : null
    const ageLabel = ageMs == null ? 'unknown time ago'
      : ageMs < 60 * 60 * 1000 ? `${Math.round(ageMs / 60000)}m ago`
      : ageMs < 24 * 60 * 60 * 1000 ? `${Math.round(ageMs / 3600000)}h ago`
      : `${Math.round(ageMs / 86400000)}d ago`

    lines.push(`• [${item.sourceName} | ${tierLabel} | ${ageLabel}]: "${item.title}"`)
    if (item.snippet !== item.title && item.snippet.length > 0) {
      lines.push(`  ${item.snippet}`)
    }
  }

  return lines.join('\n')
}

/**
 * Group injected items by player ID and format each group as a prompt block.
 */
export function formatContentByPlayer(
  items: InjectedContent[],
  playerNames: Map<string, string>,
): string {
  if (items.length === 0) return ''

  const byPlayer = new Map<string, InjectedContent[]>()
  for (const item of items) {
    const group = byPlayer.get(item.playerId) ?? []
    group.push(item)
    byPlayer.set(item.playerId, group)
  }

  const sections: string[] = []
  for (const [playerId, playerItems] of byPlayer) {
    const name = playerNames.get(playerId) ?? playerId
    sections.push(formatContentForPrompt(playerItems, name))
  }

  return sections.join('\n\n')
}
