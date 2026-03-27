import { getIngestionQueue } from './queues.js'
import { INGESTION_SCHEDULED_JOB_ENTRIES, assertIngestionRegistryComplete } from '@rzf/shared'

/**
 * Schedules recurring ingestion jobs using BullMQ's repeat/cron feature.
 * Cron patterns and job types come from `@rzf/shared` ingestion registry (single source of truth).
 */
export async function scheduleIngestionJobs(): Promise<void> {
  assertIngestionRegistryComplete()

  const queue = getIngestionQueue()

  for (const entry of INGESTION_SCHEDULED_JOB_ENTRIES) {
    const { cron, type } = entry
    await queue.upsertJobScheduler(
      cron.schedulerId,
      { pattern: cron.pattern },
      { name: cron.queueJobName, data: { type } },
    )
  }

  console.log(
    `[scheduler] Ingestion jobs scheduled: ${INGESTION_SCHEDULED_JOB_ENTRIES.length} repeat jobs from @rzf/shared registry`,
  )
}
