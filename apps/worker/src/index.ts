import { createAgentWorker } from './workers/agent.worker.js'
import { createIngestionWorker } from './workers/ingestion.worker.js'
import { scheduleIngestionJobs } from './scheduler.js'
import { getIngestionQueue } from './queues.js'
import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'
import { IngestionJobTypes } from '@rzf/shared/types'

async function main(): Promise<void> {
  console.log('[worker] Starting Red Zone Fantasy worker...')
  console.log(`[worker] Node env: ${env.NODE_ENV}`)
  console.log(`[worker] Concurrency: ${env.WORKER_CONCURRENCY}`)

  // Start job workers
  const agentWorker = createAgentWorker()
  const ingestionWorker = createIngestionWorker()

  // Schedule recurring ingestion jobs
  await scheduleIngestionJobs()

  if (env.AUTO_SEED_SOCIAL_SOURCES) {
    const [redditN, twitterN] = await Promise.all([
      db.contentSource.count({ where: { platform: 'reddit', isActive: true } }),
      db.contentSource.count({ where: { platform: 'twitter', isActive: true } }),
    ])
    const q = getIngestionQueue()
    if (redditN === 0) {
      await q.add('auto-seed-reddit', { type: IngestionJobTypes.REDDIT_SEED })
      console.log('[worker] AUTO_SEED_SOCIAL_SOURCES: queued REDDIT_SEED (no active reddit sources)')
    }
    if (twitterN === 0) {
      await q.add('auto-seed-twitter', { type: IngestionJobTypes.TWITTER_SEED })
      console.log('[worker] AUTO_SEED_SOCIAL_SOURCES: queued TWITTER_SEED (no active twitter sources)')
    }
  }

  console.log('[worker] Workers started. Listening for jobs...')

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`[worker] Received ${signal}. Shutting down gracefully...`)
    await Promise.all([agentWorker.close(), ingestionWorker.close()])
    console.log('[worker] Shutdown complete.')
    process.exit(0)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  console.error('[worker] Fatal startup error:', err)
  process.exit(1)
})
