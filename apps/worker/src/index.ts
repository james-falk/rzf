import { createAgentWorker } from './workers/agent.worker.js'
import { createIngestionWorker } from './workers/ingestion.worker.js'
import { scheduleIngestionJobs } from './scheduler.js'
import { env } from '@rzf/shared/env'

async function main(): Promise<void> {
  console.log('[worker] Starting Red Zone Fantasy worker...')
  console.log(`[worker] Node env: ${env.NODE_ENV}`)
  console.log(`[worker] Concurrency: ${env.WORKER_CONCURRENCY}`)

  // Start job workers
  const agentWorker = createAgentWorker()
  const ingestionWorker = createIngestionWorker()

  // Schedule recurring ingestion jobs
  await scheduleIngestionJobs()

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
