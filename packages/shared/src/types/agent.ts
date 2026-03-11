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
}

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
  CONTENT_REFRESH: 'content_refresh',
} as const

export type IngestionJobType = (typeof IngestionJobTypes)[keyof typeof IngestionJobTypes]
