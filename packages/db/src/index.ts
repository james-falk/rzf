export { db } from './client.js'
export { track } from './track.js'
export type { AnalyticsEventType, EventPayloads } from './track.js'

// Re-export Prisma namespace (e.g. Prisma.sql) and model types for consumers
export { Prisma } from '@prisma/client'
export type {
  User,
  SleeperProfile,
  UserPreferences,
  AgentRun,
  TokenBudget,
  AnalyticsEvent,
  Player,
  PlayerRanking,
  TrendingPlayer,
  ContentItem,
  ContentSource,
  UserTier,
  UserRole,
  AgentRunStatus,
  AgentResultRating,
  LeagueStyle,
  ScoringPriority,
  PlayStyle,
  ReportFormat,
  TrendingType,
} from '@prisma/client'
