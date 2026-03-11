import { env } from '@rzf/shared/env'
import type { ConnectionOptions } from 'bullmq'

let _connection: ConnectionOptions | null = null

function normalizeRedisHost(host: string): string {
  const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host)
  const isLocal = host === 'localhost' || host === '127.0.0.1'
  const hasDomain = host.includes('.')

  // Render Key Value internal URLs: only append .internal when running on Render
  // (RENDER=true); elsewhere (local, CI) use host as-is to avoid ENOTFOUND.
  if (env.RENDER === 'true' && !hasDomain && !isIp && !isLocal) return `${host}.internal`
  return host
}

export function getRedisConnection(): ConnectionOptions {
  if (_connection) return _connection

  if (!env.REDIS_URL) {
    throw new Error('No Redis connection configured. Set REDIS_URL.')
  }

  const url = new URL(env.REDIS_URL)
  _connection = {
    host: normalizeRedisHost(url.hostname),
    port: parseInt(url.port || '6379', 10),
    username: url.username || undefined,
    password: url.password || undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
    maxRetriesPerRequest: null,
  }

  return _connection
}
