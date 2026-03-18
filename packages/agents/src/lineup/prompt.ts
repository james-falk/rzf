export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football lineup optimizer. Set the best possible starting lineup for this week based on matchups, injury status, depth chart, rankings, and projections.

${userContext}

Players marked [LOCKED] are no-brainer starters — give them high confidence, brief reasoning. Focus detailed analysis on players marked [DECISION] where the real value lies.

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
      "reason": "string (1 sentence: why start this player — for LOCKED players be brief, for DECISION players be detailed)"
    }
  ],
  "benchedPlayers": [
    {
      "playerId": "string",
      "playerName": "string",
      "reason": "string (1 sentence: why bench)"
    }
  ],
  "keyMatchups": ["string (2-3 notable positive or negative matchup angles)"],
  "warnings": ["string (injury alerts, game-time decisions, flex decisions to monitor)"]
}

Rules:
- confidence HIGH: healthy starter with favorable matchup or top ranking (projected 12+ pts)
- confidence MEDIUM: some uncertainty (injury risk, tough matchup, or inconsistent usage)
- confidence LOW: risky start (questionable status, bad matchup, or limited role)
- Use projected points when available — they are strong start/sit signals
- The FLEX decision is usually the highest-value insight — make it clear`
}

interface RosterSlot {
  playerId: string
  name: string
  position: string
  team: string | null
  isStarter: boolean
  isLocked?: boolean
  injuryStatus: string | null
  depthChartOrder: number | null
  rankOverall: number | null
  rankPosition: number | null
  defenseRankVsPosition: number | null
  projectedPoints?: number | null
  opponent: string | null
}

export function buildUserPrompt(
  league: { name: string; roster_positions: string[]; scoring_settings: Record<string, number>; settings: Record<string, unknown> },
  starters: RosterSlot[],
  bench: RosterSlot[],
  week: number,
  newsContext?: string,
  focusNote?: string,
  sessionContext?: string,
): string {
  const scoringType = league.scoring_settings['rec'] === 1
    ? 'PPR'
    : league.scoring_settings['rec'] === 0.5
      ? 'Half-PPR'
      : 'Standard'

  const leagueTypeNum = Number(league.settings['type'] ?? 0)
  const leagueType = leagueTypeNum === 2 ? 'Dynasty' : leagueTypeNum === 1 ? 'Keeper' : 'Redraft'

  const formatPlayer = (p: RosterSlot) => {
    const lockTag = p.isLocked ? ' [LOCKED]' : ' [DECISION]'
    const parts = [`${p.name} (${p.position}, ${p.team ?? 'FA'})${lockTag}`]
    if (p.rankPosition) parts.push(`FP rank: ${p.position}${p.rankPosition}`)
    if (p.projectedPoints != null) parts.push(`Proj: ${p.projectedPoints.toFixed(1)}pts`)
    if (p.injuryStatus) parts.push(`⚠️ ${p.injuryStatus}`)
    if (p.opponent) parts.push(`vs ${p.opponent}`)
    if (p.defenseRankVsPosition) parts.push(`Opp def vs ${p.position}: ${p.defenseRankVsPosition}/32`)
    return parts.join(' | ')
  }

  const newsPart = newsContext ? `\n\n${newsContext}` : ''
  const focusSection = focusNote ? `\nUSER FOCUS: ${focusNote}` : ''
  const sessionPart = sessionContext ? `\n\n${sessionContext}` : ''

  return `[League: ${league.name} | ${leagueType} | ${scoringType} | Week ${week}]
[Roster Slots: ${league.roster_positions.join(', ')}]

[STARTERS (current lineup)]
${starters.map(formatPlayer).join('\n')}

[BENCH (eligible for flex/replacement)]
${bench.map(formatPlayer).join('\n')}${newsPart}${sessionPart}${focusSection}

Optimize the starting lineup. Focus your analysis on DECISION players. Return JSON only.`
}
