'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, type QueueStats, type QueueJob, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { RefreshCw, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

const STATE_DESCRIPTIONS: Record<string, string> = {
  Waiting: 'Jobs ready to be picked up by a worker',
  Active: 'Currently being processed by a worker',
  Delayed: 'Scheduled for a future time',
  Completed: 'Successfully finished',
  Failed: 'Errored — check job details for the reason',
}

function Tooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span className="relative inline-block">
      <Info size={12} className="cursor-help text-zinc-600 hover:text-zinc-400" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} />
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1.5 w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-xs text-zinc-300 shadow-xl">
          {text}
        </span>
      )}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/20 text-emerald-400',
    waiting: 'bg-yellow-500/20 text-yellow-400',
    delayed: 'bg-blue-500/20 text-blue-400',
    completed: 'bg-zinc-700 text-zinc-400',
    failed: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-zinc-700 text-zinc-400'}`}>
      {status}
    </span>
  )
}

function timeAgo(ts: number | null) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function AgentQueuePage() {
  const router = useRouter()
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [jobs, setJobs] = useState<QueueJob[]>([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    try {
      const [statsData, jobsData] = await Promise.all([
        api.getQueueStats(),
        api.getQueueJobs('agents', 20),
      ])
      setStats(statsData)
      setJobs(jobsData.jobs)
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
    if (autoRefresh) intervalRef.current = setInterval(() => void load(true), 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoRefresh, load])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agent Queue</h1>
          {lastRefreshed && <p className="mt-1 text-xs text-zinc-500">Updated {lastRefreshed.toLocaleTimeString()}</p>}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-zinc-400">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
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
          {stats?.agents.error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{stats.agents.error}</div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-5">
              {(['Waiting', 'Active', 'Delayed', 'Completed', 'Failed'] as const).map((label) => {
                const key = label.toLowerCase() as 'waiting' | 'active' | 'delayed' | 'completed' | 'failed'
                const val = stats?.agents[key] ?? '—'
                const variant = label === 'Active' && (stats?.agents.active ?? 0) > 0 ? 'success'
                  : label === 'Waiting' && (stats?.agents.waiting ?? 0) > 0 ? 'warning'
                  : label === 'Failed' && (stats?.agents.failed ?? 0) > 0 ? 'danger' : 'default'
                return (
                  <div key={label} className="relative">
                    <StatCard label={label} value={val} variant={variant} />
                    <div className="absolute right-3 top-3"><Tooltip text={STATE_DESCRIPTIONS[label] ?? ''} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Recent Jobs</h2>
          <div className="rounded-xl border border-white/10 bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                  <th className="px-5 py-3 font-medium">Job</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                  <th className="px-5 py-3 font-medium">Finished</th>
                </tr>
              </thead>
              <tbody>
                {jobs.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-xs text-zinc-600">No recent jobs</td></tr>
                ) : jobs.map((job) => (
                  <tr key={job.id} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                    <td className="px-5 py-3 font-mono text-xs text-zinc-500">{job.id?.slice(0, 10) ?? '—'}</td>
                    <td className="px-5 py-3 text-zinc-300">{job.agentType ?? job.name}</td>
                    <td className="px-5 py-3"><StatusBadge status={job.status} /></td>
                    <td className="px-5 py-3 text-xs text-zinc-500">{timeAgo(job.processedOn)}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {job.failedReason
                        ? <span className="text-red-400" title={job.failedReason}>Error ⚠</span>
                        : timeAgo(job.finishedOn)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
