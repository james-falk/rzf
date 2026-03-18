import { z } from 'zod'

// ─── Shared ───────────────────────────────────────────────────────────────────

const NFLPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DST', 'FLX', 'OP'] as const
const ScoringTypes = ['STD', 'PPR', 'HALF'] as const
const RankingTypes = ['draft', 'weekly', 'ros'] as const

export type FPPosition = (typeof NFLPositions)[number]
export type FPScoring = (typeof ScoringTypes)[number]
export type FPRankingType = (typeof RankingTypes)[number]

export const FP_POSITIONS: FPPosition[] = ['QB', 'RB', 'WR', 'TE', 'K']
export const FP_SCORING_TYPES: FPScoring[] = ['STD', 'PPR', 'HALF']

// ─── Players Endpoint ─────────────────────────────────────────────────────────

export const FPPlayerSchema = z.object({
  player_id: z.number(),
  player_name: z.string(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  position_id: z.string().optional(),
  team_id: z.string().nullable().optional(),
  sportsdata_player_id: z.string().nullable().optional(),
  rank_ecr: z.number().nullable().optional(),
  rank_adp: z.number().nullable().optional(),
  rank_ecr_ppr: z.number().nullable().optional(),
  rank_ecr_half: z.number().nullable().optional(),
  rank_adp_ppr: z.number().nullable().optional(),
  age: z.number().nullable().optional(),
  rookie: z.string().nullable().optional(),
  // External IDs — present when external_ids param is used
  yahoo_id: z.union([z.string(), z.number()]).nullable().optional(),
  espn_id: z.union([z.string(), z.number()]).nullable().optional(),
  cbs_id: z.union([z.string(), z.number()]).nullable().optional(),
  mfl_id: z.union([z.string(), z.number()]).nullable().optional(),
})

export type FPPlayer = z.infer<typeof FPPlayerSchema>

export const FPPlayersResponseSchema = z.object({
  sport: z.string(),
  count: z.number(),
  season: z.number().optional(),
  players: z.array(FPPlayerSchema),
})

export type FPPlayersResponse = z.infer<typeof FPPlayersResponseSchema>

// ─── News Endpoint ────────────────────────────────────────────────────────────

export const FPNewsItemSchema = z.object({
  id: z.number(),
  created: z.string(),
  author: z.string().nullable().optional(),
  player_id: z.number().nullable().optional(),
  team_id: z.string().nullable().optional(),
  title: z.string(),
  sport_id: z.string().optional(),
  categories: z.array(z.string()).optional(),
  link: z.string().nullable().optional(),
  desc: z.string().nullable().optional(),
  impact: z.string().nullable().optional(),
})

export type FPNewsItem = z.infer<typeof FPNewsItemSchema>

export const FPNewsResponseSchema = z.object({
  sport: z.string(),
  count: z.number().optional(),
  items: z.array(FPNewsItemSchema),
})

export type FPNewsResponse = z.infer<typeof FPNewsResponseSchema>

// ─── Injuries Endpoint ────────────────────────────────────────────────────────

export const FPInjurySchema = z.object({
  player_id: z.number(),
  name: z.string().optional(),
  team_id: z.string().nullable().optional(),
  injury_type: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  injury_update_date: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  status_short: z.string().nullable().optional(),
  probability_of_playing: z.union([z.string(), z.number()]).nullable().optional(),
  practice_1: z.string().nullable().optional(),
  practice_2: z.string().nullable().optional(),
  practice_3: z.string().nullable().optional(),
  practice_report_injury_type: z.string().nullable().optional(),
  team_practice_1_submitted: z.boolean().nullable().optional(),
  team_practice_2_submitted: z.boolean().nullable().optional(),
  team_practice_3_submitted: z.boolean().nullable().optional(),
})

export type FPInjury = z.infer<typeof FPInjurySchema>

export const FPInjuriesResponseSchema = z.object({
  sport: z.string(),
  count: z.number().optional(),
  injuries: z.array(FPInjurySchema),
})

export type FPInjuriesResponse = z.infer<typeof FPInjuriesResponseSchema>

// ─── Consensus Rankings Endpoint ──────────────────────────────────────────────

export const FPConsensusPlayerSchema = z.object({
  player_id: z.number(),
  player_name: z.string(),
  player_team_id: z.string().nullable().optional(),
  player_position_id: z.string().optional(),
  player_short_name: z.string().optional(),
  player_bye_week: z.union([z.string(), z.number()]).nullable().optional(),
  player_owned_avg: z.number().nullable().optional(),
  player_owned_espn: z.number().nullable().optional(),
  player_owned_yahoo: z.number().nullable().optional(),
  player_ecr_delta: z.number().nullable().optional(),
  rank_ecr: z.number().nullable().optional(),
  pos_rank: z.string().nullable().optional(),
  tier: z.number().nullable().optional(),
  sportsdata_id: z.string().nullable().optional(),
})

export type FPConsensusPlayer = z.infer<typeof FPConsensusPlayerSchema>

export const FPConsensusRankingsResponseSchema = z.object({
  sport: z.string(),
  year: z.union([z.string(), z.number()]).optional(),
  week: z.union([z.string(), z.number()]).optional(),
  count: z.number().optional(),
  total_experts: z.number().optional(),
  last_updated_ts: z.number().optional(),
  scoring: z.string().optional(),
  position_id: z.string().optional(),
  ranking_type_name: z.string().optional(),
  players: z.array(FPConsensusPlayerSchema),
})

export type FPConsensusRankingsResponse = z.infer<typeof FPConsensusRankingsResponseSchema>

// ─── Rankings Endpoint (with range + rankstats) ───────────────────────────────

export const FPRankStatsSchema = z.object({
  ECR: z.record(z.string(), z.number()).optional(),
  ECR_MIN: z.record(z.string(), z.number()).optional(),
  ECR_MAX: z.record(z.string(), z.number()).optional(),
  ECR_AVG: z.record(z.string(), z.number()).optional(),
  ECR_STD: z.record(z.string(), z.number()).optional(),
  ADP: z.record(z.string(), z.number()).optional(),
})

export const FPRankingsPlayerSchema = z.object({
  id: z.number(),
  player_name: z.string(),
  position_id: z.string().optional(),
  team_id: z.string().nullable().optional(),
  rank: FPRankStatsSchema.optional(),
})

export const FPRankingsResponseSchema = z.object({
  sport: z.string(),
  count: z.number().optional(),
  season: z.number().optional(),
  week: z.union([z.string(), z.number()]).optional(),
  players: z.array(FPRankingsPlayerSchema),
})

export type FPRankingsResponse = z.infer<typeof FPRankingsResponseSchema>

// ─── Projections Endpoint ─────────────────────────────────────────────────────

export const FPProjectionStatsSchema = z.object({
  points: z.number().nullable().optional(),
  points_ppr: z.number().nullable().optional(),
  points_half: z.number().nullable().optional(),
  pass_att: z.number().nullable().optional(),
  pass_cmp: z.number().nullable().optional(),
  pass_yds: z.number().nullable().optional(),
  pass_tds: z.number().nullable().optional(),
  pass_ints: z.number().nullable().optional(),
  rush_att: z.number().nullable().optional(),
  rush_yds: z.number().nullable().optional(),
  rush_tds: z.number().nullable().optional(),
  rec: z.number().nullable().optional(),
  rec_yds: z.number().nullable().optional(),
  rec_tds: z.number().nullable().optional(),
  fumbles: z.number().nullable().optional(),
})

export const FPProjectionPlayerSchema = z.object({
  fpid: z.number(),
  name: z.string(),
  position_id: z.string().optional(),
  team_id: z.string().nullable().optional(),
  stats: z.array(FPProjectionStatsSchema).optional(),
})

export const FPProjectionsResponseSchema = z.object({
  season: z.number().optional(),
  week: z.union([z.string(), z.number()]).optional(),
  count: z.number().optional(),
  positions: z.string().optional(),
  players: z.array(FPProjectionPlayerSchema),
})

export type FPProjectionsResponse = z.infer<typeof FPProjectionsResponseSchema>
