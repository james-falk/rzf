import { env } from '@rzf/shared/env'
import type { ConnectionOptions } from 'bullmq'

let _connection: ConnectionOptions | null = null

export function getRedisConnection(): ConnectionOptions {
  if (_connection) return _connection

  if (!env.REDIS_URL) {
    throw new Error('No Redis connection configured. Set REDIS_URL.')
  }

  const url = new URL(env.REDIS_URL)
  _connection = {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  }

  return _connection
}
