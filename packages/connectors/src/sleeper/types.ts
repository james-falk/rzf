import { z } from 'zod'

// ─── Sleeper API Response Types ───────────────────────────────────────────────

export const SleeperUserSchema = z.object({
  user_id: z.string(),
  username: z.string(),
  display_name: z.string(),
  avatar: z.string().nullable().optional(),
})

export type SleeperUser = z.infer<typeof SleeperUserSchema>

export const SleeperLeagueSchema = z.object({
  league_id: z.string(),
  name: z.string(),
  season: z.string(),
  status: z.string(),
  total_rosters: z.number(),
  roster_positions: z.array(z.string()),
  scoring_settings: z.record(z.string(), z.number()),
  settings: z.record(z.string(), z.unknown()),
  avatar: z.string().nullable().optional(),
})

export type SleeperLeague = z.infer<typeof SleeperLeagueSchema>

export const SleeperRosterSettingsSchema = z.object({
  wins: z.number().optional(),
  losses: z.number().optional(),
  ties: z.number().optional(),
  fpts: z.number().optional(),
  fpts_decimal: z.number().optional(),
  fpts_against: z.number().optional(),
  fpts_against_decimal: z.number().optional(),
  waiver_position: z.number().optional(),
  waiver_budget_used: z.number().optional(),
  total_moves: z.number().optional(),
})

export const SleeperRosterSchema = z.object({
  roster_id: z.number(),
  owner_id: z.string().nullable(),
  league_id: z.string(),
  players: z.array(z.string()).nullable(),
  starters: z.array(z.string()).nullable(),
  reserve: z.array(z.string()).nullable().optional(),
  settings: SleeperRosterSettingsSchema,
})

export type SleeperRoster = z.infer<typeof SleeperRosterSchema>

export const SleeperPlayerSchema = z.object({
  player_id: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  position: z.string().nullable().optional(),
  team: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  injury_status: z.string().nullable().optional(),
  practice_participation: z.string().nullable().optional(),
  depth_chart_position: z.string().nullable().optional(),
  depth_chart_order: z.number().nullable().optional(),
  search_rank: z.number().nullable().optional(),
  age: z.number().nullable().optional(),
  years_exp: z.number().nullable().optional(),
  fantasy_positions: z.array(z.string()).nullable().optional(),
  number: z.number().nullable().optional(),
})

export type SleeperPlayer = z.infer<typeof SleeperPlayerSchema>

export const SleeperTrendingPlayerSchema = z.object({
  player_id: z.string(),
  count: z.number(),
})

export type SleeperTrendingPlayer = z.infer<typeof SleeperTrendingPlayerSchema>

export const SleeperNFLStateSchema = z.object({
  week: z.number(),
  season_type: z.string(),
  season: z.string(),
  season_start_date: z.string().nullable().optional(),
  leg: z.number(),
  league_season: z.string(),
  display_week: z.number(),
})

export type SleeperNFLState = z.infer<typeof SleeperNFLStateSchema>

// ─── Sleeper Transactions ─────────────────────────────────────────────────────

const SleeperDraftPickSchema = z.object({
  season: z.string(),
  round: z.number(),
  roster_id: z.number(),
  previous_owner_id: z.number(),
  owner_id: z.number(),
})

const SleeperWaiverBudgetSchema = z.object({
  sender: z.number(),
  receiver: z.number(),
  amount: z.number(),
})

export const SleeperTransactionSchema = z.object({
  transaction_id: z.string(),
  type: z.string(),
  status: z.string(),
  leg: z.number(),
  created: z.number(),
  status_updated: z.number().optional(),
  roster_ids: z.array(z.number()),
  adds: z.record(z.string(), z.number()).nullable(),
  drops: z.record(z.string(), z.number()).nullable(),
  draft_picks: z.array(SleeperDraftPickSchema).nullable().default([]),
  waiver_budget: z.array(SleeperWaiverBudgetSchema).nullable().default([]),
  consenter_ids: z.array(z.number()).nullable().optional(),
  creator: z.string().nullable().optional(),
})

export type SleeperTransaction = z.infer<typeof SleeperTransactionSchema>
