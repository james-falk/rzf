import { z } from 'zod'

// ─── Content Link ─────────────────────────────────────────────────────────────

export const ContentLinkSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  title: z.string(),
  url: z.string().url(),
  type: z.enum(['article', 'youtube', 'fantasypros']),
})

export type ContentLink = z.infer<typeof ContentLinkSchema>

// ─── Team Eval Agent ──────────────────────────────────────────────────────────

export const TeamEvalInputSchema = z.object({
  userId: z.string(),
  leagueId: z.string(),
  focusNote: z.string().max(200).optional(),
})

export type TeamEvalInput = z.infer<typeof TeamEvalInputSchema>

export const InjuryWatchInputSchema = z.object({
  userId: z.string(),
  leagueId: z.string(),
  focusNote: z.string().max(200).optional(),
})

export type InjuryWatchInput = z.infer<typeof InjuryWatchInputSchema>

// ─── Manager / Intent Agent ───────────────────────────────────────────────────

export const ManagerIntentInputSchema = z.object({
  message: z.string().max(500),
  context: z.object({ leagueId: z.string().optional() }).optional(),
})

export type ManagerIntentInput = z.infer<typeof ManagerIntentInputSchema>

export interface AgentMeta {
  type: string
  label: string
  description: string
  available: boolean
  requiredParams: string[]
}

export interface ManagerIntentOutput {
  agentType: string | null
  agentMeta: AgentMeta | null
  gatheredParams: Record<string, string>
  missingParams: string[]
  clarifyingQuestion: string | null
  readyToRun: boolean
  availableAgents: AgentMeta[]
  redirectUrl?: string
  extractedPlayers?: Array<{ name: string; playerId?: string; confidence: number }>
  needsClarification?: boolean
  extractedFocusNote?: string | null
}

export const TeamEvalOutputSchema = z.object({
  overallGrade: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  positionGrades: z.record(z.string(), z.string()),
  keyInsights: z.array(z.string()),
  contentLinks: z.array(ContentLinkSchema),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type TeamEvalOutput = z.infer<typeof TeamEvalOutputSchema>

export const InjuryAlertSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  status: z.string().nullable(),
  injuryStatus: z.string().nullable(),
  severity: z.enum(['high', 'medium', 'low']),
  summary: z.string(),
  recommendation: z.string(),
  handcuffSuggestion: z.string().optional(),
})

export const InjuryWatchOutputSchema = z.object({
  alerts: z.array(InjuryAlertSchema),
  riskyStarters: z.number().int().nonnegative(),
  healthyStarters: z.number().int().nonnegative(),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type InjuryWatchOutput = z.infer<typeof InjuryWatchOutputSchema>

// ─── Waiver Wire Agent ────────────────────────────────────────────────────────

export const WaiverInputSchema = z.object({
  userId: z.string(),
  leagueId: z.string(),
  targetPosition: z.enum(['QB', 'RB', 'WR', 'TE', 'K']).optional(),
  focusNote: z.string().max(200).optional(),
})

export type WaiverInput = z.infer<typeof WaiverInputSchema>

export const WaiverRecommendationSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  pickupScore: z.number().min(0).max(100),
  reason: z.string(),
  dropSuggestion: z.string().nullable(),
})

export const WaiverOutputSchema = z.object({
  recommendations: z.array(WaiverRecommendationSchema).max(5),
  summary: z.string(),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type WaiverOutput = z.infer<typeof WaiverOutputSchema>

// ─── Trade Analyzer Agent ─────────────────────────────────────────────────────

export const TradeAnalysisInputSchema = z.object({
  userId: z.string(),
  leagueId: z.string(),
  giving: z.array(z.string()).min(1).max(5),
  receiving: z.array(z.string()).min(1).max(5),
  focusNote: z.string().max(200).optional(),
})

export type TradeAnalysisInput = z.infer<typeof TradeAnalysisInputSchema>

export const TradePlayerBreakdownSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  tradeValue: z.number().nullable(),
  rankOverall: z.number().nullable(),
  analysis: z.string(),
})

// Tolerant version: if the LLM returns a string item instead of an object
// (e.g. due to token truncation), coerce it into a minimal valid breakdown.
// playerName is intentionally left blank so the UI doesn't render the full
// analysis sentence twice (once bold as name, once as the analysis text).
const TradePlayerBreakdownTolerantSchema = z.union([
  TradePlayerBreakdownSchema,
  z.string().transform((s) => ({
    playerId: '',
    playerName: '',
    position: '',
    team: null,
    tradeValue: null,
    rankOverall: null,
    analysis: s,
  })),
])

