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
  unmatched: number
  errors: string[]
}

/**
 * Batch sync player trade values from Dynasty Daddy into PlayerTradeValue.
 *
 * Pulls three market endpoints in parallel:
 *   market=0 (KTC dynasty) → dynasty1qb + dynastySf → source='ktc'
 *   market=4 (KTC redraft) → redraft                → merged into source='ktc'
 *   /today   (DD own)      → dynasty1qb + dynastySf → source='dynastydaddy'
 *
 * Matching is done by Sleeper ID (if available on the DD player object) with
 * a name-based fallback.
 */
export async function syncValues(): Promise<DynastyDaddySyncResult> {
  console.log('[dynastydaddy] Fetching market values...')

  const [ktcDynastyData, ktcRedraftData, ddTodayData] = await Promise.all([
    ddFetch<DDMarketPlayer[]>('/player/all/market/0'),
    ddFetch<DDMarketPlayer[]>('/player/all/market/4'),
    ddFetch<DDMarketPlayer[]>('/player/all/today'),
  ])

  console.log(
    `[dynastydaddy] Fetched ${ktcDynastyData.length} KTC dynasty, ${ktcRedraftData.length} KTC redraft, ${ddTodayData.length} DD today`,
  )

  // Build lookup maps by name_id (e.g. "justinjeffersonwr")
  const ktcDynMap = new Map(ktcDynastyData.map((p) => [p.name_id, p]))
  const ktcRdMap = new Map(ktcRedraftData.map((p) => [p.name_id, p]))
  const ddMap = new Map(ddTodayData.map((p) => [p.name_id, p]))

  const players = await db.player.findMany({
    select: { sleeperId: true, firstName: true, lastName: true, position: true },
  })

  let ktcUpserted = 0
  let ddUpserted = 0
  let unmatched = 0
  const errors: string[] = []

  for (const player of players) {
    const nameId = nameIdFromPlayer(player.firstName, player.lastName, player.position ?? '')

    const ktcDyn = ktcDynMap.get(nameId)
    const ktcRd = ktcRdMap.get(nameId)
    const ddEntry = ddMap.get(nameId)

    const hasKtc = ktcDyn ?? ktcRd
    const hasDD = !!ddEntry

    if (!hasKtc && !hasDD) {
      unmatched++
      continue
    }

    try {
      if (hasKtc) {
        await db.playerTradeValue.upsert({
          where: { sleeperId_source: { sleeperId: player.sleeperId, source: 'ktc' } },
          create: {
            sleeperId: player.sleeperId,
            source: 'ktc',
            dynasty1qb: ktcDyn?.trade_value ?? null,
            dynastySf: ktcDyn?.sf_trade_value ?? null,
            redraft: ktcRd?.trade_value ?? null,
            trend30d: ktcDyn
              ? ((ktcDyn.trade_value ?? 0) - (ktcDyn.last_month_value ?? ktcDyn.trade_value ?? 0))
              : null,
            fetchedAt: new Date(),
          },
          update: {
            dynasty1qb: ktcDyn?.trade_value ?? null,
            dynastySf: ktcDyn?.sf_trade_value ?? null,
            redraft: ktcRd?.trade_value ?? null,
            trend30d: ktcDyn
              ? ((ktcDyn.trade_value ?? 0) - (ktcDyn.last_month_value ?? ktcDyn.trade_value ?? 0))
              : null,
            fetchedAt: new Date(),
          },
        })
        ktcUpserted++
      }

      if (hasDD) {
        await db.playerTradeValue.upsert({
          where: { sleeperId_source: { sleeperId: player.sleeperId, source: 'dynastydaddy' } },
          create: {
            sleeperId: player.sleeperId,
            source: 'dynastydaddy',
            dynasty1qb: ddEntry.trade_value ?? null,
            dynastySf: ddEntry.sf_trade_value ?? null,
            redraft: null,
            trend30d: ddEntry.trade_value != null && ddEntry.last_month_value != null
              ? ddEntry.trade_value - ddEntry.last_month_value
              : null,
            fetchedAt: new Date(),
          },
          update: {
            dynasty1qb: ddEntry.trade_value ?? null,
            dynastySf: ddEntry.sf_trade_value ?? null,
            redraft: null,
            trend30d: ddEntry.trade_value != null && ddEntry.last_month_value != null
              ? ddEntry.trade_value - ddEntry.last_month_value
              : null,
            fetchedAt: new Date(),
          },
        })
        ddUpserted++
      }
    } catch (err) {
      errors.push(`${player.firstName} ${player.lastName}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(
    `[dynastydaddy] Sync done — KTC upserted: ${ktcUpserted}, DD upserted: ${ddUpserted}, unmatched: ${unmatched}`,
  )
  return { ktcUpserted, ddUpserted, unmatched, errors }
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
  getPlayerTrades,
  searchTrades,
  nameIdFromPlayer,
}
