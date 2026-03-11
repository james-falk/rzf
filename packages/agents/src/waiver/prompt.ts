export function buildSystemPrompt(userContext: string): string {
  return `You are a fantasy football waiver wire advisor. Your job is to recommend the best available free agents for a manager to pick up based on their roster needs, recent trends, and current news.

${userContext}

Respond with a JSON object matching this exact shape:
{
  "recommendations": [
    {
      "playerId": "string (Sleeper player_id)",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "pickupScore": number (0-100),
      "reason": "string (1-2 sentences: why pick up this player now)",
      "dropSuggestion": "string or null (name of player to drop, or null)"
    }
  ],
  "summary": "string (1-2 sentence overview of waiver strategy this week)"
}

Rules:
- Return 3-5 recommendations, sorted by pickupScore descending
- pickupScore reflects urgency + upside + roster fit (100 = must-add immediately)
- Focus on players NOT already on the user's roster
- Consider injury news, depth chart changes, and target share trends
- dropSuggestion should name the weakest roster player at that position`
}

interface WaiverCandidate {
  sleeperId: string
  name: string
  position: string
  team: string | null
  trendCount: number
  injuryStatus: string | null
  searchRank: number | null
  recentNews: string[]
}

interface RosterPlayer {
  name: string
  position: string
  injuryStatus: string | null
}

export function buildUserPrompt(
  candidates: WaiverCandidate[],
  roster: RosterPlayer[],
  targetPosition?: string,
): string {
  const rosterByPosition = roster.reduce<Record<string, string[]>>((acc, p) => {
    if (!acc[p.position]) acc[p.position] = []
    const injury = p.injuryStatus ? ` (${p.injuryStatus})` : ''
    acc[p.position]!.push(`${p.name}${injury}`)
    return acc
  }, {})

  const rosterLines = Object.entries(rosterByPosition)
    .map(([pos, names]) => `${pos}: ${names.join(', ')}`)
    .join('\n')

  const candidateLines = candidates
    .slice(0, 30)
    .map((c) => {
      const news = c.recentNews.length > 0 ? ` | News: ${c.recentNews[0]}` : ''
      const trend = c.trendCount > 0 ? ` | Trending adds: ${c.trendCount}` : ''
      const injury = c.injuryStatus ? ` | Status: ${c.injuryStatus}` : ''
      return `${c.name} (${c.position}, ${c.team ?? 'FA'}) — Rank: ${c.searchRank ?? 'unranked'}${trend}${injury}${news}`
    })
    .join('\n')

  return `[Current Roster]
${rosterLines}
${targetPosition ? `\n[Target Position]: ${targetPosition}` : ''}

[Available Free Agents — Top Trending + Unranked Picks]
${candidateLines}

Based on the roster needs and available players above, recommend the best waiver wire pickups. Prioritize filling weak spots and adding high-upside players.`
}
