/**
 * Shared keyword-based topic tags for ContentItem.topics (snake_case slugs).
 * Used by RSS, YouTube, ESPN, FantasyPros, and any path that stores articles/videos.
 */

export function inferContentTopics(text: string): string[] {
  const t = text.toLowerCase()
  const topics: string[] = []

  if (/injur|hurt|questionable|doubtful|out\b|placed on ir|injured reserve/.test(t)) topics.push('injury')
  if (/trade[d]?|trading|deal|acqui[re|red]/.test(t)) topics.push('trade')
  if (/waiver|stream|pickup|add\b/.test(t)) topics.push('waiver')
  if (/start|lineup|flex|sit\b|bench|must.?start/.test(t)) topics.push('lineup')
  if (/break.?out|emerge|target share|snap count|usage rate|role/.test(t)) topics.push('breakout')
  if (/depth chart|promoted|demoted|starter|resting/.test(t)) topics.push('depth_chart')
  if (/rank\b|ranking|tier\b|consensus/.test(t)) topics.push('rankings')

  if (/free agency|free-agent|franchise tag|tag\s*&\s*trade|re-?sign|signing|contract extension|cap hit|salary cap/.test(t))
    topics.push('free_agency')
  if (/rookie|draft class|nfl draft|draft pick|first round|mock draft|big board|draft profile/.test(t)) topics.push('rookie_draft')
  if (/nfl combine|scouting combine|combine invitation|bench press|40-yard|40 yard/.test(t)) topics.push('nfl_combine')
  if (/pro day|pro-day/.test(t)) topics.push('pro_day')
  if (/playoff|wild card|wild-card|divisional|conference championship|super bowl|afc championship|nfc championship/.test(t))
    topics.push('playoffs')
  if (/head coach|coaching staff|offensive coordinator|defensive coordinator|\bfired\b|\bhired\b.*coach/.test(t))
    topics.push('coaching')

  return [...new Set(topics)]
}
