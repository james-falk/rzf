/**
 * FantasyPlatformConnector — abstraction over multiple fantasy league platforms.
 *
 * All roster-aware agents should resolve the user's active platform from their
 * profile and call these methods rather than importing SleeperConnector directly.
 *
 * Current implementations:
 *   - SleeperPlatformConnector (complete)
 *   - ESPNFantasyConnector (stub — requires ESPNProfile cookies)
 *   - YahooPlatformConnector (stub — requires YahooProfile OAuth tokens)
 *
 * Data isolation rule: platform-scoped fields (% owned, FAAB, waiver priority)
 * are ONLY used within that platform's context. NFL-scoped data (injury status,
 * trade values, rankings) is always available regardless of platform.
 */

export type Platform = 'sleeper' | 'espn' | 'yahoo'

export interface PlatformLeague {
  id: string
  name: string
  platform: Platform
  season: string
  teamCount: number
  scoringFormat: 'ppr' | 'half_ppr' | 'standard'
  isSuperflex: boolean
  leagueType: 'redraft' | 'keeper' | 'dynasty'
}

export interface PlatformTeam {
  id: string
  name: string
  ownerId: string
}

export interface PlatformRoster {
  teamId: string
  starters: PlatformPlayer[]
  bench: PlatformPlayer[]
}

export interface PlatformPlayer {
  /** Sleeper player_id (canonical ID used throughout RZF) */
  sleeperId: string
  /** Raw player ID in the source platform */
  platformPlayerId: string
  fullName: string
  position: string
  team: string | null
  injuryStatus: string | null
  /** Platform-scoped ownership % — only use within this platform's context */
  ownershipPct?: number | null
  /** Whether this player is a starter on the current roster */
  isStarter?: boolean
}

export interface PlatformMatchup {
  week: number
  teamAId: string
  teamBId: string
  teamAScore: number | null
  teamBScore: number | null
}

export interface PlatformTransaction {
  id: string
  type: 'add' | 'drop' | 'trade'
  adds: string[]
  drops: string[]
  week: number
  timestamp: Date
}

export interface PlatformStanding {
  teamId: string
  teamName: string
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  rank: number
}

/**
 * All roster-aware agents interact with fantasy platforms through this interface.
 * Implementations must handle their own auth and ID mapping.
 */
export interface FantasyPlatformConnector {
  platform: Platform

  getLeagues(userId: string): Promise<PlatformLeague[]>
  getRoster(leagueId: string, userId: string): Promise<PlatformRoster>
  getAllRosters(leagueId: string): Promise<PlatformRoster[]>
  getMatchups(leagueId: string, week: number): Promise<PlatformMatchup[]>
  getTransactions(leagueId: string, week: number): Promise<PlatformTransaction[]>
  getStandings(leagueId: string): Promise<PlatformStanding[]>
  getLeagueInfo(leagueId: string): Promise<PlatformLeague>
}

// ─── ESPN Fantasy Connector Stub ─────────────────────────────────────────────

/**
 * ESPN Fantasy connector using cookie-based auth (espn_s2 + SWID).
 * Requires the user's ESPNProfile to be populated in the DB.
 *
 * Phase 4 implementation: Add full roster/matchup/transaction methods here.
 * ESPN's fantasy API is undocumented — cookie injection is required.
 */
export class ESPNFantasyConnector implements FantasyPlatformConnector {
  platform: Platform = 'espn'

  constructor(
    private readonly espnS2: string,
    private readonly swid: string,
  ) {}

  private get headers() {
    return {
      Cookie: `espn_s2=${this.espnS2}; SWID=${this.swid}`,
      'Content-Type': 'application/json',
    }
  }

  async getLeagues(userId: string): Promise<PlatformLeague[]> {
    // ESPN league discovery requires the member ID from the SWID
    const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${new Date().getFullYear()}/segments/0/leagues?view=mMatchupScore&view=mStandings`
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) throw new Error(`ESPN Fantasy API error ${res.status}`)
    const data = await res.json() as { id?: number; name?: string; settings?: Record<string, unknown> }[]
    return (Array.isArray(data) ? data : []).map((l) => ({
      id: String(l.id ?? ''),
      name: String(l.name ?? 'ESPN League'),
      platform: 'espn' as Platform,
      season: String(new Date().getFullYear()),
      teamCount: 10,
      scoringFormat: 'ppr',
      isSuperflex: false,
      leagueType: 'redraft',
    }))
  }

  async getRoster(leagueId: string, userId: string): Promise<PlatformRoster> {
    throw new Error('ESPNFantasyConnector.getRoster not yet implemented — Phase 4')
  }

  async getAllRosters(leagueId: string): Promise<PlatformRoster[]> {
    throw new Error('ESPNFantasyConnector.getAllRosters not yet implemented — Phase 4')
  }

  async getMatchups(leagueId: string, week: number): Promise<PlatformMatchup[]> {
    throw new Error('ESPNFantasyConnector.getMatchups not yet implemented — Phase 4')
  }

  async getTransactions(leagueId: string, week: number): Promise<PlatformTransaction[]> {
    throw new Error('ESPNFantasyConnector.getTransactions not yet implemented — Phase 4')
  }

  async getStandings(leagueId: string): Promise<PlatformStanding[]> {
    throw new Error('ESPNFantasyConnector.getStandings not yet implemented — Phase 4')
  }

  async getLeagueInfo(leagueId: string): Promise<PlatformLeague> {
    throw new Error('ESPNFantasyConnector.getLeagueInfo not yet implemented — Phase 4')
  }
}

// ─── Yahoo Fantasy Connector Stub ────────────────────────────────────────────

/**
 * Yahoo Fantasy connector using OAuth 2.0 tokens.
 * Requires the user's YahooProfile to be populated in the DB.
 *
 * Phase 4 implementation: Add full roster/matchup/transaction methods here.
 * Uses the Yahoo Fantasy Sports API (v2): https://developer.yahoo.com/fantasysports/guide/
 */
export class YahooPlatformConnector implements FantasyPlatformConnector {
  platform: Platform = 'yahoo'

  constructor(private readonly accessToken: string) {}

  async getLeagues(userId: string): Promise<PlatformLeague[]> {
    throw new Error('YahooPlatformConnector.getLeagues not yet implemented — Phase 4')
  }

  async getRoster(leagueId: string, userId: string): Promise<PlatformRoster> {
    throw new Error('YahooPlatformConnector.getRoster not yet implemented — Phase 4')
  }

  async getAllRosters(leagueId: string): Promise<PlatformRoster[]> {
    throw new Error('YahooPlatformConnector.getAllRosters not yet implemented — Phase 4')
  }

  async getMatchups(leagueId: string, week: number): Promise<PlatformMatchup[]> {
    throw new Error('YahooPlatformConnector.getMatchups not yet implemented — Phase 4')
  }

  async getTransactions(leagueId: string, week: number): Promise<PlatformTransaction[]> {
    throw new Error('YahooPlatformConnector.getTransactions not yet implemented — Phase 4')
  }

  async getStandings(leagueId: string): Promise<PlatformStanding[]> {
    throw new Error('YahooPlatformConnector.getStandings not yet implemented — Phase 4')
  }

  async getLeagueInfo(leagueId: string): Promise<PlatformLeague> {
    throw new Error('YahooPlatformConnector.getLeagueInfo not yet implemented — Phase 4')
  }
}
