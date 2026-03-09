-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserTier" AS ENUM ('free', 'paid');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "AgentRunStatus" AS ENUM ('queued', 'running', 'done', 'failed');

-- CreateEnum
CREATE TYPE "AgentResultRating" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "LeagueStyle" AS ENUM ('redraft', 'keeper', 'dynasty');

-- CreateEnum
CREATE TYPE "ScoringPriority" AS ENUM ('ppr', 'half_ppr', 'standard');

-- CreateEnum
CREATE TYPE "PlayStyle" AS ENUM ('safe_floor', 'balanced', 'boom_bust');

-- CreateEnum
CREATE TYPE "ReportFormat" AS ENUM ('detailed', 'concise');

-- CreateEnum
CREATE TYPE "TrendingType" AS ENUM ('add', 'drop');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tier" "UserTier" NOT NULL DEFAULT 'free',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "runCredits" INTEGER NOT NULL DEFAULT 2,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripeSubscriptionStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sleeper_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sleeperId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "leagues" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sleeper_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leagueStyle" "LeagueStyle" NOT NULL DEFAULT 'redraft',
    "scoringPriority" "ScoringPriority" NOT NULL DEFAULT 'ppr',
    "playStyle" "PlayStyle" NOT NULL DEFAULT 'balanced',
    "reportFormat" "ReportFormat" NOT NULL DEFAULT 'detailed',
    "priorityPositions" TEXT[],
    "customInstructions" TEXT,
    "notifyOnInjury" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnTrending" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_runs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentType" TEXT NOT NULL,
    "status" "AgentRunStatus" NOT NULL DEFAULT 'queued',
    "inputJson" JSONB NOT NULL,
    "outputJson" JSONB,
    "tokensUsed" INTEGER,
    "durationMs" INTEGER,
    "rating" "AgentResultRating",
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_budgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "runsUsed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "token_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "sleeperId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "team" TEXT,
    "status" TEXT NOT NULL,
    "injuryStatus" TEXT,
    "practiceParticipation" TEXT,
    "depthChartPosition" TEXT,
    "depthChartOrder" INTEGER,
    "searchRank" INTEGER,
    "age" INTEGER,
    "yearsExp" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "lastRefreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("sleeperId")
);

-- CreateTable
CREATE TABLE "player_rankings" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rankOverall" INTEGER NOT NULL,
    "rankPosition" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_rankings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trending_players" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "TrendingType" NOT NULL,
    "count" INTEGER NOT NULL,
    "lookbackHours" INTEGER NOT NULL DEFAULT 24,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trending_players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "authorName" TEXT,
    "rawContent" TEXT NOT NULL,
    "extractedFacts" JSONB NOT NULL DEFAULT '{}',
    "playerIds" TEXT[],
    "teamSlugs" TEXT[],
    "topics" TEXT[],
    "importanceScore" DOUBLE PRECISION,
    "noveltyScore" DOUBLE PRECISION,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceId" TEXT,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "refreshIntervalMins" INTEGER NOT NULL DEFAULT 60,
    "lastFetchedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "content_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerkId_key" ON "users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sleeper_profiles_userId_key" ON "sleeper_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "agent_runs_userId_idx" ON "agent_runs"("userId");

-- CreateIndex
CREATE INDEX "agent_runs_agentType_idx" ON "agent_runs"("agentType");

-- CreateIndex
CREATE INDEX "agent_runs_status_idx" ON "agent_runs"("status");

-- CreateIndex
CREATE INDEX "agent_runs_createdAt_idx" ON "agent_runs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "token_budgets_userId_periodStart_key" ON "token_budgets"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_userId_idx" ON "analytics_events"("userId");

-- CreateIndex
CREATE INDEX "analytics_events_createdAt_idx" ON "analytics_events"("createdAt");

-- CreateIndex
CREATE INDEX "players_position_idx" ON "players"("position");

-- CreateIndex
CREATE INDEX "players_team_idx" ON "players"("team");

-- CreateIndex
CREATE INDEX "players_injuryStatus_idx" ON "players"("injuryStatus");

-- CreateIndex
CREATE INDEX "player_rankings_source_week_season_idx" ON "player_rankings"("source", "week", "season");

-- CreateIndex
CREATE UNIQUE INDEX "player_rankings_playerId_source_week_season_key" ON "player_rankings"("playerId", "source", "week", "season");

-- CreateIndex
CREATE INDEX "trending_players_type_fetchedAt_idx" ON "trending_players"("type", "fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_items_sourceUrl_key" ON "content_items"("sourceUrl");

-- CreateIndex
CREATE INDEX "content_items_sourceType_idx" ON "content_items"("sourceType");

-- CreateIndex
CREATE INDEX "content_items_fetchedAt_idx" ON "content_items"("fetchedAt");

-- AddForeignKey
ALTER TABLE "sleeper_profiles" ADD CONSTRAINT "sleeper_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_budgets" ADD CONSTRAINT "token_budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rankings" ADD CONSTRAINT "player_rankings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("sleeperId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trending_players" ADD CONSTRAINT "trending_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("sleeperId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "content_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
