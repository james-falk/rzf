import { Queue } from 'bullmq'
import { getRedisConnection } from './redis.js'
import type { AgentJobData, IngestionJobType } from '@rzf/shared/types'

export const QUEUE_NAMES = {
  AGENTS: 'agents',
  INGESTION: 'ingestion',
} as const

let _agentQueue: Queue<AgentJobData> | null = null
let _ingestionQueue: Queue<{ type: IngestionJobType }> | null = null

export function getAgentQueue(): Queue<AgentJobData> {
  if (!_agentQueue) {
    _agentQueue = new Queue<AgentJobData>(QUEUE_NAMES.AGENTS, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 200 },
      },
    })
  }
  return _agentQueue
}

export function getIngestionQueue(): Queue<{ type: IngestionJobType }> {
  if (!_ingestionQueue) {
    _ingestionQueue = new Queue<{ type: IngestionJobType }>(QUEUE_NAMES.INGESTION, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 2,
        backoff: { type: 'exponential', delay: 10000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    })
  }
  return _ingestionQueue
}
