export const TIER_WEIGHTS: Record<number, number> = { 1: 3.0, 2: 1.5, 3: 1.0 }

export function tierWeightedScore(tier: number | null | undefined, publishedAt: Date | null): number {
  const weight = TIER_WEIGHTS[tier ?? 3] ?? 1.0
  const ageHours = publishedAt ? (Date.now() - publishedAt.getTime()) / 3_600_000 : 9999
  return weight * Math.exp(-ageHours / 24)
}
