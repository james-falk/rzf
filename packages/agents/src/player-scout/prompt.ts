import type { PlayerMarketValues } from '../multi-market-values.js'
import { formatMarketValuesForPrompt } from '../multi-market-values.js'

export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football analyst conducting a deep-dive scouting report on a single player. Your report should be comprehensive, data-backed, and actionable.

${userContext}

Trade values from four sources (KTC, FantasyCalc, Dynasty Process, Dynasty Superflex) are provided. Note when sources agree or disagree — consensus = confidence, disagreement = opportunity or risk.

Respond with a JSON object matching this exact shape:
{
  "trend": "rising" | "falling" | "stable" | "unknown",
  "recentNewsSummary": "string (2-3 sentences summarizing the most relevant recent news)",
  "summary": "string (3-4 sentences: overall player assessment for fantasy — cover role, outlook, risks, upside)",
  "keyInsights": ["string (3-5 specific, actionable insights — schedule, usage trends, injury history, multi-market value signals, buy/hold/sell)"]
}

Rules:
- trend: based on KTC/FantasyCalc 30d change — rising = improving, falling = declining, stable = consistent
- recentNewsSummary: synthesize provided news headlines into a brief narrative
- summary: cover current role, fantasy outlook, risks, and upside
- keyInsights: include a buy/hold/sell signal backed by data`
}

interface PlayerContext {
  name: string
  position: string | null
  team: string | null
  injuryStatus: string | null
  practiceParticipation: string | null
  depthChartOrder: number | null
  age: number | null
  yearsExp: number | null
  marketValues: PlayerMarketValues
  rankOverall: number | null
  rankPosition: number | null
  recentNews: string[]
  recentTrades: number
  communityTradeCount: number
  weeklyTradeVolume: number
  context?: string
  sessionContext?: string
  leagueStyle?: 'dynasty' | 'redraft'
}

export function buildUserPrompt(player: PlayerContext, focusNote?: string): string {
  const style = player.leagueStyle ?? 'redraft'
  const lines = [
    `[Player Scouting Report]`,
    `Name: ${player.name}`,
    `Position: ${player.position ?? 'UNKNOWN'} | Team: ${player.team ?? 'Free Agent'}`,
  ]

  if (player.injuryStatus) lines.push(`Injury: ${player.injuryStatus}${player.practiceParticipation ? ` (Practice: ${player.practiceParticipation})` : ''}`)
  if (player.depthChartOrder) lines.push(`Depth Chart: #${player.depthChartOrder} at position`)
  if (player.age) lines.push(`Age: ${player.age} | Experience: ${player.yearsExp ?? '?'} years`)

  lines.push(`\n[Trade Values — All Markets]`)
  lines.push(formatMarketValuesForPrompt(player.name, player.marketValues, style))

  lines.push(`\n[Rankings]`)
  lines.push(`FP Overall: ${player.rankOverall ?? 'unranked'} | FP Position: ${player.rankPosition ? `${player.position}${player.rankPosition}` : 'unranked'}`)

  if (player.communityTradeCount > 0 || player.weeklyTradeVolume > 0) {
    lines.push(`\n[Trade Activity]`)
    lines.push(`Recent league trades: ${player.recentTrades} | Community trade vol (1w): ${player.weeklyTradeVolume} | DD trade count: ${player.communityTradeCount}`)
  } else if (player.recentTrades > 0) {
    lines.push(`Recent league trades involving this player: ${player.recentTrades}`)
  }

  if (player.recentNews.length > 0) {
    lines.push(`\n[Recent News]`)
    for (const headline of player.recentNews.slice(0, 8)) lines.push(`- ${headline}`)
  }

  if (player.sessionContext) {
    lines.push(`\n${player.sessionContext}`)
  }

  if (player.context) lines.push(`\n[User Question/Context]\n${player.context}`)
  if (focusNote) lines.push(`\n[User Focus]\n${focusNote}`)

  lines.push(`\nGenerate the scouting report. Return JSON only.`)

  return lines.join('\n')
}
