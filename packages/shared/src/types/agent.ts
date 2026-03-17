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
const TradePlayerBreakdownTolerantSchema = z.union([
  TradePlayerBreakdownSchema,
  z.string().transform((s) => ({
    playerId: '',
    playerName: s,
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
  dynasty1qbValue: z.number().nullable(),
  redraftValue: z.number().nullable(),
  trend: z.enum(['rising', 'falling', 'stable', 'unknown']),
  recentNewsSummary: z.string(),
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
}

// ─── Agent Job Payloads (BullMQ queue data) ───────────────────────────────────

export const AgentJobTypes = {
  TEAM_EVAL: 'team_eval',
  INJURY_WATCH: 'injury_watch',
  WAIVER: 'waiver',
  LINEUP: 'lineup',
  TRADE_ANALYSIS: 'trade_analysis',
  PLAYER_SCOUT: 'player_scout',
} as const

export type AgentJobType = (typeof AgentJobTypes)[keyof typeof AgentJobTypes]

export interface AgentJobData {
  agentRunId: string
  agentType: AgentJobType
  input: TeamEvalInput | InjuryWatchInput | WaiverInput | TradeAnalysisInput | LineupInput | PlayerScoutInput
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
} as const

export type IngestionJobType = (typeof IngestionJobTypes)[keyof typeof IngestionJobTypes]
