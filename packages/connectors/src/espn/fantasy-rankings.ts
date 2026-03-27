/**
 * ESPN Fantasy player rankings → PlayerRanking (source=espn).
 *
 * ESPN blocks unauthenticated JSON for the main players pool; a browser session
 * cookie is required. Set `ESPN_FANTASY_COOKIE` in the worker env (see docs/INGESTION_ESPN_YAHOO.md).
 */

import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'

export interface EspnRankingsSyncResult {
  upserted: number
  skipped: number
}

function extractEspnPlayerId(row: Record<string, unknown>): number | null {
  if (typeof row.id === 'number') return row.id
  const p = row.player
  if (p && typeof p === 'object' && typeof (p as { id?: number }).id === 'number') {
    return (p as { id: number }).id
  }
  return null
}

function extractRanks(row: Record<string, unknown>): { overall: number; position: number } | null {
  const dr = row.draftRanksByRankType as
    | Record<string, { rank?: number; positionalRank?: number }>
    | undefined
  const ppr = dr?.PPR ?? dr?.STANDARD ?? dr?.HALF_PPR
  if (ppr && typeof ppr.rank === 'number') {
    return { overall: ppr.rank, position: ppr.positionalRank ?? 0 }
  }
  const rank = row.rank
  if (typeof rank === 'number') return { overall: rank, position: 0 }
  const pr = row.player as Record<string, unknown> | undefined
  if (pr && typeof pr.rank === 'number') return { overall: pr.rank as number, position: 0 }
  return null
}

export async function syncEspnFantasyRankings(week: number, season: number): Promise<EspnRankingsSyncResult> {
  const cookie = env.ESPN_FANTASY_COOKIE?.trim()
  if (!cookie) {
    throw new Error(
      'ESPN fantasy rankings require ESPN_FANTASY_COOKIE (browser Cookie from fantasy.espn.com). See docs/INGESTION_ESPN_YAHOO.md.',
    )
  }

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/players?scoringPeriodId=${week}&view=players_wl`
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: 'application/json',
      Cookie: cookie,
    },
    signal: AbortSignal.timeout(120_000),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`ESPN fantasy HTTP ${res.status}: ${text.slice(0, 200)}`)
  }
  if (text.trim().startsWith('<!') || text.trim().startsWith('<html')) {
    throw new Error('ESPN fantasy returned HTML — cookie may be expired or invalid')
  }

  let data: { players?: unknown[] }
  try {
    data = JSON.parse(text) as { players?: unknown[] }
  } catch {
    throw new Error('ESPN fantasy response was not valid JSON')
  }

  const rows = data.players ?? []
  const now = new Date()
  let upserted = 0
  let skipped = 0

  for (const row of rows) {
    if (!row || typeof row !== 'object') {
      skipped++
      continue
    }
    const r = row as Record<string, unknown>
    const espnId = extractEspnPlayerId(r)
    if (!espnId) {
      skipped++
      continue
    }

    const ranks = extractRanks(r)
    if (!ranks) {
      skipped++
      continue
    }

    const ext = await db.playerExternalId.findFirst({
      where: { source: 'espn', externalId: String(espnId) },
      select: { sleeperId: true },
    })
    if (!ext) {
      skipped++
      continue
    }

    await db.playerRanking.upsert({
      where: {
        playerId_source_week_season: {
          playerId: ext.sleeperId,
          source: 'espn',
          week,
          season,
        },
      },
      create: {
        playerId: ext.sleeperId,
        source: 'espn',
        week,
        season,
        rankOverall: ranks.overall,
        rankPosition: ranks.position,
        fetchedAt: now,
      },
      update: {
        rankOverall: ranks.overall,
        rankPosition: ranks.position,
        fetchedAt: now,
      },
    })
    upserted++
  }

  if (upserted === 0 && rows.length > 0) {
    console.warn(
      '[espn] Fantasy rankings: 0 upserts — check JSON shape (draftRanksByRankType) or ESPN id mappings',
    )
  }

  return { upserted, skipped }
}
