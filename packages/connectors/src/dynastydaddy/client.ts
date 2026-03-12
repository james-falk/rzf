/**
 * Dynasty Daddy Connector
 *
 * dynasty-daddy.com is open-source (github.com/leondoff/dynasty-daddy) and aggregates
 * player trade values from multiple markets: KTC (dynasty + redraft), FantasyCalc,
 * DynastyProcess, and DynastySuperflex. All endpoints are unauthenticated server-side.
 *
 * Markets:
 *   0 = KTC dynasty (primary/default)
 *   1 = FantasyCalc dynasty
 *   2 = DynastyProcess
 *   3 = DynastySuperflex
 *   4 = KTC redraft
 *   5 = FantasyCalc redraft
 *
 * Value sync pulls markets 0, 2, 3, 4 + /today into PlayerTradeValue.
 * Trade volume sync pulls /trade/volume into PlayerTradeVolume.
 */

import { db } from '@rzf/db'

const DD_BASE = 'https://dynasty-daddy.com/api/v1'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DDMarketPlayer {
  name_id: string
  full_name: string
  position: string
  team: string | null
  age: number | null
  // Dynasty 1QB and SF values (normalized field names across markets)
  trade_value: number | null
  sf_trade_value: number | null
  all_time_high_sf: number | null
  all_time_low_sf: number | null
  all_time_high: number | null
  all_time_low: number | null
  last_month_value: number | null
  last_month_value_sf: number | null
  // Sleeper ID is embedded in name_id derivation; we match by name
  sleeper_id?: string | null
}

interface DDTrade {
  sideA: string[]
  sideB: string[]
  transaction_date: string
  league_id: string
  platform?: string
}

interface DDTradeResponse {
  trades: DDTrade[]
  tradeVolume: Array<{ week_interval: number; count: number; rank: number }>
}

