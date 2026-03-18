import { Worker } from 'bullmq'
import { db, track } from '@rzf/db'
import {
  runInjuryWatchAgent,
  runTeamEvalAgent,
  runWaiverAgent,
  runTradeAnalysisAgent,
  runLineupAgent,
  runPlayerScoutAgent,
  runPlayerCompareAgent,
} from '@rzf/agents'
import { env } from '@rzf/shared/env'
import { AgentJobTypes } from '@rzf/shared/types'
import type { AgentJobData } from '@rzf/shared/types'
import { getRedisConnection } from '../redis.js'
import { QUEUE_NAMES } from '../queues.js'

export function createAgentWorker(): Worker<AgentJobData> {
  const worker = new Worker<AgentJobData>(
    QUEUE_NAMES.AGENTS,
    async (job) => {
      const { agentRunId, agentType, input, sessionId } = job.data
      const startTime = Date.now()

      console.log(`[agent-worker] Starting ${agentType} job ${job.id} (run: ${agentRunId})`)

      // Mark run as running
      await db.agentRun.update({
        where: { id: agentRunId },
        data: { status: 'running' },
      })

      await track('agent.run.started', { agentType, userTier: 'unknown', leagueId: 'input' in input ? (input as { leagueId?: string }).leagueId : undefined }, input.userId)

      try {
        // Fetch runtime config from DB (system prompt override, model tier, and source config).
        // Falls back gracefully if config row is missing.
        const agentConfig = await db.agentConfig.findUnique({ where: { agentType } }).catch(() => null)
        const runtimeConfig = {
          ...(agentConfig
            ? {
                systemPromptOverride: agentConfig.systemPrompt,
                modelTierOverride: agentConfig.modelTier,
                allowedSourceTiers: agentConfig.allowedSourceTiers,
                allowedPlatforms: agentConfig.allowedPlatforms,
                recencyWindowHours: agentConfig.recencyWindowHours,
                maxContentItems: agentConfig.maxContentItems,
              }
            : {}),
          sessionId: sessionId ?? undefined,
        }

        let output: unknown

        switch (agentType) {
          case AgentJobTypes.TEAM_EVAL:
            output = await runTeamEvalAgent(input as Parameters<typeof runTeamEvalAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.INJURY_WATCH:
            output = await runInjuryWatchAgent(input as Parameters<typeof runInjuryWatchAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.WAIVER:
            output = await runWaiverAgent(input as Parameters<typeof runWaiverAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.LINEUP:
            output = await runLineupAgent(input as Parameters<typeof runLineupAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.TRADE_ANALYSIS:
            output = await runTradeAnalysisAgent(input as Parameters<typeof runTradeAnalysisAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.PLAYER_SCOUT:
            output = await runPlayerScoutAgent(input as Parameters<typeof runPlayerScoutAgent>[0], runtimeConfig)
            break
          case AgentJobTypes.PLAYER_COMPARE:
            output = await runPlayerCompareAgent(input as Parameters<typeof runPlayerCompareAgent>[0], runtimeConfig)
            break
          default:
            throw new Error(`Unknown agent type: ${agentType}`)
        }

        const durationMs = Date.now() - startTime
        const tokensUsed = (output as { tokensUsed?: number }).tokensUsed ?? 0
        const confidenceScore = (output as { confidenceScore?: number }).confidenceScore ?? null
        const sourcesUsed = (output as { sourcesUsed?: unknown }).sourcesUsed ?? null

        // Write result to DB
        await db.agentRun.update({
          where: { id: agentRunId },
          data: {
            status: 'done',
            outputJson: JSON.parse(JSON.stringify(output)),
            tokensUsed,
            durationMs,
            confidenceScore,
            sourcesUsed: sourcesUsed ? JSON.parse(JSON.stringify(sourcesUsed)) : null,
          },
        })

        // Track token usage in budget
        const now = new Date()
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        await db.tokenBudget.upsert({
          where: { userId_periodStart: { userId: input.userId, periodStart } },
          create: { userId: input.userId, periodStart, tokensUsed, runsUsed: 1 },
          update: { tokensUsed: { increment: tokensUsed }, runsUsed: { increment: 1 } },
        })

        // Decrement user run credits
        await db.user.update({
          where: { id: input.userId },
          data: { runCredits: { decrement: 1 } },
        })

        await track(
          'agent.run.completed',
          {
            agentType,
            tokensUsed,
            durationMs,
            grade: (output as { overallGrade?: string }).overallGrade,
          },
          input.userId,
        )

        console.log(`[agent-worker] Completed ${agentType} job ${job.id} in ${durationMs}ms (${tokensUsed} tokens)`)
        return output
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        const durationMs = Date.now() - startTime

        await db.agentRun.update({
          where: { id: agentRunId },
          data: { status: 'failed', errorMessage },
        })

        await track(
          'agent.run.failed',
          { agentType, errorType: 'execution_error', errorMessage },
          input.userId,
        )

        console.error(`[agent-worker] ❌ Failed ${agentType} job ${job.id} after ${durationMs}ms`)
        console.error(`[agent-worker] Error: ${errorMessage}`)
        if (err instanceof Error && err.stack) {
          console.error(`[agent-worker] Stack:\n${err.stack}`)
        }
        throw err
      }
    },
    {
      connection: getRedisConnection(),
      concurrency: env.WORKER_CONCURRENCY,
    },
  )

  worker.on('failed', (job, err) => {
    console.error(`[agent-worker] Job ${job?.id} permanently failed:`, err.message)
  })

  return worker
}
