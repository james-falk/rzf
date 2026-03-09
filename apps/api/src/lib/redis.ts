import { env } from '@rzf/shared/env'
import type { ConnectionOptions } from 'bullmq'

let _connection: ConnectionOptions | null = null

export function getRedisConnection(): ConnectionOptions {
  if (_connection) return _connection

  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    const url = new URL(env.UPSTASH_REDIS_REST_URL)
    _connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: env.UPSTASH_REDIS_REST_TOKEN,
      tls: {},
      maxRetriesPerRequest: null,
    }
  } else if (env.REDIS_URL) {
    const url = new URL(env.REDIS_URL)
    _connection = {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      maxRetriesPerRequest: null,
    }
  } else {
    throw new Error('No Redis connection configured.')
  }

  return _connection
}
