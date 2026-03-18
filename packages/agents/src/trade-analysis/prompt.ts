import type { PlayerMarketValues } from '../multi-market-values.js'
import { formatMarketValuesForPrompt } from '../multi-market-values.js'
import type { DraftPick } from '../draft-picks.js'
import { formatDraftPickForPrompt } from '../draft-picks.js'

export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football trade analyst. Your job is to evaluate a proposed trade objectively, weigh the value on both sides, and give a clear recommendation.

${userContext}

Trade values from four sources (KTC, FantasyCalc, Dynasty Process, Dynasty Superflex) are provided per player. Display disagreements as signal — when sources strongly disagree on a player, note it. Use KTC as the anchor.

Respond with a JSON object matching this exact shape:
{
  "verdict": "accept" | "decline" | "counter",
  "valueScore": number (-100 to 100, positive = favorable for the user, 0 = even),
  "summary": "string (2-3 sentences: overall take on the trade)",
  "givingAnalysis": [
    {
      "playerId": "string",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "tradeValue": number or null (use KTC dynasty value as primary, or draft pick estimate),
      "rankOverall": number or null,
      "analysis": "string (1 sentence: what you're giving up)"
    }
  ],
  "receivingAnalysis": [
    {
      "playerId": "string",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "tradeValue": number or null,
      "rankOverall": number or null,
      "analysis": "string (1 sentence: what you're getting)"
    }
  ],
  "keyInsights": ["string (2-4 bullet points on key factors)"]
}

Rules:
- valueScore > 20: clearly accept | 5 to 20: slight edge, accept | -5 to 5: even, counter | < -20: clearly decline
- Base ALL analysis strictly on the trade values, rankings, and news provided
- analysis fields must be plain text only — no markdown, no bold, no asterisks
- Always return full objects in givingAnalysis and receivingAnalysis arrays — never plain strings
- Include draft picks in givingAnalysis/receivingAnalysis as their own entries
- Be direct and opinionated — managers need a clear recommendation`
}

interface TradePlayer {
  playerId: string
  name: string
  position: string
  team: string | null
  marketValues: PlayerMarketValues | null
  rankOverall: number | null
  injuryStatus: string | null
  recentNews: string[]
  recentTradeCount: number
  weeklyTradeVolume: number
}

interface RecentTrade {
  sideA: string[]
  sideB: string[]
  date: string
}

interface LeagueStanding {
  teamName: string
  wins: number
  losses: number
}

export function buildUserPrompt(
  giving: TradePlayer[],
  receiving: TradePlayer[],
  focusNote?: string,
  recentTrades?: RecentTrade[],
  givingPicks?: DraftPick[],
  receivingPicks?: DraftPick[],
  leagueStyle?: 'dynasty' | 'redraft',
  leagueStandings?: LeagueStanding[],
  sessionContext?: string,
): string {
  const style = leagueStyle ?? 'redraft'

  const formatPlayer = (p: TradePlayer) => {
    const lines = [`  ${p.name} (${p.position}, ${p.team ?? 'FA'})`]
    if (p.marketValues) {
      lines.push(formatMarketValuesForPrompt(p.name, p.marketValues, style))
    }
    lines.push(`  FP Rank: ${p.rankOverall ?? 'unranked'}`)
    if (p.injuryStatus) lines.push(`  ⚠ Injury: ${p.injuryStatus}`)
    if (p.weeklyTradeVolume > 0) lines.push(`  Community trade vol (1w): ${p.weeklyTradeVolume}`)
    if (p.recentNews.length > 0) lines.push(`  News: ${p.recentNews.slice(0, 2).join(' | ')}`)
    return lines.join('\n')
  }

  const givingPickLines = (givingPicks ?? []).map((p) => `  ${formatDraftPickForPrompt(p)}`).join('\n')
  const receivingPickLines = (receivingPicks ?? []).map((p) => `  ${formatDraftPickForPrompt(p)}`).join('\n')

  const focusSection = focusNote ? `\nUSER FOCUS: ${focusNote}` : ''
  const sessionPart = sessionContext ? `\n\n${sessionContext}` : ''

  const tradeExamplesSection = recentTrades && recentTrades.length > 0
    ? `\n[Recent Community Trades Involving These Players]\n${recentTrades.map((t) =>
        `  ${t.sideA.join(' + ')} ↔ ${t.sideB.join(' + ')} (${t.date})`
      ).join('\n')}`
    : ''

  const standingsSection = leagueStandings && leagueStandings.length > 0
    ? `\n[League Standings (top teams)]\n${leagueStandings.slice(0, 6).map((s) => `  ${s.teamName}: ${s.wins}W-${s.losses}L`).join('\n')}`
    : ''

  return `[Trade Proposal — ${style === 'dynasty' ? 'Dynasty' : 'Redraft'} League]

GIVING (trading away):
${giving.map(formatPlayer).join('\n\n')}${givingPickLines ? `\nDraft Picks:\n${givingPickLines}` : ''}

RECEIVING (getting back):
${receiving.map(formatPlayer).join('\n\n')}${receivingPickLines ? `\nDraft Picks:\n${receivingPickLines}` : ''}
${tradeExamplesSection}${standingsSection}${sessionPart}${focusSection}
Evaluate this trade. Is it a good deal? Return JSON only.`
}
