/**
 * Tier 0 = structured ground-truth data for agents (not ContentSource.tier 1–3).
 * @see docs/DATA.md
 */

export const TIER_ZERO_PLAYER_RANKING_SOURCES = [
  'fantasypros',
  'ffc_adp_ppr',
  'ffc_adp_half_ppr',
  'ffc_adp_standard',
  'espn',
  'yahoo',
] as const

export type TierZeroPlayerRankingSource = (typeof TIER_ZERO_PLAYER_RANKING_SOURCES)[number]

export const TIER_ZERO_TRADE_VALUE_SOURCES = [
  'ktc',
  'fantasycalc',
  'dynastyprocess',
  'dynastysuperflex',
  'dynastydaddy',
] as const

export type TierZeroTradeValueSource = (typeof TIER_ZERO_TRADE_VALUE_SOURCES)[number]

/** Projections: any writer the worker upserts is treated as tier 0 */
export const TIER_ZERO_PROJECTION_SOURCES_KNOWN = ['fantasypros'] as const
