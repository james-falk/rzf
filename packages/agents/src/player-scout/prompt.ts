export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football analyst conducting a deep-dive scouting report on a single player. Your report should be comprehensive, data-backed, and actionable.

${userContext}

Respond with a JSON object matching this exact shape:
{
  "trend": "rising" | "falling" | "stable" | "unknown",
  "recentNewsSummary": "string (2-3 sentences summarizing the most relevant recent news)",
  "summary": "string (3-4 sentences: overall player assessment for fantasy)",
  "keyInsights": ["string", "string", ...]
}

Rules:
- trend: rising = improving role/value, falling = declining role/value, stable = consistent
- recentNewsSummary: synthesize the provided news headlines into a brief narrative
- summary: cover current role, fantasy outlook, risks, and upside
- keyInsights: 3-5 specific, actionable insights (schedule, usage trends, injury history, trade value, targets)`
}

interface PlayerContext {
  name: string
  position: string
  team: string | null
  injuryStatus: string | null
  practiceParticipation: string | null
  depthChartOrder: number | null
  age: number | null
  yearsExp: number | null
  dynasty1qbValue: number | null
  dynastySfValue: number | null
  redraftValue: number | null
  trend30d: number | null
  rankOverall: number | null
  rankPosition: number | null
  recentNews: string[]
  recentTrades: number
  context?: string
}

export function buildUserPrompt(player: PlayerContext, focusNote?: string): string {
  const lines = [
    `[Player Scouting Report]`,
    `Name: ${player.name}`,
    `Position: ${player.position} | Team: ${player.team ?? 'Free Agent'}`,
  ]

  if (player.injuryStatus) lines.push(`Injury: ${player.injuryStatus}${player.practiceParticipation ? ` (Practice: ${player.practiceParticipation})` : ''}`)
  if (player.depthChartOrder) lines.push(`Depth Chart: #${player.depthChartOrder} at position`)
  if (player.age) lines.push(`Age: ${player.age} | Experience: ${player.yearsExp ?? '?'} years`)

  lines.push(`\n[Trade Values]`)
  lines.push(`Dynasty 1QB: ${player.dynasty1qbValue ?? 'N/A'} | Dynasty SF: ${player.dynastySfValue ?? 'N/A'} | Redraft: ${player.redraftValue ?? 'N/A'}`)
  if (player.trend30d !== null) lines.push(`30-day trend: ${player.trend30d > 0 ? `+${player.trend30d}` : player.trend30d}`)

  lines.push(`\n[Rankings]`)
  lines.push(`Overall: ${player.rankOverall ?? 'unranked'} | Position: ${player.rankPosition ? `${player.position}${player.rankPosition}` : 'unranked'}`)

  if (player.recentTrades > 0) lines.push(`Recent league trades involving this player: ${player.recentTrades}`)

  if (player.recentNews.length > 0) {
    lines.push(`\n[Recent News]`)
    for (const headline of player.recentNews) lines.push(`- ${headline}`)
  }

  if (player.context) lines.push(`\n[User Question/Context]\n${player.context}`)
  if (focusNote) lines.push(`\n[User Focus]\n${focusNote}`)

  lines.push(`\nGenerate the scouting report. Return JSON only.`)

  return lines.join('\n')
}
