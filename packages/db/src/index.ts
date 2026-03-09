export { db } from './client.js'
export { track } from './track.js'
export type { AnalyticsEventType, EventPayloads } from './track.js'

// Re-export Prisma types for consumers
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
