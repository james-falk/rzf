'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface QueueStats {
  agents: {
    waiting: number
    active: number
    completed: number
    failed: number
    error?: string
  }
}

export default function InternalQueuePage() {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  async function load() {
    setLoading(true)
    const secret = localStorage.getItem('admin_secret') ?? ''
    try {
      const data = await api.getQueueStats(secret)
      setStats(data as QueueStats)
      setLastRefreshed(new Date())
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Queue Status</h1>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {lastRefreshed && (
        <p className="mb-4 text-xs text-zinc-500">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}

      {stats && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-zinc-300">Agents Queue</h2>
          {stats.agents.error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {stats.agents.error}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-4">
              {[
                { label: 'Waiting', value: stats.agents.waiting, color: 'text-yellow-400' },
                { label: 'Active', value: stats.agents.active, color: 'text-blue-400' },
                { label: 'Completed', value: stats.agents.completed, color: 'text-emerald-400' },
                { label: 'Failed', value: stats.agents.failed, color: stats.agents.failed > 0 ? 'text-red-400' : 'text-zinc-400' },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
                  <p className="mb-1 text-xs text-zinc-400">{s.label}</p>
                  <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
