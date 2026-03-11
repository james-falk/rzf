/**
 * Fantasy Football Calculator (FFC) ADP Connector
 *
 * Free, public REST API — no auth required.
 * Returns average draft position (ADP) data aggregated from real drafts.
 * Refreshes once daily on FFC's end — don't poll more than once/day.
 *
 * API: GET https://fantasyfootballcalculator.com/api/v1/adp/{format}
 *   ?teams=12&year={year}&position=all
 *   format: standard | ppr | half-ppr | dynasty | 2qb
 */

import { db } from '@rzf/db'
import { SleeperConnector } from '../sleeper/index.js'

const FFC_BASE = 'https://fantasyfootballcalculator.com/api/v1/adp'

interface FFCPlayer {
  id: number
  name: string
  position: string
  team: string
  adp: number
  adp_formatted: string
  times_drafted: number
  high: number
  low: number
  stdev: number
  bye: number
}

interface FFCResponse {
  players: FFCPlayer[]
}

async function fetchADP(format: string, year: number): Promise<FFCPlayer[]> {
  const qs = new URLSearchParams({ teams: '12', year: String(year), position: 'all' })
  const res = await fetch(`${FFC_BASE}/${format}?${qs}`, {
    headers: { 'User-Agent': 'RedZoneFantasy/1.0' },
  })

  if (!res.ok) {
    throw new Error(`FFC API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json() as FFCResponse
  return data.players ?? []
}

export interface FFCRunResult {
  upserted: number
  matched: number
  unmatched: number
  year: number
  week: number
}

export const FFCConnector = {
  /**
   * Fetch PPR, half-PPR, and standard ADP from Fantasy Football Calculator.
   * Stores to PlayerRanking with source = 'ffc_adp_{format}'.
   */
  async run(): Promise<FFCRunResult> {
    console.log('[ffc] Fetching ADP data...')

    const nflState = await SleeperConnector.getNFLState()
    const year = parseInt(nflState.season, 10)
    const week = nflState.week

    const [pprData, halfPprData, standardData] = await Promise.all([
      fetchADP('ppr', year),
      fetchADP('half-ppr', year),
      fetchADP('standard', year),
    ])

    // Build player name → ADP lookup
    const buildMap = (players: FFCPlayer[]) =>
      new Map(players.map((p) => [p.name.toLowerCase().trim(), p]))

    const pprMap = buildMap(pprData)
    const halfPprMap = buildMap(halfPprData)
    const standardMap = buildMap(standardData)

    // Load all players
    const dbPlayers = await db.player.findMany({
      select: { sleeperId: true, firstName: true, lastName: true, position: true },
    })

    let upserted = 0
    let matched = 0
    let unmatched = 0

    for (const player of dbPlayers) {
      const fullName = `${player.firstName} ${player.lastName}`.trim().toLowerCase()
      const ppr = pprMap.get(fullName)
      const halfPpr = halfPprMap.get(fullName)
      const standard = standardMap.get(fullName)

      if (!ppr && !halfPpr && !standard) {
        unmatched++
        continue
      }

      matched++

      const formats = [
        { source: 'ffc_adp_ppr', data: ppr },
        { source: 'ffc_adp_half_ppr', data: halfPpr },
        { source: 'ffc_adp_standard', data: standard },
      ] as const

      for (const { source, data } of formats) {
        if (!data) continue
        try {
          await db.playerRanking.upsert({
            where: { playerId_source_week_season: { playerId: player.sleeperId, source, week, season: year } },
            create: {
              playerId: player.sleeperId,
              source,
              rankOverall: Math.round(data.adp),
              rankPosition: 0, // FFC doesn't provide positional rank directly
              week,
              season: year,
              fetchedAt: new Date(),
            },
            update: {
              rankOverall: Math.round(data.adp),
              fetchedAt: new Date(),
            },
          })
          upserted++
        } catch {
          // skip individual errors
        }
      }
    }

    console.log(`[ffc] Done — ${upserted} rankings upserted, ${matched} matched, ${unmatched} unmatched`)
    return { upserted, matched, unmatched, year, week }
  },
}
