export function buildSystemPrompt(userContext: string, override?: string): string {
  if (override) return override.replace('{userContext}', userContext)
  return `You are a fantasy football trade analyst. Your job is to evaluate a proposed trade objectively, weigh the value on both sides, and give a clear recommendation.

${userContext}

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
      "tradeValue": number or null,
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
  "keyInsights": ["string", ...]
}

Rules:
- valueScore > 20: clearly accept | 5 to 20: slight edge, accept | -5 to 5: even, counter | < -20: clearly decline
- keyInsights: 2-4 bullet points on key factors (injury risk, schedule, age, positional scarcity, etc.)
- Base the analysis on the trade values, rankings, and recent news provided
- Be direct and opinionated — managers need a clear recommendation`
}

interface TradePlayer {
  playerId: string
  name: string
  position: string
  team: string | null
  dynasty1qbValue: number | null
  redraftValue: number | null
  rankOverall: number | null
  injuryStatus: string | null
  recentNews: string[]
  recentTradeCount: number
}

export function buildUserPrompt(giving: TradePlayer[], receiving: TradePlayer[]): string {
  const formatPlayer = (p: TradePlayer) => {
    const lines = [
      `  Name: ${p.name} (${p.position}, ${p.team ?? 'FA'})`,
      `  Dynasty Value: ${p.dynasty1qbValue ?? 'N/A'} | Redraft Value: ${p.redraftValue ?? 'N/A'} | Overall Rank: ${p.rankOverall ?? 'unranked'}`,
    ]
    if (p.injuryStatus) lines.push(`  Injury: ${p.injuryStatus}`)
    if (p.recentTradeCount > 0) lines.push(`  Recent trades (in our leagues): ${p.recentTradeCount}`)
    if (p.recentNews.length > 0) lines.push(`  Recent news: ${p.recentNews.slice(0, 2).join(' | ')}`)
    return lines.join('\n')
  }

  return `[Trade Proposal]

GIVING (players you are trading away):
${giving.map(formatPlayer).join('\n\n')}

RECEIVING (players you are getting):
${receiving.map(formatPlayer).join('\n\n')}

Evaluate this trade. Is it a good deal? Return JSON only.`
}
