/**
 * Yahoo Fantasy rankings → PlayerRanking (source=yahoo).
 * OAuth refresh-token flow. See docs/INGESTION_ESPN_YAHOO.md.
 */

import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'

export interface YahooRankingsSyncResult {
  upserted: number
  skipped: number
}

async function yahooAccessToken(): Promise<string> {
  const { YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, YAHOO_REFRESH_TOKEN } = env
  if (!YAHOO_CLIENT_ID || !YAHOO_CLIENT_SECRET || !YAHOO_REFRESH_TOKEN) {
    throw new Error(
      'Yahoo rankings require YAHOO_CLIENT_ID, YAHOO_CLIENT_SECRET, YAHOO_REFRESH_TOKEN. See docs/INGESTION_ESPN_YAHOO.md.',
    )
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: YAHOO_REFRESH_TOKEN,
    client_id: YAHOO_CLIENT_ID,
    client_secret: YAHOO_CLIENT_SECRET,
  })

  const res = await fetch('https://api.login.yahoo.com/oauth2/get_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(30_000),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Yahoo OAuth token failed HTTP ${res.status}: ${t.slice(0, 300)}`)
  }

  const j = (await res.json()) as { access_token?: string }
  if (!j.access_token) throw new Error('Yahoo OAuth: no access_token in response')
  return j.access_token
}

/** Walk Yahoo fantasy JSON for player_id + numeric rank fields */
function collectYahooRanks(node: unknown, out: Map<string, number>): void {
  if (node == null) return
  if (Array.isArray(node)) {
    for (const x of node) collectYahooRanks(x, out)
    return
  }
  if (typeof node !== 'object') return
  const o = node as Record<string, unknown>

  const pid = o.player_id ?? o.yahoo_id
  if (typeof pid === 'string' || typeof pid === 'number') {
    const rankRaw = o.rank ?? o.player_rank ?? o.display_position_rank
    if (typeof rankRaw === 'number' && rankRaw > 0) {
      out.set(String(pid), rankRaw)
    }
  }

  for (const v of Object.values(o)) collectYahooRanks(v, out)
}

export async function syncYahooFantasyRankings(week: number, season: number): Promise<YahooRankingsSyncResult> {
  const token = await yahooAccessToken()

  // Broad players fetch — Yahoo nests ranks differently by endpoint; we walk the tree.
  const url =
    'https://fantasysports.yahooapis.com/fantasy/v2/game/nfl/players;start=0;count=500?format=json'
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(120_000),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error(`Yahoo Fantasy API HTTP ${res.status}: ${t.slice(0, 300)}`)
  }

  const json = (await res.json()) as unknown
  const rankByYahooId = new Map<string, number>()
  collectYahooRanks(json, rankByYahooId)

  const now = new Date()
  let upserted = 0
  let skipped = 0

  for (const [yahooId, rankOverall] of rankByYahooId) {
    const ext = await db.playerExternalId.findFirst({
      where: { source: 'yahoo', externalId: yahooId },
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
          source: 'yahoo',
          week,
          season,
        },
      },
      create: {
        playerId: ext.sleeperId,
        source: 'yahoo',
        week,
        season,
        rankOverall,
        rankPosition: 0,
        fetchedAt: now,
      },
      update: {
        rankOverall,
        fetchedAt: now,
      },
    })
    upserted++
  }

  if (upserted === 0) {
    console.warn(
      '[yahoo] 0 ranking upserts — Yahoo JSON may not include rank fields in this endpoint; extend parser or use a rankings-specific resource (docs/INGESTION_ESPN_YAHOO.md).',
    )
  }

  return { upserted, skipped }
}
