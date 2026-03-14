import { getIngestionQueue } from './queues.js'
import { IngestionJobTypes } from '@rzf/shared/types'

/**
 * Schedules recurring ingestion jobs using BullMQ's repeat/cron feature.
 * Called once on worker startup.
 */
export async function scheduleIngestionJobs(): Promise<void> {
  const queue = getIngestionQueue()

  // Daily at 6am ET — full player refresh (depth chart, metadata, status)
  await queue.upsertJobScheduler(
    'player-refresh-daily',
    { pattern: '0 11 * * *' }, // 6am ET = 11am UTC
    { name: 'player-refresh', data: { type: IngestionJobTypes.PLAYER_REFRESH } },
  )

  // Every 30 minutes — lightweight injury status sync from Sleeper
  await queue.upsertJobScheduler(
    'injury-refresh-30min',
    { pattern: '*/30 * * * *' },
    { name: 'injury-refresh', data: { type: IngestionJobTypes.INJURY_REFRESH } },
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

  // Monthly on the 1st at 5am UTC (~12am ET) — reset paid users to 50 run credits
  await queue.upsertJobScheduler(
    'credits-refill-monthly',
    { pattern: '0 5 1 * *' },
    { name: 'credits-refill', data: { type: IngestionJobTypes.CREDITS_REFILL } },
  )

  // Every 2 hours — YouTube video refresh (quota-efficient: ~50 units per run)
  await queue.upsertJobScheduler(
    'youtube-refresh-2h',
    { pattern: '0 */2 * * *' },
    { name: 'youtube-refresh', data: { type: IngestionJobTypes.YOUTUBE_REFRESH } },
  )

  // Daily at 1pm UTC (8am ET) — trade transactions refresh for all known leagues
  await queue.upsertJobScheduler(
    'trade-refresh-daily',
    { pattern: '0 13 * * *' },
    { name: 'trade-refresh', data: { type: IngestionJobTypes.TRADE_REFRESH } },
  )

  // Weekly on Tuesday at 3pm UTC (10am ET) — trade values from FantasyCalc
  await queue.upsertJobScheduler(
    'trade-values-refresh-weekly',
    { pattern: '0 15 * * 2' },
    { name: 'trade-values-refresh', data: { type: IngestionJobTypes.TRADE_VALUES_REFRESH } },
  )

  // Weekly on Tuesday at 3:30pm UTC — ADP from Fantasy Football Calculator
  await queue.upsertJobScheduler(
    'adp-refresh-weekly',
    { pattern: '30 15 * * 2' },
    { name: 'adp-refresh', data: { type: IngestionJobTypes.ADP_REFRESH } },
  )

  // Weekly on Tuesday at 4pm UTC (11am ET) — Dynasty Daddy: KTC values + DD own values
  await queue.upsertJobScheduler(
    'dynasty-daddy-refresh-weekly',
    { pattern: '0 16 * * 2' },
    { name: 'dynasty-daddy-refresh', data: { type: IngestionJobTypes.DYNASTY_DADDY_REFRESH } },
  )

  console.log(
    '[scheduler] Ingestion jobs scheduled: player-daily, injury-30min, trending-hourly, rankings-weekly, content-30min, credits-refill-monthly, youtube-2h, trade-daily, trade-values-weekly, adp-weekly, dynasty-daddy-weekly',
  )
}