interface DDTradeVolumeEntry {
  id: string          // sleeper_id
  week_interval: number
  count: number
  rank: number
  position: string
  position_rank: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function ddFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${DD_BASE}${path}`, {
    ...init,
    headers: {
      'User-Agent': 'RedZoneFantasy/1.0',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    throw new Error(`Dynasty Daddy API error ${res.status} at ${path}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

/**
 * Derive Dynasty Daddy name_id from a player's name and position.
 * Format: firstnamelastnameposition (lowercase, alpha only)
 * e.g. "Justin Jefferson WR" → "justinjeffersonwr"
 * e.g. "C.J. Stroud QB" → "cjstroudqb"
 */
export function nameIdFromPlayer(firstName: string, lastName: string, position: string): string {
  return `${firstName}${lastName}${position}`.toLowerCase().replace(/[^a-z]/g, '')
}

// ─── Value Sync ────────────────────────────────────────────────────────────────

export interface DynastyDaddySyncResult {
  ktcUpserted: number
  ddUpserted: number
  dpUpserted: number
  dsUpserted: number
  unmatched: number
  errors: string[]
}

export interface DynastyDaddyVolumeResult {
  upserted: number
  skipped: number
  errors: string[]
}

/**
 * Upsert helper for a single source into PlayerTradeValue.
 * dynasty1qb = trade_value, dynastySf = sf_trade_value, redraft = trade_value (for KTC redraft only).
 */
async function upsertPlayerValue(
  sleeperId: string,
  source: string,
  entry: DDMarketPlayer,
  redraftEntry?: DDMarketPlayer,
): Promise<void> {
  const trend =
    entry.trade_value != null && entry.last_month_value != null
      ? entry.trade_value - entry.last_month_value
      : null

  const data = {
    sleeperId,
    source,
    dynasty1qb: entry.trade_value ?? null,
    dynastySf: entry.sf_trade_value ?? null,
    redraft: redraftEntry?.trade_value ?? null,
    trend30d: trend,
    fetchedAt: new Date(),
  }

  await db.playerTradeValue.upsert({
    where: { sleeperId_source: { sleeperId, source } },
    create: data,
    update: {
      dynasty1qb: data.dynasty1qb,
      dynastySf: data.dynastySf,
      redraft: data.redraft,
      trend30d: data.trend30d,
      fetchedAt: data.fetchedAt,
    },
  })
}

/**
 * Batch sync player trade values from Dynasty Daddy into PlayerTradeValue.
 *
 * Pulls five market endpoints in parallel:
 *   market=0 (KTC dynasty)      → source='ktc'           (dynasty1qb, dynastySf)
 *   market=4 (KTC redraft)      → merged into source='ktc' (redraft)
 *   market=2 (DynastyProcess)   → source='dynastyprocess' (dynasty1qb, dynastySf)
 *   market=3 (DynastySuperflex) → source='dynastysuperflex' (dynasty1qb, dynastySf)
 *   /today   (DD own values)    → source='dynastydaddy'   (dynasty1qb, dynastySf)
 *
 * Matching is done by name_id (firstnamelastnamePOSITION, lowercase alpha only).
 */
export async function syncValues(): Promise<DynastyDaddySyncResult> {
  console.log('[dynastydaddy] Fetching market values (markets 0, 2, 3, 4 + today)...')

  const [ktcDynastyData, ktcRedraftData, dpData, dsData, ddTodayData] = await Promise.all([
    ddFetch<DDMarketPlayer[]>('/player/all/market/0'),
    ddFetch<DDMarketPlayer[]>('/player/all/market/4'),
    ddFetch<DDMarketPlayer[]>('/player/all/market/2'),
    ddFetch<DDMarketPlayer[]>('/player/all/market/3'),
    ddFetch<DDMarketPlayer[]>('/player/all/today'),
  ])

  console.log(
    `[dynastydaddy] Fetched KTC=${ktcDynastyData.length}, KTCrd=${ktcRedraftData.length}, DP=${dpData.length}, DS=${dsData.length}, DD=${ddTodayData.length}`,
  )

  const ktcDynMap = new Map(ktcDynastyData.map((p) => [p.name_id, p]))
  const ktcRdMap  = new Map(ktcRedraftData.map((p) => [p.name_id, p]))
  const dpMap     = new Map(dpData.map((p) => [p.name_id, p]))
  const dsMap     = new Map(dsData.map((p) => [p.name_id, p]))
  const ddMap     = new Map(ddTodayData.map((p) => [p.name_id, p]))

  const players = await db.player.findMany({
    select: { sleeperId: true, firstName: true, lastName: true, position: true },
  })

  let ktcUpserted = 0
  let ddUpserted  = 0
  let dpUpserted  = 0
  let dsUpserted  = 0
  let unmatched   = 0
  const errors: string[] = []

  for (const player of players) {
    const nameId = nameIdFromPlayer(player.firstName, player.lastName, player.position ?? '')

    const ktcDyn = ktcDynMap.get(nameId)
    const ktcRd  = ktcRdMap.get(nameId)
    const dp     = dpMap.get(nameId)
    const ds     = dsMap.get(nameId)
    const dd     = ddMap.get(nameId)

    if (!ktcDyn && !ktcRd && !dp && !ds && !dd) {
      unmatched++
      continue
    }

    try {
      if (ktcDyn ?? ktcRd) {
        const base = ktcDyn ?? ({ trade_value: null, sf_trade_value: null, last_month_value: null } as DDMarketPlayer)
        await upsertPlayerValue(player.sleeperId, 'ktc', base, ktcRd)
        ktcUpserted++
      }
      if (dp) { await upsertPlayerValue(player.sleeperId, 'dynastyprocess', dp); dpUpserted++ }
      if (ds) { await upsertPlayerValue(player.sleeperId, 'dynastysuperflex', ds); dsUpserted++ }
      if (dd) { await upsertPlayerValue(player.sleeperId, 'dynastydaddy', dd); ddUpserted++ }
    } catch (err) {
      errors.push(`${player.firstName} ${player.lastName}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[dynastydaddy] Sync done — KTC=${ktcUpserted}, DP=${dpUpserted}, DS=${dsUpserted}, DD=${ddUpserted}, unmatched=${unmatched}`,
  )
  return { ktcUpserted, ddUpserted, dpUpserted, dsUpserted, unmatched, errors }
}

// ─── Trade Volume Sync ────────────────────────────────────────────────────────

/**
 * Bulk sync 8-week community trade frequency for all players from Dynasty Daddy.
 * One API call returns data for all players. Upserts into PlayerTradeVolume.
 */
export async function syncTradeVolume(): Promise<DynastyDaddyVolumeResult> {
  console.log('[dynastydaddy] Fetching bulk trade volume...')

  const volumeData = await ddFetch<DDTradeVolumeEntry[]>('/trade/volume')

  console.log(`[dynastydaddy] Trade volume entries received: ${volumeData.length}`)

  // Group by sleeper_id, collect all week intervals per player
  const byPlayer = new Map<string, Map<number, DDTradeVolumeEntry>>()
  for (const entry of volumeData) {
    if (!entry.id) continue
    if (!byPlayer.has(entry.id)) byPlayer.set(entry.id, new Map())
    byPlayer.get(entry.id)!.set(entry.week_interval, entry)
  }

  let upserted = 0
  let skipped  = 0
  const errors: string[] = []

  for (const [sleeperId, intervals] of byPlayer) {
    const w1 = intervals.get(1)
    const w2 = intervals.get(2)
    const w4 = intervals.get(4)
    const w8 = intervals.get(8)

    try {
      await db.playerTradeVolume.upsert({
        where: { sleeperId },
        create: {
          sleeperId,
          count1w: w1?.count ?? null,
          count2w: w2?.count ?? null,
          count4w: w4?.count ?? null,
          count8w: w8?.count ?? null,
          rank1w:  w1?.rank  ?? null,
          rank4w:  w4?.rank  ?? null,
          rank8w:  w8?.rank  ?? null,
          fetchedAt: new Date(),
        },
        update: {
          count1w: w1?.count ?? null,
          count2w: w2?.count ?? null,
          count4w: w4?.count ?? null,
          count8w: w8?.count ?? null,
          rank1w:  w1?.rank  ?? null,
          rank4w:  w4?.rank  ?? null,
          rank8w:  w8?.rank  ?? null,
          fetchedAt: new Date(),
        },
      })
      upserted++
    } catch (err) {
      // Player may not exist in our DB yet — skip silently
      if (err instanceof Error && err.message.includes('Foreign key')) {
        skipped++
      } else {
        errors.push(`${sleeperId}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
  }

  console.log(`[dynastydaddy] Trade volume sync done — upserted=${upserted}, skipped=${skipped}`)
  return { upserted, skipped, errors }
}

// ─── Query-Time Trade Lookups ──────────────────────────────────────────────────

/**
 * Get the last 10 community trades involving a player + 8-week volume stats.
 * Use nameIdFromPlayer() to generate the name_id.
 */
export async function getPlayerTrades(nameId: string): Promise<DDTradeResponse> {
  return ddFetch<DDTradeResponse>(`/player/details/trade/${nameId}`)
}

/**
 * Search community trades by Sleeper player IDs.
 * Returns up to pageLength trades where sideA contains any of the given IDs.
 */
export async function searchTrades(
  sleeperIds: string[],
  options: {
    isSuperflex?: boolean
    leagueType?: 'Dynasty' | 'Redraft'
    page?: number
    pageLength?: number
  } = {},
): Promise<{ trades: DDTrade[]; page: number; pageLength: number }> {
  return ddFetch('/trade/search', {
    method: 'POST',
    body: JSON.stringify({
      sideA: sleeperIds,
      sideB: [],
      isSuperflex: options.isSuperflex !== undefined ? [options.isSuperflex] : [],
      leagueType: options.leagueType ?? 'Dynasty',
      starters: [],
      teams: [],
      ppr: [],
      tep: [],
      page: options.page ?? 1,
      pageLength: options.pageLength ?? 10,
    }),
  })
}

export const DynastyDaddyConnector = {
  syncValues,
  syncTradeVolume,
  getPlayerTrades,
  searchTrades,
  nameIdFromPlayer,
}
