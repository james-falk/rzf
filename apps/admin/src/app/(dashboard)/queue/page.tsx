'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, type QueueStats, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function QueuePage() {
  const router = useRouter()
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const data = await api.getQueueStats()
      setStats(data)
      setLastRefreshed(new Date())
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [router])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => void load(true), 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoRefresh, load])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Queue Status</h1>
          {lastRefreshed && <p className="mt-1 text-xs text-zinc-500">Updated {lastRefreshed.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Agents Queue</h2>
          {stats?.agents.error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {stats.agents.error}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-5">
              <StatCard label="Waiting" value={stats?.agents.waiting ?? '—'} variant={(stats?.agents.waiting ?? 0) > 0 ? 'warning' : 'default'} />
              <StatCard label="Active" value={stats?.agents.active ?? '—'} variant={(stats?.agents.active ?? 0) > 0 ? 'success' : 'default'} />
              <StatCard label="Delayed" value={stats?.agents.delayed ?? '—'} />
              <StatCard label="Completed" value={stats?.agents.completed ?? '—'} />
              <StatCard label="Failed" value={stats?.agents.failed ?? '—'} variant={(stats?.agents.failed ?? 0) > 0 ? 'danger' : 'default'} />
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Ingestion Queue</h2>
          {stats?.ingestion.error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {stats.ingestion.error}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-5">
              <StatCard label="Waiting" value={stats?.ingestion.waiting ?? '—'} variant={(stats?.ingestion.waiting ?? 0) > 0 ? 'warning' : 'default'} />
              <StatCard label="Active" value={stats?.ingestion.active ?? '—'} variant={(stats?.ingestion.active ?? 0) > 0 ? 'success' : 'default'} />
              <StatCard label="Delayed" value={stats?.ingestion.delayed ?? '—'} />
              <StatCard label="Completed" value={stats?.ingestion.completed ?? '—'} />
              <StatCard label="Failed" value={stats?.ingestion.failed ?? '—'} variant={(stats?.ingestion.failed ?? 0) > 0 ? 'danger' : 'default'} />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
