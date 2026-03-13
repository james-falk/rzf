import type { SleeperLeague, SleeperPlayer } from '@rzf/connectors/sleeper'

interface EnrichedPlayer {
  sleeperId: string
  name: string
  position: string
  team: string | null
  injuryStatus: string | null
  depthChartOrder: number | null
  searchRank: number | null
  rankPosition: number | null
  isStarter: boolean
}

export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are an expert fantasy football analyst. Your job is to evaluate a user's fantasy roster and provide clear, actionable insights.

${userContext}

You MUST respond with valid JSON only — no markdown, no prose before or after.
The JSON must match this exact structure:
{
  "overallGrade": "letter grade with +/- e.g. B+",
  "strengths": ["2-4 specific strengths"],
  "weaknesses": ["2-4 specific weaknesses or risks"],
  "positionGrades": { "QB": "grade", "RB": "grade", "WR": "grade", "TE": "grade" },
  "keyInsights": ["3-5 actionable insights the manager should act on"]
}

Grading scale: A+ (elite), A (strong), B+ (above avg), B (avg), C+ (below avg), C (weak), D (poor)
Be specific — name players and explain why.
Focus on what's actionable for this week and the rest of the season.`
}

export function buildUserPrompt(
  league: SleeperLeague,
  starters: EnrichedPlayer[],
  bench: EnrichedPlayer[],
  trendingAdds: string[],
  focusNote?: string,
): string {
  const scoringType = league.scoring_settings['rec'] === 1
    ? 'PPR'
    : league.scoring_settings['rec'] === 0.5
      ? 'Half-PPR'
      : 'Standard'

  const formatPlayer = (p: EnrichedPlayer): string => {
    const parts = [`${p.name} (${p.position}${p.team ? ` - ${p.team}` : ''})`]
    if (p.injuryStatus) parts.push(`⚠ ${p.injuryStatus}`)
    if (p.depthChartOrder && p.depthChartOrder > 1) parts.push(`Depth: ${p.depthChartOrder}`)
    if (p.rankPosition) parts.push(`Pos rank: #${p.rankPosition}`)
    return parts.join(' | ')
  }

  const startersByPos = starters.reduce<Record<string, EnrichedPlayer[]>>((acc, p) => {
    const pos = p.position
    if (!acc[pos]) acc[pos] = []
    acc[pos]!.push(p)
    return acc
  }, {})

  const rosterSections = Object.entries(startersByPos)
    .map(([pos, players]) => `${pos}:\n${players.map((p) => `  - ${formatPlayer(p)}`).join('\n')}`)
    .join('\n')

  const benchSection = bench.length > 0
    ? `\nBENCH:\n${bench.map((p) => `  - ${formatPlayer(p)}`).join('\n')}`
    : ''

  const trendingSection = trendingAdds.length > 0
    ? `\nHOT WAIVER ADDS THIS WEEK: ${trendingAdds.join(', ')}`
    : ''

  const focusSection = focusNote ? `\nUSER FOCUS: ${focusNote}` : ''

  return `League: ${league.name} | Format: ${scoringType} | Roster: ${league.roster_positions.join(', ')}

STARTING LINEUP:
${rosterSections}${benchSection}${trendingSection}${focusSection}

Evaluate this roster and respond with the JSON analysis.`
}

export function buildContentLinks(
  players: EnrichedPlayer[],
): Array<{ playerId: string; playerName: string; title: string; url: string; type: 'article' | 'youtube' | 'fantasypros' }> {
  // Phase 1: URL construction only — no ingestion pipeline yet
  // Phase 2: Replace with ContentItem DB query
  return players.slice(0, 6).map((p) => {
    const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
    const searchName = encodeURIComponent(`${p.name} fantasy football`)

    // Return FantasyPros player page as the primary link
    return {
      playerId: p.sleeperId,
      playerName: p.name,
      title: `${p.name} — FantasyPros Analysis`,
      url: `https://www.fantasypros.com/nfl/players/${slug}.php`,
      type: 'fantasypros' as const,
    }
  })
}