export const TradeAnalysisOutputSchema = z.object({
  verdict: z.enum(['accept', 'decline', 'counter']),
  valueScore: z.number().min(-100).max(100),
  summary: z.string(),
  givingAnalysis: z.array(TradePlayerBreakdownTolerantSchema),
  receivingAnalysis: z.array(TradePlayerBreakdownTolerantSchema),
  keyInsights: z.array(z.string()),
  recentTrades: z.array(z.object({
    sideA: z.array(z.string()),
    sideB: z.array(z.string()),
    date: z.string(),
  })).optional(),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type TradeAnalysisOutput = z.infer<typeof TradeAnalysisOutputSchema>

// ─── Lineup Optimizer Agent ───────────────────────────────────────────────────

export const LineupInputSchema = z.object({
  userId: z.string(),
  leagueId: z.string(),
  week: z.number().int().min(1).max(18).optional(),
  focusNote: z.string().max(200).optional(),
})

export type LineupInput = z.infer<typeof LineupInputSchema>

export const LineupSlotSchema = z.object({
  slot: z.string(),
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  opponent: z.string().nullable(),
  confidence: z.enum(['high', 'medium', 'low']),
  reason: z.string(),
})

export const LineupOutputSchema = z.object({
  recommendedLineup: z.array(LineupSlotSchema),
  benchedPlayers: z.array(z.object({
    playerId: z.string(),
    playerName: z.string(),
    reason: z.string(),
  })),
  keyMatchups: z.array(z.string()),
  warnings: z.array(z.string()),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type LineupOutput = z.infer<typeof LineupOutputSchema>

// ─── Player Scout Agent ───────────────────────────────────────────────────────

export const PlayerScoutInputSchema = z.object({
  userId: z.string(),
  playerId: z.string(),
  context: z.string().max(300).optional(),
  focusNote: z.string().max(200).optional(),
})

export type PlayerScoutInput = z.infer<typeof PlayerScoutInputSchema>

export const PlayerScoutOutputSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  injuryStatus: z.string().nullable(),
  rankOverall: z.number().nullable(),
  rankPosition: z.number().nullable(),
  dynastyRank: z.number().nullable().optional(),
  dynastyPositionRank: z.number().nullable().optional(),
  dynasty1qbValue: z.number().nullable(),
  redraftValue: z.number().nullable(),
  trend: z.enum(['rising', 'falling', 'stable', 'unknown']),
  recentNewsSummary: z.string(),
  newsItems: z.array(z.object({
    title: z.string(),
    url: z.string().nullable().optional(),
    sourceName: z.string(),
    publishedAt: z.string().nullable().optional(),
  })).optional(),
  recentTradesCount: z.number().int(),
  summary: z.string(),
  keyInsights: z.array(z.string()),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type PlayerScoutOutput = z.infer<typeof PlayerScoutOutputSchema>

// ─── Agent Runtime Config (from AgentConfig DB model) ────────────────────────

export interface AgentRuntimeConfig {
  systemPromptOverride?: string
  modelTierOverride?: string
  // Source injection config — populated from AgentConfig DB row
  allowedSourceTiers?: number[]
  allowedPlatforms?: string[]
  recencyWindowHours?: number
  maxContentItems?: number
  // Cross-agent session context — set by the worker from AgentJobData.sessionId
  sessionId?: string
}

// ─── Agent Job Payloads (BullMQ queue data) ───────────────────────────────────

export const AgentJobTypes = {
  TEAM_EVAL: 'team_eval',
  INJURY_WATCH: 'injury_watch',
  WAIVER: 'waiver',
  LINEUP: 'lineup',
  TRADE_ANALYSIS: 'trade_analysis',
  PLAYER_SCOUT: 'player_scout',
  PLAYER_COMPARE: 'player_compare',
} as const

export type AgentJobType = (typeof AgentJobTypes)[keyof typeof AgentJobTypes]

// ─── Player Compare Agent ─────────────────────────────────────────────────────

export const PlayerCompareInputSchema = z.object({
  userId: z.string(),
  playerIds: z.array(z.string()).min(2).max(4),
  focusNote: z.string().max(300).optional(),
})

export type PlayerCompareInput = z.infer<typeof PlayerCompareInputSchema>

export const PlayerComparePlayerSchema = z.object({
  playerId: z.string(),
  playerName: z.string(),
  position: z.string(),
  team: z.string().nullable(),
  dynastyValue: z.number().nullable(),
  dynastyRank: z.number().nullable(),
  dynastyPositionRank: z.number().nullable(),
  redraftValue: z.number().nullable(),
  trend: z.enum(['rising', 'falling', 'stable', 'unknown']),
  injuryStatus: z.string().nullable(),
  summary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
})

export const PlayerCompareOutputSchema = z.object({
  winnerId: z.string().nullable(),
  winnerName: z.string().nullable(),
  winMargin: z.enum(['clear', 'slight', 'even']),
  verdict: z.string(),
  players: z.array(PlayerComparePlayerSchema),
  keyInsights: z.array(z.string()),
  recommendation: z.string(),
  tokensUsed: z.number(),
  confidenceScore: z.number().int().min(0).max(100).optional(),
  sourcesUsed: z.unknown().optional(),
})

export type PlayerCompareOutput = z.infer<typeof PlayerCompareOutputSchema>

export interface AgentJobData {
  agentRunId: string
  agentType: AgentJobType
  input: TeamEvalInput | InjuryWatchInput | WaiverInput | TradeAnalysisInput | LineupInput | PlayerScoutInput | PlayerCompareInput
  /** Groups runs made within the same user session for cross-agent context injection */
  sessionId?: string
}

// ─── Ingestion Job Payloads ───────────────────────────────────────────────────

export const IngestionJobTypes = {
  PLAYER_REFRESH: 'player_refresh',
  INJURY_REFRESH: 'injury_refresh',
  TRENDING_REFRESH: 'trending_refresh',
  RANKINGS_REFRESH: 'rankings_refresh',
  CONTENT_REFRESH: 'content_refresh',
  CREDITS_REFILL: 'credits_refill',
  YOUTUBE_REFRESH: 'youtube_refresh',
  TRADE_REFRESH: 'trade_refresh',
  TRADE_VALUES_REFRESH: 'trade_values_refresh',
  ADP_REFRESH: 'adp_refresh',
  DYNASTY_DADDY_REFRESH: 'dynasty_daddy_refresh',
  SEASON_STATS_REFRESH: 'season_stats_refresh',
  // FantasyPros API ingestion jobs
  FP_PLAYER_ID_SYNC: 'fp_player_id_sync',
  FP_RANKINGS_REFRESH: 'fp_rankings_refresh',
  FP_PROJECTIONS_REFRESH: 'fp_projections_refresh',
  FP_NEWS_REFRESH: 'fp_news_refresh',
  FP_INJURIES_REFRESH: 'fp_injuries_refresh',
  // ESPN ingestion jobs
  ESPN_NEWS_REFRESH: 'espn_news_refresh',
  ESPN_DEFENSE_REFRESH: 'espn_defense_refresh',
  ESPN_RANKINGS_REFRESH: 'espn_rankings_refresh',
  // The Odds API ingestion
  ODDS_REFRESH: 'odds_refresh',
  // Yahoo Fantasy (OAuth) — PlayerRanking source=yahoo
  YAHOO_RANKINGS_REFRESH: 'yahoo_rankings_refresh',
  // Twitter/X read ingestion (separate from write-only official API)
  TWITTER_INGESTION_REFRESH: 'twitter_ingestion_refresh',
  // Reddit content ingestion (via RSS feeds)
  REDDIT_REFRESH: 'reddit_refresh',
  /** Paginate subreddit new.json ~14d; idempotent via URL dedupe */
  REDDIT_BACKFILL: 'reddit_backfill',
  // One-time seed: registers default subreddits as ContentSource rows
  REDDIT_SEED: 'reddit_seed',
  // One-time seed: registers default Nitter/Twitter handles as ContentSource rows
  TWITTER_SEED: 'twitter_seed',
  // Context revision: nightly pass to generate learning proposals
  CONTEXT_REVISION: 'context_revision',
} as const

export type IngestionJobType = (typeof IngestionJobTypes)[keyof typeof IngestionJobTypes]

/** Every ingestion job type string (for catalogs). */
export const INGESTION_JOB_TYPE_VALUES = Object.values(IngestionJobTypes) as IngestionJobType[]

const _ingestionJobTypeZodTuple = Object.values(IngestionJobTypes) as [
  IngestionJobType,
  ...IngestionJobType[],
]

/** Validates `type` for `POST /internal/ingestion/trigger` — aligned with worker switch */
export const IngestionJobTypeSchema = z.enum(_ingestionJobTypeZodTuple)
