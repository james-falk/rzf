import { Queue } from 'bullmq'
import { getRedisConnection } from './redis.js'
import type { AgentJobData } from '@rzf/shared/types'

const QUEUE_NAMES = {
  AGENTS: 'agents',
  INGESTION: 'ingestion',
} as const

let _agentQueue: Queue<AgentJobData> | null = null

export function getAgentQueue(): Queue<AgentJobData> {
  if (!_agentQueue) {
    _agentQueue = new Queue<AgentJobData>(QUEUE_NAMES.AGENTS, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    })
  }
  return _agentQueue
}
