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
  sleeperUserId: z.string(),
  leagueId: z.string(),
})

export type TeamEvalInput = z.infer<typeof TeamEvalInputSchema>

export const TeamEvalOutputSchema = z.object({
  overallGrade: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  positionGrades: z.record(z.string(), z.string()),
  keyInsights: z.array(z.string()),
  contentLinks: z.array(ContentLinkSchema),
  tokensUsed: z.number(),
})

export type TeamEvalOutput = z.infer<typeof TeamEvalOutputSchema>

// ─── Agent Job Payloads (BullMQ queue data) ───────────────────────────────────

export const AgentJobTypes = {
  TEAM_EVAL: 'team_eval',
  WAIVER: 'waiver',
  LINEUP: 'lineup',
} as const

export type AgentJobType = (typeof AgentJobTypes)[keyof typeof AgentJobTypes]

export interface AgentJobData {
  agentRunId: string
  agentType: AgentJobType
  input: TeamEvalInput
}

// ─── Ingestion Job Payloads ───────────────────────────────────────────────────

export const IngestionJobTypes = {
  PLAYER_REFRESH: 'player_refresh',
  TRENDING_REFRESH: 'trending_refresh',
  RANKINGS_REFRESH: 'rankings_refresh',
} as const

export type IngestionJobType = (typeof IngestionJobTypes)[keyof typeof IngestionJobTypes]
