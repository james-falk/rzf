import type { PlayerMarketValues } from '../multi-market-values.js'
import { formatMarketValuesForPrompt, getAnchorTrend } from '../multi-market-values.js'

interface ComparePlayerContext {
  name: string
  position: string | null
  team: string | null
  injuryStatus: string | null
  age: number | null
  yearsExp: number | null
  marketValues: PlayerMarketValues
  dynastyPositionRank: number | null
  dynastyRank: number | null
  rankOverall: number | null
  rankPosition: number | null
  recentNews: string[]
  recentTrades: number
  tradeVolume1w?: number | null
  tradeVolume4w?: number | null
}

export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override?.trim()) return override.trim()

  return `You are RosterMind AI, an expert fantasy football analyst specializing in player comparisons.

${userContext}

Trade values from four sources (KTC, FantasyCalc, Dynasty Process, Dynasty Superflex) are provided per player. Note consensus vs disagreement across sources — consensus = confidence in the winner, disagreement = key insight.

Make your own determination alongside the raw data. The RosterMind verdict is your own analysis, not just a weighted average.

Output JSON with exactly this structure:
{
  "winnerId": "<sleeperId of the best player, or null if even>",
  "winnerName": "<full name of winner, or null if even>",
  "winMargin": "clear" | "slight" | "even",
  "verdict": "<2-3 sentence verdict explaining who wins and why — cite specific value signals and context>",
  "players": [
    {
      "playerId": "<sleeperId>",
      "playerName": "<full name>",
      "position": "<QB/RB/WR/TE>",
      "team": "<team abbreviation or null>",
      "dynastyValue": <KTC dynasty 1QB value or best available, number or null>,
      "dynastyRank": <overall dynasty rank number or null>,
      "dynastyPositionRank": <position rank number or null>,
      "redraftValue": <KTC redraft value or best available, number or null>,
      "trend": "rising" | "falling" | "stable" | "unknown",
      "injuryStatus": "<status or null>",
      "summary": "<2-3 sentences about this player's current situation and outlook>",
      "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
      "cons": ["<con 1>", "<con 2>"]
    }
  ],
  "keyInsights": ["<2-4 factors that explain the comparison outcome>"],
  "recommendation": "<1 sentence actionable recommendation>"
}

Rules:
- Base all analysis strictly on the provided data — no speculation about free agency or contracts unless stated
- summary and pros/cons must be plain text — no markdown, no asterisks
- Be direct and opinionated — give a clear winner unless values are genuinely equal
- If league context is provided (team context, roster needs), factor it into the recommendation`
}

export function buildUserPrompt(
  players: ComparePlayerContext[],
  playerIds: string[],
  focusNote?: string,
  leagueStyle?: 'dynasty' | 'redraft',
  sessionContext?: string,
): string {
  const style = leagueStyle ?? 'redraft'

  const formatPlayer = (p: ComparePlayerContext, id: string) => {
    const lines = [
      `  Player ID: ${id}`,
      `  Name: ${p.name} (${p.position ?? 'UNKNOWN'}, ${p.team ?? 'FA'})`,
      `  Age: ${p.age ?? 'N/A'} | Experience: ${p.yearsExp ?? 'N/A'} years`,
    ]
    lines.push(formatMarketValuesForPrompt(p.name, p.marketValues, style))
    lines.push(`  FP Overall: ${p.rankOverall ?? 'unranked'} | FP Position: ${p.rankPosition ?? 'unranked'} | Dynasty Rank: ${p.dynastyRank ?? 'N/A'} | Dynasty Pos Rank: ${p.dynastyPositionRank ?? 'N/A'}`)
    const trend30d = getAnchorTrend(p.marketValues)
    if (trend30d !== null) lines.push(`  30d Trend: ${trend30d > 0 ? `+${trend30d}` : String(trend30d)}`)
    if (p.injuryStatus) lines.push(`  ⚠ Injury: ${p.injuryStatus}`)
    if (p.tradeVolume1w != null) lines.push(`  Community trade vol (1w): ${p.tradeVolume1w} | (4w): ${p.tradeVolume4w ?? 'N/A'}`)
    if (p.recentTrades > 0) lines.push(`  DD trade examples: ${p.recentTrades}`)
    if (p.recentNews.length > 0) lines.push(`  News: ${p.recentNews.slice(0, 2).join(' | ')}`)
    return lines.join('\n')
  }

  const focusSection = focusNote ? `\nUSER FOCUS: ${focusNote}` : ''
  const sessionPart = sessionContext ? `\n\n${sessionContext}` : ''

  return `[Player Comparison — ${style === 'dynasty' ? 'Dynasty' : 'Redraft'} League]

${players.map((p, i) => `PLAYER ${i + 1}:\n${formatPlayer(p, playerIds[i]!)}`).join('\n\n')}
${sessionPart}${focusSection}
Compare these players and determine who is more valuable to own. Provide your own RosterMind determination. Return JSON only.`
}
