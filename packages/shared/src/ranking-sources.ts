/**
 * Human labels + semantic kind for PlayerRanking.source (Directory + agents).
 */

export type RankingSourceKind = 'ecr' | 'adp' | 'platform_rank' | 'unknown'

export interface RankingSourceMeta {
  label: string
  shortLabel?: string
  kind: RankingSourceKind
}

export const RANKING_SOURCE_REGISTRY: Record<string, RankingSourceMeta> = {
  fantasypros: { label: 'FantasyPros ECR', shortLabel: 'FP', kind: 'ecr' },
  espn: { label: 'ESPN', kind: 'platform_rank' },
  yahoo: { label: 'Yahoo', kind: 'platform_rank' },
  sleeper_trending: { label: 'Sleeper trending', kind: 'platform_rank' },
  ffc_adp_ppr: { label: 'FFC ADP · PPR', shortLabel: 'ADP PPR', kind: 'adp' },
  ffc_adp_half_ppr: { label: 'FFC ADP · Half PPR', shortLabel: 'ADP Half', kind: 'adp' },
  ffc_adp_standard: { label: 'FFC ADP · Standard', shortLabel: 'ADP Std', kind: 'adp' },
}

export function rankingSourceMeta(source: string): RankingSourceMeta {
  return RANKING_SOURCE_REGISTRY[source] ?? {
    label: source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    kind: 'unknown',
  }
}
