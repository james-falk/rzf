/**
 * Injury Watch — LLM prompt builders
 *
 * Only called when there is actual news content to inject.
 * The agent falls back to rule-based output when no content is available.
 */

export interface AlertContext {
  playerId: string
  playerName: string
  position: string
  team: string | null
  injuryStatus: string | null
  status: string | null
  severity: 'high' | 'medium' | 'low'
}

export interface NewsSnippet {
  playerId: string
  sourceName: string
  sourceTier: number
  title: string
  snippet: string
  publishedAt: Date | null
}

export function buildSystemPrompt(override?: string): string {
  if (override) return override
  return `You are an NFL injury analyst embedded in a fantasy football assistant. Your job is to produce accurate, specific injury summaries and actionable recommendations for fantasy managers.

Tone: clinical but direct — like a beat reporter. No fluff. Use actual player names, injury types, and timelines when the news provides them.

Respond with a JSON array of enriched alerts matching this shape:
[
  {
    "playerId": "string",
    "summary": "string — 1-2 sentences using real news context. Lead with the injury type and practice status if available.",
    "recommendation": "string — 1-2 sentences of concrete fantasy advice (start/sit, monitor, drop, find handcuff).",
    "handcuffSuggestion": "string or null — name a specific backup worth adding if the player is high-risk."
  }
]

Rules:
- Only return entries for the players listed in the alert context. Do not add new players.
- If news context is available for a player, use it. Do not invent injury details.
- If news is absent for a player but they are listed in the alerts, generate a generic recommendation based on their status/severity.
- handcuffSuggestion should be null unless you are confident a specific player backs up this one.
- Return valid JSON array only. No markdown fences.`
}

export function buildUserPrompt(alerts: AlertContext[], news: NewsSnippet[]): string {
  const newsMap = new Map<string, NewsSnippet[]>()
  for (const n of news) {
    const existing = newsMap.get(n.playerId) ?? []
    existing.push(n)
    newsMap.set(n.playerId, existing)
  }

  const sections: string[] = ['[Injured Starters — Enrich Summaries]']

  for (const alert of alerts) {
    const playerNews = newsMap.get(alert.playerId) ?? []
    sections.push(
      `Player: ${alert.playerName} (${alert.position}, ${alert.team ?? 'FA'})` +
      `\nSeverity: ${alert.severity}` +
      `\nStatus: ${alert.injuryStatus ?? alert.status ?? 'none listed'}`,
    )

    if (playerNews.length > 0) {
      sections.push('News:')
      for (const n of playerNews) {
        const tierLabel = n.sourceTier === 1 ? 'Tier 1' : n.sourceTier === 2 ? 'Tier 2' : 'Tier 3'
        const ageLabel = n.publishedAt
          ? formatAgo(n.publishedAt)
          : 'unknown time ago'
        sections.push(`  [${n.sourceName} | ${tierLabel} | ${ageLabel}]: "${n.title}"`)
        if (n.snippet !== n.title && n.snippet.length > 0) {
          sections.push(`  ${n.snippet}`)
        }
      }
    } else {
      sections.push('News: none available — use status field only.')
    }

    sections.push('')
  }

  sections.push('Return a JSON array with one entry per player listed above.')
  return sections.join('\n')
}

function formatAgo(date: Date): string {
  const ms = Date.now() - date.getTime()
  if (ms < 3600000) return `${Math.round(ms / 60000)}m ago`
  if (ms < 86400000) return `${Math.round(ms / 3600000)}h ago`
  return `${Math.round(ms / 86400000)}d ago`
}
