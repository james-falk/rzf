/**
 * FantasyPros Connector
 *
 * Authenticated public API — requires FANTASYPROS_API_KEY env var.
 * Rate limit: 1 req/sec, 100 req/day. All methods cache results to the DB;
 * live query-time calls are reserved for the Player Compare agent only.
 *
 * Base URL: https://api.fantasypros.com/public/v2/json
 * Auth: x-api-key header
 */

import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'
import { resolvePlayerMentions, inferMentionContext, extractSnippet, type AliasLookup } from '@rzf/shared'
import {
  FPPlayersResponseSchema,
  FPNewsResponseSchema,
  FPInjuriesResponseSchema,
  FPConsensusRankingsResponseSchema,
  FPProjectionsResponseSchema,
  FP_POSITIONS,
  FP_SCORING_TYPES,
  type FPPosition,
  type FPScoring,
} from './types.js'

const FP_BASE = 'https://api.fantasypros.com/public/v2/json'

// ─── HTTP Client ──────────────────────────────────────────────────────────────

async function fpFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const apiKey = env.FANTASYPROS_API_KEY
  if (!apiKey) throw new Error('FANTASYPROS_API_KEY is not set')

  const url = new URL(`${FP_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }

  const res = await fetch(url.toString(), {
    headers: {
      'x-api-key': apiKey,
      'Accept': 'application/json',
      'User-Agent': 'RosterMind/1.0',
    },
  })

  if (!res.ok) {
    throw new Error(`FantasyPros API ${path} failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

// ─── Result Types ─────────────────────────────────────────────────────────────

export interface FPPlayerIdSyncResult {
  synced: number
  unmatched: number
  errors: string[]
}

export interface FPRankingsSyncResult {
  upserted: number
  skipped: number
  errors: string[]
}

export interface FPProjectionsSyncResult {
  upserted: number
  skipped: number
  errors: string[]
}

export interface FPNewsSyncResult {
  inserted: number
  skipped: number
  errors: string[]
}

export interface FPInjuriesSyncResult {
  updated: number
  skipped: number
  errors: string[]
}

// ─── Connector ────────────────────────────────────────────────────────────────

export const FantasyProsConnector = {
  /**
   * Sync FantasyPros player IDs into PlayerExternalId.
   *
   * Fetches the FP player list with external IDs for ESPN, Yahoo, CBS.
   * Matches players to our DB via sportsdata_player_id (stored in Player.metadata).
   * Seeds PlayerExternalId rows for: sportradar, fantasypros, espn, yahoo, cbs.
   *
   * Run: once on startup + weekly to pick up new players.
   */
  async syncPlayerIds(): Promise<FPPlayerIdSyncResult> {
    console.log('[fantasypros] syncPlayerIds — fetching player list...')

    const raw = await fpFetch<unknown>('/NFL/players', {
      external_ids: 'yahoo:espn:cbs',
      show: 'pos_rank',
    })

    const parsed = FPPlayersResponseSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`[fantasypros] syncPlayerIds parse error: ${parsed.error.message}`)
    }

    const fpPlayers = parsed.data.players.filter(
      (p) => p.sportsdata_player_id && p.sportsdata_player_id.length > 0,
    )

    // Build a lookup: sportsdata_player_id → FP player
    const fpBySportsdata = new Map(fpPlayers.map((p) => [p.sportsdata_player_id!, p]))

    // Load our players — sportsdata ID is in the metadata JSON blob
    const ourPlayers = await db.player.findMany({
      select: { sleeperId: true, metadata: true },
    })

    let synced = 0
    let unmatched = 0
    const errors: string[] = []
    const now = new Date()

    for (const player of ourPlayers) {
      const meta = player.metadata as Record<string, unknown>
      const sportsdataId = meta?.sportsdata_id as string | undefined

      if (!sportsdataId) {
        unmatched++
        continue
      }

      const fpPlayer = fpBySportsdata.get(sportsdataId)
      if (!fpPlayer) {
        unmatched++
        continue
      }

      // Build all ID mappings to upsert for this player
      const mappings: Array<{ source: string; externalId: string }> = [
        { source: 'sportradar', externalId: sportsdataId },
        { source: 'fantasypros', externalId: String(fpPlayer.player_id) },
      ]

      if (fpPlayer.espn_id != null) {
        mappings.push({ source: 'espn', externalId: String(fpPlayer.espn_id) })
      }
      if (fpPlayer.yahoo_id != null) {
        mappings.push({ source: 'yahoo', externalId: String(fpPlayer.yahoo_id) })
      }
      if (fpPlayer.cbs_id != null) {
        mappings.push({ source: 'cbs', externalId: String(fpPlayer.cbs_id) })
      }

      try {
        await Promise.all(
          mappings.map((m) =>
            db.playerExternalId.upsert({
              where: { sleeperId_source: { sleeperId: player.sleeperId, source: m.source } },
              create: { sleeperId: player.sleeperId, source: m.source, externalId: m.externalId, lastVerifiedAt: now },
              update: { externalId: m.externalId, lastVerifiedAt: now },
            }),
          ),
        )
        synced++
      } catch (err) {
        errors.push(`${player.sleeperId}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    console.log(`[fantasypros] syncPlayerIds done — synced=${synced} unmatched=${unmatched} errors=${errors.length}`)
    return { synced, unmatched, errors }
  },

  /**
   * Sync FantasyPros consensus rankings into PlayerRanking.
   *
   * Calls consensus-rankings for each position × scoring format.
   * Resolves FP player IDs to Sleeper IDs via PlayerExternalId reverse lookup.
   */
  async syncRankings(week: number, season: number): Promise<FPRankingsSyncResult> {
    console.log(`[fantasypros] syncRankings — week=${week} season=${season}`)

    // Build FP ID → sleeperId reverse lookup from the external IDs table
    const fpIdMap = await buildFpToSleeperMap()

    let upserted = 0
    let skipped = 0
    const errors: string[] = []
    const now = new Date()

    for (const position of FP_POSITIONS) {
      for (const scoring of FP_SCORING_TYPES) {
        try {
          const raw = await fpFetch<unknown>(`/NFL/${season}/consensus-rankings`, {
            position,
            type: 'weekly',
            scoring,
            week: String(week),
          })

          const parsed = FPConsensusRankingsResponseSchema.safeParse(raw)
          if (!parsed.success) {
            errors.push(`${position}/${scoring}: parse error`)
            continue
          }

          for (const fp of parsed.data.players) {
            const fpId = String(fp.player_id)
            const sleeperId = fpIdMap.get(fpId)
            if (!sleeperId) {
              skipped++
              continue
            }

            const rankOverall = fp.rank_ecr ?? 999
            const rankPosition = extractPositionNumber(fp.pos_rank)

            try {
              await db.playerRanking.upsert({
                where: { playerId_source_week_season: { playerId: sleeperId, source: 'fantasypros', week, season } },
                create: {
                  playerId: sleeperId,
                  source: 'fantasypros',
                  week,
                  season,
                  rankOverall,
                  rankPosition,
                  tier: fp.tier ?? null,
                  posRank: fp.pos_rank ?? null,
                  rankPpr: scoring === 'PPR' ? rankOverall : null,
                  rankHalfPpr: scoring === 'HALF' ? rankOverall : null,
                  rankStd: scoring === 'STD' ? rankOverall : null,
                  ownershipPct: fp.player_owned_avg ?? null,
                  fetchedAt: now,
                },
                update: {
                  rankOverall: scoring === 'STD' ? rankOverall : undefined,
                  rankPosition: scoring === 'STD' ? rankPosition : undefined,
                  tier: fp.tier ?? null,
                  posRank: fp.pos_rank ?? null,
                  rankPpr: scoring === 'PPR' ? rankOverall : undefined,
                  rankHalfPpr: scoring === 'HALF' ? rankOverall : undefined,
                  rankStd: scoring === 'STD' ? rankOverall : undefined,
                  ownershipPct: fp.player_owned_avg ?? null,
                  fetchedAt: now,
                },
              })
              upserted++
            } catch (err) {
              errors.push(`${sleeperId} ${scoring}: ${err instanceof Error ? err.message : String(err)}`)
            }
          }

          // Respect 1 req/sec rate limit
          await sleep(1100)
        } catch (err) {
          errors.push(`${position}/${scoring}: ${err instanceof Error ? err.message : String(err)}`)
        }
      }
    }

    console.log(`[fantasypros] syncRankings done — upserted=${upserted} skipped=${skipped} errors=${errors.length}`)
    return { upserted, skipped, errors }
  },

  /**
   * Sync FantasyPros projections into PlayerProjection.
   *
   * Fetches weekly projections (for the given week) and ROS projections
   * for each offensive position. Resolves FP IDs via PlayerExternalId.
   */
  async syncProjections(week: number, season: number): Promise<FPProjectionsSyncResult> {
    console.log(`[fantasypros] syncProjections — week=${week} season=${season}`)

    const fpIdMap = await buildFpToSleeperMap()

    let upserted = 0
    let skipped = 0
    const errors: string[] = []
    const now = new Date()

    const positionsToFetch: FPPosition[] = ['QB', 'RB', 'WR', 'TE', 'K']

    for (const position of positionsToFetch) {
      for (const isRos of [false, true]) {
        try {
          const params: Record<string, string> = { position }
          if (isRos) {
            params.ros = 'true'
          } else {
            params.week = String(week)
          }

          const raw = await fpFetch<unknown>(`/nfl/${season}/projections`, params)
          const parsed = FPProjectionsResponseSchema.safeParse(raw)
          if (!parsed.success) {
            errors.push(`${position}/ros=${isRos}: parse error`)
            await sleep(1100)
            continue
          }

          for (const fp of parsed.data.players) {
            const fpId = String(fp.fpid)
            const sleeperId = fpIdMap.get(fpId)
            if (!sleeperId) {
              skipped++
              continue
            }

            const stats = fp.stats?.[0]
            if (!stats) {
              skipped++
              continue
            }

            const fpts = stats.points ?? 0
            const fptsPpr = stats.points_ppr ?? null
            const fptsHalf = stats.points_half ?? null

            try {
              await db.playerProjection.upsert({
                where: {
                  playerId_source_week_season_isRos: {
                    playerId: sleeperId,
                    source: 'fantasypros',
                    week: isRos ? 0 : week,
                    season,
                    isRos,
                  },
                },
                create: {
                  playerId: sleeperId,
                  source: 'fantasypros',
                  week: isRos ? 0 : week,
                  season,
                  isRos,
                  fpts,
                  fptsPpr,
                  fptsHalf,
                  passYds: stats.pass_yds ?? null,
                  passTd: stats.pass_tds ?? null,
                  rushYds: stats.rush_yds ?? null,
                  rushTd: stats.rush_tds ?? null,
                  recYds: stats.rec_yds ?? null,
                  recTd: stats.rec_tds ?? null,
                  receptions: stats.rec ?? null,
                  fetchedAt: now,
                },
                update: {
                  fpts,
                  fptsPpr,
                  fptsHalf,
                  passYds: stats.pass_yds ?? null,
                  passTd: stats.pass_tds ?? null,
                  rushYds: stats.rush_yds ?? null,
                  rushTd: stats.rush_tds ?? null,
                  recYds: stats.rec_yds ?? null,
                  recTd: stats.rec_tds ?? null,
                  receptions: stats.rec ?? null,
                  fetchedAt: now,
                },
              })
              upserted++
            } catch (err) {
              errors.push(`${sleeperId} ros=${isRos}: ${err instanceof Error ? err.message : String(err)}`)
            }
          }

          await sleep(1100)
        } catch (err) {
          errors.push(`${position}/ros=${isRos}: ${err instanceof Error ? err.message : String(err)}`)
          await sleep(1100)
        }
      }
    }

    console.log(`[fantasypros] syncProjections done — upserted=${upserted} skipped=${skipped} errors=${errors.length}`)
    return { upserted, skipped, errors }
  },

  /**
   * Sync latest FantasyPros NFL news into ContentItem + ContentPlayerMention.
   *
   * News items are stored as platform='api', tier=1 content. The expert-written
   * `impact` field is appended to rawContent making it the highest-signal
   * content in the injection layer.
   *
   * Deduplicates by a stable URL derived from the news item ID.
   */
  async syncNews(): Promise<FPNewsSyncResult> {
    console.log('[fantasypros] syncNews — fetching latest NFL news...')

    const raw = await fpFetch<unknown>('/NFL/news', { limit: '100' })
    const parsed = FPNewsResponseSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`[fantasypros] syncNews parse error: ${parsed.error.message}`)
    }

    const fpIdMap = await buildFpToSleeperMap()

    // Load or create the FantasyPros ContentSource record
    const source = await db.contentSource.upsert({
      where: { platform_feedUrl: { platform: 'api', feedUrl: 'https://api.fantasypros.com/public/v2/json/NFL/news' } },
      create: {
        name: 'FantasyPros News',
        platform: 'api',
        feedUrl: 'https://api.fantasypros.com/public/v2/json/NFL/news',
        tier: 1,
        isActive: true,
        refreshIntervalMins: 360,
        lastFetchedAt: new Date(),
      },
      update: { lastFetchedAt: new Date() },
    })

    // Load all player aliases for entity resolution (for items without an fpid)
    const aliasRows = await db.playerAlias.findMany({ select: { alias: true, playerId: true, aliasType: true } })
    const aliasLookup: AliasLookup[] = aliasRows.map((a) => ({ alias: a.alias, playerId: a.playerId, aliasType: a.aliasType }))

    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (const item of parsed.data.items) {
      const canonicalUrl = `https://fantasypros.com/news/${item.id}`

      // Check for duplicate
      const existing = await db.contentItem.findUnique({ where: { sourceUrl: canonicalUrl }, select: { id: true } })
      if (existing) {
        skipped++
        continue
      }

      // Combine desc + impact into rawContent for maximum signal density
      const desc = item.desc ?? ''
      const impact = item.impact ? `\n\nFantasy Impact: ${item.impact}` : ''
      const rawContent = `${item.title}\n\n${desc}${impact}`.trim()

      // Infer topics from content
      const topics = inferTopics(rawContent)

      let publishedAt: Date | null = null
      try {
        publishedAt = item.created ? new Date(item.created) : null
      } catch { /* ignore parse errors */ }

      try {
        const contentItem = await db.contentItem.create({
          data: {
            sourceId: source.id,
            contentType: 'stat_update',
            sourceUrl: canonicalUrl,
            title: item.title,
            rawContent,
            authorName: item.author ?? 'FantasyPros',
            publishedAt,
            topics,
            fetchedAt: new Date(),
          },
        })

        // Resolve player mentions — prefer the explicit fpid, fall back to text extraction
        const mentionedPlayerIds = new Set<string>()

        if (item.player_id) {
          const sleeperId = fpIdMap.get(String(item.player_id))
          if (sleeperId) mentionedPlayerIds.add(sleeperId)
        }

        // Also scan text for additional player mentions
        const textMatches = resolvePlayerMentions(rawContent, aliasLookup)
        for (const match of textMatches) mentionedPlayerIds.add(match.playerId)

        for (const sleeperId of mentionedPlayerIds) {
          try {
            // Find the match object for snippet extraction (if available from text scan)
            const matchObj = textMatches.find((m) => m.playerId === sleeperId)
            const context = inferMentionContext(rawContent)
            const snippet = matchObj ? extractSnippet(rawContent, matchObj) : null

            await db.contentPlayerMention.upsert({
              where: { contentId_playerId: { contentId: contentItem.id, playerId: sleeperId } },
              create: { contentId: contentItem.id, playerId: sleeperId, context, snippet: snippet ?? null },
              update: {},
            })
          } catch { /* skip invalid player IDs */ }
        }

        inserted++
      } catch (err) {
        errors.push(`news#${item.id}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    console.log(`[fantasypros] syncNews done — inserted=${inserted} skipped=${skipped} errors=${errors.length}`)
    return { inserted, skipped, errors }
  },

  /**
   * Sync FantasyPros injury data into Player records.
   *
   * Updates probabilityOfPlaying, injuryStatus, and practiceParticipation
   * for all players on the injury report. Resolves FP IDs via PlayerExternalId.
   */
  async syncInjuries(): Promise<FPInjuriesSyncResult> {
    console.log('[fantasypros] syncInjuries — fetching NFL injury report...')

    const raw = await fpFetch<unknown>('/NFL/injuries', { include_probabilities: 'true' })
    const parsed = FPInjuriesResponseSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`[fantasypros] syncInjuries parse error: ${parsed.error.message}`)
    }

    const fpIdMap = await buildFpToSleeperMap()

    let updated = 0
    let skipped = 0
    const errors: string[] = []

    // First: clear all existing probabilityOfPlaying values so healthy players
    // (no longer on the report) revert to null rather than keeping stale data
    await db.player.updateMany({ data: { probabilityOfPlaying: null } })

    for (const injury of parsed.data.injuries) {
      const fpId = String(injury.player_id)
      const sleeperId = fpIdMap.get(fpId)
      if (!sleeperId) {
        skipped++
        continue
      }

      // Parse probability — FP returns it as a string like "0.887"
      let probabilityOfPlaying: number | null = null
      if (injury.probability_of_playing != null) {
        const parsed = parseFloat(String(injury.probability_of_playing))
        if (!isNaN(parsed)) probabilityOfPlaying = parsed
      }

      // Map FP practice participation to our enum values
      const practiceParticipation = mapPracticeStatus(
        injury.practice_3 ?? injury.practice_2 ?? injury.practice_1,
      )

      try {
        await db.player.updateMany({
          where: { sleeperId },
          data: {
            injuryStatus: injury.status ?? null,
            practiceParticipation,
            probabilityOfPlaying,
            lastRefreshedAt: new Date(),
          },
        })
        updated++
      } catch (err) {
        errors.push(`${sleeperId}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    console.log(`[fantasypros] syncInjuries done — updated=${updated} skipped=${skipped} errors=${errors.length}`)
    return { updated, skipped, errors }
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a reverse lookup: FP player_id (string) → sleeperId */
async function buildFpToSleeperMap(): Promise<Map<string, string>> {
  const mappings = await db.playerExternalId.findMany({
    where: { source: 'fantasypros' },
    select: { externalId: true, sleeperId: true },
  })
  return new Map(mappings.map((m) => [m.externalId, m.sleeperId]))
}

/** Extract the numeric part of a positional rank string like "RB12" → 12 */
function extractPositionNumber(posRank: string | null | undefined): number {
  if (!posRank) return 999
  const match = posRank.match(/\d+/)
  return match ? parseInt(match[0], 10) : 999
}

/** Map FP practice status strings to our practiceParticipation enum values */
function mapPracticeStatus(status: string | null | undefined): string | null {
  if (!status) return null
  const s = status.toLowerCase()
  if (s === 'full' || s === 'fp') return 'Full'
  if (s === 'limit' || s === 'limited' || s === 'lp') return 'Limited'
  if (s === 'dnp' || s === 'did not practice') return 'Did Not Practice'
  return null
}

/** Cache of sleeperId → display name to avoid repeated DB lookups */
const playerNameCache = new Map<string, string>()

async function getPlayerName(sleeperId: string): Promise<string> {
  if (playerNameCache.has(sleeperId)) return playerNameCache.get(sleeperId)!
  const p = await db.player.findUnique({
    where: { sleeperId },
    select: { firstName: true, lastName: true },
  })
  const name = p ? `${p.firstName} ${p.lastName}`.trim() : sleeperId
  playerNameCache.set(sleeperId, name)
  return name
}

function inferTopics(text: string): string[] {
  const lower = text.toLowerCase()
  const topics: string[] = []
  if (lower.includes('injur') || lower.includes('questionable') || lower.includes('doubtful') || lower.includes(' out ')) topics.push('injury')
  if (lower.includes('trade') || lower.includes('traded')) topics.push('trade')
  if (lower.includes('waiver') || lower.includes('add') || lower.includes('drop')) topics.push('waiver')
  if (lower.includes('depth chart') || lower.includes('starter') || lower.includes('backup')) topics.push('depth_chart')
  if (lower.includes('breakout') || lower.includes('target share') || lower.includes('opportunity')) topics.push('breakout')
  if (lower.includes('touchdown') || lower.includes('yards') || lower.includes('points')) topics.push('stat_update')
  return [...new Set(topics)]
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
