/**
 * FantasyCalc Connector
 *
 * Free, public API — no auth required.
 * Returns dynasty and redraft trade values for all NFL players, updated
 * continuously from real user trade data on fantasycalc.com.
 *
 * API: GET https://api.fantasycalc.com/values/current
 *   ?isDynasty=true|false
 *   &numQbs=1|2
 *   &numTeams=12
 *   &ppr=0|0.5|1
 */

import { db } from '@rzf/db'

const FC_BASE = 'https://api.fantasycalc.com'

interface FantasyCalcPlayer {
  value: number
  trend30Day: number
  overallRank: number
  positionRank: number
  player: {
    name: string
    position: string
    team: string | null
    sleeperId: string | null
  }
}

async function fetchValues(isDynasty: boolean, numQbs: 1 | 2 = 1): Promise<FantasyCalcPlayer[]> {
  const qs = new URLSearchParams({
    isDynasty: String(isDynasty),
    numQbs: String(numQbs),
    numTeams: '12',
    ppr: '1',
  })

  const res = await fetch(`${FC_BASE}/values/current?${qs}`, {
    headers: { 'User-Agent': 'RedZoneFantasy/1.0' },
  })

  if (!res.ok) {
    throw new Error(`FantasyCalc API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<FantasyCalcPlayer[]>
}

export interface FantasyCalcRunResult {
  upserted: number
  matched: number
  unmatched: number
  errors: string[]
}

export const FantasyCalcConnector = {
  /**
   * Fetch dynasty (1QB + SF) and redraft values from FantasyCalc,
   * map to Player records via Sleeper ID or name, upsert PlayerTradeValue rows.
   */
  async run(): Promise<FantasyCalcRunResult> {
    console.log('[fantasycalc] Fetching dynasty and redraft values...')

    const [dynasty1qbData, dynastySfData, redraftData] = await Promise.all([
      fetchValues(true, 1),
      fetchValues(true, 2),
      fetchValues(false, 1),
    ])

    // Build lookup maps keyed by sleeperId (preferred) and player name (fallback)
    const d1qbMap = new Map<string, FantasyCalcPlayer>()
    const dSfMap = new Map<string, FantasyCalcPlayer>()
    const redraftMap = new Map<string, FantasyCalcPlayer>()

    for (const entry of dynasty1qbData) {
      if (entry.player.sleeperId) d1qbMap.set(entry.player.sleeperId, entry)
      d1qbMap.set(entry.player.name.toLowerCase(), entry)
    }
    for (const entry of dynastySfData) {
      if (entry.player.sleeperId) dSfMap.set(entry.player.sleeperId, entry)
      dSfMap.set(entry.player.name.toLowerCase(), entry)
    }
    for (const entry of redraftData) {
      if (entry.player.sleeperId) redraftMap.set(entry.player.sleeperId, entry)
      redraftMap.set(entry.player.name.toLowerCase(), entry)
    }

    // Load all players to match against
    const players = await db.player.findMany({
      select: { sleeperId: true, firstName: true, lastName: true },
    })

    let upserted = 0
    let matched = 0
    let unmatched = 0
    const errors: string[] = []

    for (const player of players) {
      const fullName = `${player.firstName} ${player.lastName}`.trim().toLowerCase()
      const id = player.sleeperId

      const d1 = d1qbMap.get(id) ?? d1qbMap.get(fullName)
      const dSf = dSfMap.get(id) ?? dSfMap.get(fullName)
      const rd = redraftMap.get(id) ?? redraftMap.get(fullName)

      if (!d1 && !dSf && !rd) {
        unmatched++
        continue
      }

      matched++

      try {
        await db.playerTradeValue.upsert({
          where: { sleeperId_source: { sleeperId: id, source: 'fantasycalc' } },
          create: {
            sleeperId: id,
            source: 'fantasycalc',
            dynasty1qb: d1?.value ?? null,
            dynastySf: dSf?.value ?? null,
            redraft: rd?.value ?? null,
            trend30d: d1?.trend30Day ?? rd?.trend30Day ?? null,
            fetchedAt: new Date(),
          },
          update: {
            dynasty1qb: d1?.value ?? null,
            dynastySf: dSf?.value ?? null,
            redraft: rd?.value ?? null,
            trend30d: d1?.trend30Day ?? rd?.trend30Day ?? null,
            fetchedAt: new Date(),
          },
        })
        upserted++
      } catch (err) {
        errors.push(`${fullName}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }

    console.log(
      `[fantasycalc] Done — ${upserted} upserted, ${matched} matched, ${unmatched} unmatched`,
    )
    return { upserted, matched, unmatched, errors }
  },
}
