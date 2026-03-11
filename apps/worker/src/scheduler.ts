import { getIngestionQueue } from './queues.js'
import { IngestionJobTypes } from '@rzf/shared/types'

/**
 * Schedules recurring ingestion jobs using BullMQ's repeat/cron feature.
 * Called once on worker startup.
 */
export async function scheduleIngestionJobs(): Promise<void> {
  const queue = getIngestionQueue()

  // Daily at 6am ET — full player refresh (injury, depth chart, status)
  await queue.upsertJobScheduler(
    'player-refresh-daily',
    { pattern: '0 11 * * *' }, // 6am ET = 11am UTC
    { name: 'player-refresh', data: { type: IngestionJobTypes.PLAYER_REFRESH } },
  )

  // Hourly — trending adds/drops for waiver wire signals
  await queue.upsertJobScheduler(
    'trending-refresh-hourly',
    { pattern: '0 * * * *' },
    { name: 'trending-refresh', data: { type: IngestionJobTypes.TRENDING_REFRESH } },
  )

  // Weekly on Tuesday at 9am ET — consensus rankings refresh
  await queue.upsertJobScheduler(
    'rankings-refresh-weekly',
    { pattern: '0 14 * * 2' }, // Tuesday 9am ET = 2pm UTC
    { name: 'rankings-refresh', data: { type: IngestionJobTypes.RANKINGS_REFRESH } },
  )

  // Every 30 minutes — RSS content refresh (articles + player mentions)
  await queue.upsertJobScheduler(
    'content-refresh-30min',
    { pattern: '*/30 * * * *' },
    { name: 'content-refresh', data: { type: IngestionJobTypes.CONTENT_REFRESH } },
  )

  console.log('[scheduler] Ingestion jobs scheduled: player-daily, trending-hourly, rankings-weekly, content-30min')
}
