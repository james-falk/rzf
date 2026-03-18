import {
  SleeperUserSchema,
  SleeperLeagueSchema,
  SleeperRosterSchema,
  SleeperPlayerSchema,
  SleeperTrendingPlayerSchema,
  SleeperNFLStateSchema,
  SleeperTransactionSchema,
  type SleeperUser,
  type SleeperLeague,
  type SleeperRoster,
  type SleeperPlayer,
  type SleeperTrendingPlayer,
  type SleeperNFLState,
  type SleeperTransaction,
} from './types.js'
import { z } from 'zod'

const BASE_URL = 'https://api.sleeper.app/v1'

// Stay under 1000 req/min as documented by Sleeper
async function sleeperFetch<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'User-Agent': 'RedZoneFantasy/1.0' },
  })

  if (!res.ok) {
    throw new Error(`Sleeper API error: ${res.status} ${res.statusText} — ${path}`)
  }

  const data = await res.json()
  return schema.parse(data)
}

export const SleeperConnector = {
  /**
   * Get a Sleeper user by username or user_id.
   * Use this to resolve a username to a user_id.
   */
  async getUser(usernameOrId: string): Promise<SleeperUser> {
    return sleeperFetch(`/user/${usernameOrId}`, SleeperUserSchema)
  },

  /**
   * Get all leagues for a user in a given season.
   */
  async getLeaguesForUser(userId: string, season: string): Promise<SleeperLeague[]> {
    return sleeperFetch(`/user/${userId}/leagues/nfl/${season}`, z.array(SleeperLeagueSchema))
  },

  /**
   * Get a specific league by ID.
   */
  async getLeague(leagueId: string): Promise<SleeperLeague> {
    return sleeperFetch(`/league/${leagueId}`, SleeperLeagueSchema)
  },

  /**
   * Get all rosters in a league.
   * Use this to find the roster belonging to a specific user.
   */
  async getRosters(leagueId: string): Promise<SleeperRoster[]> {
    return sleeperFetch(`/league/${leagueId}/rosters`, z.array(SleeperRosterSchema))
  },

  /**
   * Fetch all NFL players from Sleeper.
   * ~3,000 players, ~5MB response.
   * Sleeper explicitly asks you to cache this — call at most once per day.
   */
  async getAllPlayers(): Promise<Record<string, SleeperPlayer>> {
    return sleeperFetch(`/players/nfl`, z.record(z.string(), SleeperPlayerSchema))
  },

  /**
   * Get trending players by add or drop activity.
   */
  async getTrending(
    type: 'add' | 'drop',
    lookbackHours = 24,
    limit = 25,
  ): Promise<SleeperTrendingPlayer[]> {
    return sleeperFetch(
      `/players/nfl/trending/${type}?lookback_hours=${lookbackHours}&limit=${limit}`,
      z.array(SleeperTrendingPlayerSchema),
    )
  },

  /**
   * Get the current NFL state (week, season, season type).
   */
  async getNFLState(): Promise<SleeperNFLState> {
    return sleeperFetch(`/state/nfl`, SleeperNFLStateSchema)
  },

  /**
   * Helper: get a specific user's roster in a league.
   * Fetches all rosters and filters to the one owned by ownerId.
   */
  async getUserRoster(leagueId: string, ownerId: string): Promise<SleeperRoster | null> {
    const rosters = await SleeperConnector.getRosters(leagueId)
    return rosters.find((r) => r.owner_id === ownerId) ?? null
  },

  /**
   * Get season-level stats for all players for a given year and season type.
   * Sleeper endpoint: GET /stats/nfl/{season_type}/{season}
   * Returns a map of { sleeperId: { pts_ppr, rec_yd, rush_yd, ... } }
   * season_type: "regular" | "pre" | "post"
   */
  async getSeasonStats(season: number, seasonType: 'regular' | 'pre' | 'post' = 'regular'): Promise<Record<string, Record<string, number>>> {
    const raw = await sleeperFetch(
      `/stats/nfl/${seasonType}/${season}`,
      z.record(z.string(), z.record(z.string(), z.number()).catch(() => ({}))),
    )
    return raw as Record<string, Record<string, number>>
  },

  /**
   * Get all transactions for a league in a given week.
   * Returns all types (trade, free_agent, waiver) — filter client-side if needed.
   * Week is the NFL week number (1–18).
   */
  async getTransactions(leagueId: string, week: number) {
    const results = await sleeperFetch(
      `/league/${leagueId}/transactions/${week}`,
      z.array(SleeperTransactionSchema),
    )
    // Normalize nullable array fields
    return results.map((t) => ({
      ...t,
      draft_picks: t.draft_picks ?? [],
      waiver_budget: t.waiver_budget ?? [],
    })) as SleeperTransaction[]
  },
}
