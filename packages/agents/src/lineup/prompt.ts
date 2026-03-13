export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football lineup optimizer. Set the best possible starting lineup for this week based on matchups, injury status, depth chart, and rankings.

${userContext}

Respond with a JSON object matching this exact shape:
{
  "recommendedLineup": [
    {
      "slot": "string (e.g. QB, RB1, RB2, WR1, WR2, FLEX, TE, K, DEF)",
      "playerId": "string",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "opponent": "string or null",
      "confidence": "high" | "medium" | "low",
      "reason": "string (1 sentence: why start this player)"
    }
  ],
  "benchedPlayers": [
    {
      "playerId": "string",
      "playerName": "string",
      "reason": "string (1 sentence: why bench)"
    }
  ],
  "keyMatchups": ["string", ...],
  "warnings": ["string", ...]
}

Rules:
- confidence HIGH: healthy starter with favorable matchup or elite ranking
- confidence MEDIUM: some uncertainty (injury, tough matchup, or inconsistent usage)
- confidence LOW: risky start (questionable status, bad matchup, or limited role)
- keyMatchups: 2-3 notable positive or negative matchup angles
- warnings: injury alerts, game-time decisions, or stacks to be aware of`
}

interface RosterSlot {
  playerId: string
  name: string
  position: string
  team: string | null
  isStarter: boolean
  injuryStatus: string | null
  depthChartOrder: number | null
  rankOverall: number | null
  rankPosition: number | null
  defenseRankVsPosition: number | null
  opponent: string | null
}

export function buildUserPrompt(
  league: { name: string; roster_positions: string[]; scoring_settings: Record<string, number>; settings: Record<string, unknown> },
  starters: RosterSlot[],
  bench: RosterSlot[],
  week: number,
): string {
  const scoringType = league.scoring_settings['rec'] === 1
    ? 'PPR'
    : league.scoring_settings['rec'] === 0.5
      ? 'Half-PPR'
      : 'Standard'

  const leagueTypeNum = Number(league.settings['type'] ?? 0)
  const leagueType = leagueTypeNum === 2 ? 'Dynasty' : leagueTypeNum === 1 ? 'Keeper' : 'Redraft'

  const formatPlayer = (p: RosterSlot) => {
    const parts = [`${p.name} (${p.position}, ${p.team ?? 'FA'})`]
    if (p.rankPosition) parts.push(`Rank: ${p.position}${p.rankPosition}`)
    if (p.injuryStatus) parts.push(`⚠️ ${p.injuryStatus}`)
    if (p.opponent) parts.push(`vs ${p.opponent}`)
    if (p.defenseRankVsPosition) parts.push(`Opp def rank vs ${p.position}: ${p.defenseRankVsPosition}/32`)
    return parts.join(' | ')
  }

  return `[League: ${league.name} | ${leagueType} | ${scoringType} | Week ${week}]
[Roster Slots: ${league.roster_positions.join(', ')}]

[STARTERS (current lineup)]
${starters.map(formatPlayer).join('\n')}

[BENCH]
${bench.map(formatPlayer).join('\n')}

Optimize the starting lineup. Set the best possible starters for this week. Return JSON only.`
}
