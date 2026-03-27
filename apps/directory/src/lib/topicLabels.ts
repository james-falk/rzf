/** Human-readable labels for ContentItem topic slugs (trending chips, filters). */

export const TOPIC_LABELS: Record<string, string> = {
  injury: '#Injury',
  trade: '#Trade',
  waiver: '#Waiver',
  lineup: '#Lineup',
  breakout: '#Breakout',
  depth_chart: '#DepthChart',
  rankings: '#Rankings',
  free_agency: '#FreeAgency',
  rookie_draft: '#RookieDraft',
  nfl_combine: '#Combine',
  pro_day: '#ProDay',
  playoffs: '#Playoffs',
  coaching: '#Coaching',
  stat_update: '#Stats',
  espn: '#ESPN',
}

export function topicDisplayLabel(slug: string): string {
  return TOPIC_LABELS[slug] ?? `#${slug.replace(/_/g, '')}`
}
