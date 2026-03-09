import { Worker } from 'bullmq'
import { db, track } from '@rzf/db'
import { runTeamEvalAgent } from '@rzf/agents'
import { env } from '@rzf/shared/env'
import { AgentJobTypes } from '@rzf/shared/types'
import type { AgentJobData } from '@rzf/shared/types'
import { getRedisConnection } from '../redis.js'
import { QUEUE_NAMES } from '../queues.js'

export function createAgentWorker(): Worker<AgentJobData> {
  const worker = new Worker<AgentJobData>(
    QUEUE_NAMES.AGENTS,
    async (job) => {
      const { agentRunId, agentType, input } = job.data
      const startTime = Date.now()

      console.log(`[agent-worker] Starting ${agentType} job ${job.id} (run: ${agentRunId})`)

      // Mark run as running
      await db.agentRun.update({
        where: { id: agentRunId },
        data: { status: 'running' },
      })

      await track('agent.run.started', { agentType, userTier: 'unknown', leagueId: 'input' in input ? (input as { leagueId?: string }).leagueId : undefined }, input.userId)

      try {
        let output: unknown

        switch (agentType) {
          case AgentJobTypes.TEAM_EVAL:
            output = await runTeamEvalAgent(input)
            break
          default:
            throw new Error(`Unknown agent type: ${agentType}`)
        }

        const durationMs = Date.now() - startTime
        const tokensUsed = (output as { tokensUsed?: number }).tokensUsed ?? 0

        // Write result to DB
        await db.agentRun.update({
          where: { id: agentRunId },
          data: {
            status: 'done',
            outputJson: JSON.parse(JSON.stringify(output)),
            tokensUsed,
            durationMs,
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

        console.error(`[agent-worker] Failed ${agentType} job ${job.id} after ${durationMs}ms:`, errorMessage)
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
