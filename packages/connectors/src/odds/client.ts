/**
 * The Odds API Connector
 *
 * Fetches NFL player prop betting lines from The Odds API.
 * Requires THE_ODDS_API_KEY in environment.
 *
 * Markets ingested:
 *   - player_rush_yds        Rushing yards over/under
 *   - player_rec_yds         Receiving yards over/under
 *   - player_pass_yds        Passing yards over/under
 *   - player_anytime_td      Anytime touchdown scorer odds
 *
 * Docs: https://the-odds-api.com/liveapi/guides/v4/
 * Free tier: 500 requests/month. Each ingest run = ~16 requests (1 per game).
 * Schedule: Wednesday + Saturday when lines firm up.
 */

import { db } from '@rzf/db'
import { resolvePlayerMentions } from '@rzf/shared'

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4'
const SPORT = 'americanfootball_nfl'

const MARKETS = [
  'player_rush_yds',
  'player_rec_yds',
  'player_pass_yds',
  'player_anytime_td',
].join(',')

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─── Types ────────────────────────────────────────────────────────────────────

interface OddsEvent {
  id: string
  sport_key: string
  commence_time: string
  home_team: string
  away_team: string
}

interface OddsOutcome {
  name: string
  description?: string
  price: number
  point?: number
}

interface OddsMarket {
  key: string
  outcomes: OddsOutcome[]
}

interface OddsBookmaker {
  key: string
  title: string
  markets: OddsMarket[]
}

interface OddsEventResponse {
  id: string
  bookmakers: OddsBookmaker[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = process.env['THE_ODDS_API_KEY']
  if (!key) throw new Error('THE_ODDS_API_KEY not configured')
  return key
}

async function oddsFetch<T>(path: string): Promise<T> {
  const apiKey = getApiKey()
  const url = `${ODDS_API_BASE}${path}${path.includes('?') ? '&' : '?'}apiKey=${apiKey}`
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) })
  if (res.status === 401) throw new Error('THE_ODDS_API_KEY is invalid')
  if (res.status === 429) throw new Error('The Odds API rate limit exceeded')
  if (!res.ok) throw new Error(`The Odds API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/**
 * Match a player name from The Odds API to a Sleeper player ID.
 * Uses our existing PlayerAlias system.
 */
function matchPlayerToSleeperId(
  name: string,
  aliases: Array<{ alias: string; playerId: string; aliasType: string }>,
): string | null {
  const matches = resolvePlayerMentions(name, aliases)
  return matches[0]?.playerId ?? null
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface OddsRunResult {
  eventsProcessed: number
  linesUpserted: number
  errors: string[]
}

export const OddsConnector = {
  /**
   * Fetch upcoming NFL events.
   */
  async getUpcomingEvents(): Promise<OddsEvent[]> {
    return oddsFetch<OddsEvent[]>(`/sports/${SPORT}/events`)
  },

  /**
   * Fetch player prop lines for a specific event.
   */
  async getEventProps(eventId: string): Promise<OddsEventResponse> {
    return oddsFetch<OddsEventResponse>(
      `/sports/${SPORT}/events/${eventId}/odds?markets=${MARKETS}&oddsFormat=american&regions=us`,
    )
  },

  /**
   * Main ingestion run: fetch all upcoming game props and store in PlayerPropLine.
   * Safe to re-run — upserts by (sleeperId, market, bookmaker).
   */
  async ingestProps(): Promise<OddsRunResult> {
    const errors: string[] = []
    let eventsProcessed = 0
    let linesUpserted = 0

    // Load aliases for player name matching
    const aliases = await db.playerAlias.findMany({
      where: { player: { status: { not: 'Inactive' } } },
      select: { alias: true, playerId: true, aliasType: true },
    })

    let events: OddsEvent[]
    try {
      events = await OddsConnector.getUpcomingEvents()
    } catch (err) {
      errors.push(`Failed to fetch events: ${err instanceof Error ? err.message : String(err)}`)
      return { eventsProcessed: 0, linesUpserted: 0, errors }
    }

    // Filter to NFL regular season / playoff games only
    const now = Date.now()
    const upcomingEvents = events.filter((e) => new Date(e.commence_time).getTime() > now)

    console.log(`[odds] Processing ${upcomingEvents.length} upcoming NFL events`)

    for (const event of upcomingEvents) {
      try {
        const eventData = await OddsConnector.getEventProps(event.id)

        for (const bookmaker of eventData.bookmakers) {
          for (const market of bookmaker.markets) {
            for (const outcome of market.outcomes) {
              // Outcome name is the player name for player prop markets
              const playerName = outcome.description ?? outcome.name
              const sleeperId = matchPlayerToSleeperId(playerName, aliases)
              if (!sleeperId) continue

              // For O/U markets: point is the line, price is the odds
              // For anytime TD: no line, just odds
              const isOverUnder = outcome.name === 'Over' || outcome.name === 'Under'
              const line = isOverUnder ? (outcome.point ?? null) : null
              const overOdds = outcome.name === 'Over' || market.key === 'player_anytime_td' ? outcome.price : null
              const underOdds = outcome.name === 'Under' ? outcome.price : null

              await db.playerPropLine.upsert({
                where: {
                  sleeperId_market_bookmaker: {
                    sleeperId,
                    market: market.key,
                    bookmaker: bookmaker.key,
                  },
                },
                create: {
                  sleeperId,
                  market: market.key,
                  bookmaker: bookmaker.key,
                  line,
                  overOdds: overOdds ? Math.round(overOdds) : null,
                  underOdds: underOdds ? Math.round(underOdds) : null,
                },
                update: {
                  line,
                  overOdds: overOdds ? Math.round(overOdds) : null,
                  underOdds: underOdds ? Math.round(underOdds) : null,
                  fetchedAt: new Date(),
                },
              })

              linesUpserted++
            }
          }
        }

        eventsProcessed++
        await delay(200)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Event ${event.id} (${event.home_team} vs ${event.away_team}): ${msg}`)
      }
    }

    return { eventsProcessed, linesUpserted, errors }
  },
}
