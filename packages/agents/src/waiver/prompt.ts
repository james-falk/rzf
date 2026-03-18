export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football waiver wire advisor. Your job is to recommend the best available free agents for a manager to pick up, with a conversational situation read first.

${userContext}

Begin with a brief situation analysis — identify bye weeks, injuries, positional gaps. Then give ranked recommendations.

Respond with a JSON object matching this exact shape:
{
  "recommendations": [
    {
      "playerId": "string (Sleeper player_id)",
      "playerName": "string",
      "position": "string",
      "team": "string or null",
      "pickupScore": number (0-100),
      "reason": "string (1-2 sentences: why pick up this player now, including any trade value signals)",
      "dropSuggestion": "string or null (name of player to drop, or null)"
    }
  ],
  "summary": "string (2-3 sentences: situational read first — byes/injuries/gaps — then overall waiver strategy)"
}

Rules:
- Return 3-5 recommendations, sorted by pickupScore descending
- pickupScore reflects urgency + upside + roster fit (100 = must-add immediately)
- Focus on players NOT already on the user's roster
- Use trade volume (1w/4w) as a community-consensus signal: rising volume = market interest
- Use market values (KTC, FantasyCalc, etc.) for dynasty leagues — high-value adds are worth roster spots even without immediate usage
- dropSuggestion should name the weakest roster player at that position`
}

import type { PlayerMarketValues } from '../multi-market-values.js'
import { formatMarketValuesForPrompt } from '../multi-market-values.js'

interface WaiverCandidate {
  sleeperId: string
  name: string
  position: string
  team: string | null
  trendCount: number
  injuryStatus: string | null
  searchRank: number | null
  recentNews: string[]
  marketValues?: PlayerMarketValues | null
  tradeVolume1w?: number | null
  tradeVolume4w?: number | null
}

interface RosterPlayer {
  name: string
  position: string
  injuryStatus: string | null
  isStarter?: boolean
}

export function buildUserPrompt(
  candidates: WaiverCandidate[],
  roster: RosterPlayer[],
  targetPosition?: string,
  focusNote?: string,
  recentLeagueClaims?: string[],
  byeWeekNote?: string,
  leagueStyle?: 'dynasty' | 'redraft',
  sessionContext?: string,
): string {
  const style = leagueStyle ?? 'redraft'

  const rosterByPosition = roster.reduce<Record<string, string[]>>((acc, p) => {
    if (!acc[p.position]) acc[p.position] = []
    const injury = p.injuryStatus ? ` (${p.injuryStatus})` : ''
    const starterTag = p.isStarter === false ? ' [Bench]' : ''
    acc[p.position]!.push(`${p.name}${injury}${starterTag}`)
    return acc
  }, {})

  const rosterLines = Object.entries(rosterByPosition)
    .map(([pos, names]) => `${pos}: ${names.join(', ')}`)
    .join('\n')

  const candidateLines = candidates
    .slice(0, 25)
    .map((c) => {
      const news = c.recentNews.length > 0 ? ` | News: ${c.recentNews[0]}` : ''
      const trend = c.trendCount > 0 ? ` | Sleeper adds: ${c.trendCount}` : ''
      const vol = c.tradeVolume1w != null ? ` | DD vol 1w: ${c.tradeVolume1w}` : ''
      const injury = c.injuryStatus ? ` | Status: ${c.injuryStatus}` : ''
      const header = `${c.name} (${c.position}, ${c.team ?? 'FA'}) — Rank: ${c.searchRank ?? 'unranked'}${trend}${vol}${injury}${news}`
      if (c.marketValues) {
        return `${header}\n${formatMarketValuesForPrompt(c.name, c.marketValues, style)}`
      }
      return header
    })
    .join('\n')

  const claimsSection = recentLeagueClaims?.length
    ? `\n[Recent League Claims — what opponents are targeting]\n${recentLeagueClaims.join(', ')}`
    : ''

  const byeSection = byeWeekNote ? `\n[Bye Week Note]: ${byeWeekNote}` : ''
  const focusSection = focusNote ? `\nUSER FOCUS: ${focusNote}` : ''
  const sessionPart = sessionContext ? `\n\n${sessionContext}` : ''

  return `[Current Roster]
${rosterLines}${byeSection}${claimsSection}
${targetPosition ? `\n[Target Position]: ${targetPosition}` : ''}

[Available Free Agents — Top Trending + Trade Market Signals]
${candidateLines}
${focusSection}${sessionPart}
Analyze the roster situation first (byes, injuries, gaps), then recommend the best waiver wire pickups.`
}
