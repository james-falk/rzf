'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type Overview, type RunStats, type QueueStats, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { AreaChart } from '@/components/charts/AreaChart'
import { formatDate } from '@/lib/utils'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OverviewPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [runStats, setRunStats] = useState<RunStats | null>(null)
  const [queue, setQueue] = useState<QueueStats | null>(null)
  const [health, setHealth] = useState<'ok' | 'down' | 'unknown'>('unknown')
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ov, rs, q, h] = await Promise.allSettled([
        api.getOverview(),
        api.getRunStats(),
        api.getQueueStats(),
        api.pingHealth(),
      ])
      if (ov.status === 'fulfilled') setOverview(ov.value)
      if (rs.status === 'fulfilled') setRunStats(rs.value)
      if (q.status === 'fulfilled') setQueue(q.value)
      setHealth(h.status === 'fulfilled' && h.value.status === 'ok' ? 'ok' : 'down')
      setLastRefreshed(new Date())

      if (ov.status === 'rejected' && ov.reason instanceof ApiError && ov.reason.isUnauthorized) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void load() }, [load])

  const mini7Days = runStats?.daily.slice(-7).map((d) => ({ ...d, date: formatDate(d.date) })) ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          {lastRefreshed && <p className="mt-1 text-xs text-zinc-500">Updated {lastRefreshed.toLocaleTimeString()}</p>}
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* System health row */}
      <div className="mb-6 flex flex-wrap gap-3">
        <HealthPill label="API" status={health} />
        <HealthPill
          label="Agent Queue"
          status={queue?.agents.error ? 'down' : queue ? 'ok' : 'unknown'}
          detail={queue && !queue.agents.error ? `${queue.agents.waiting} waiting · ${queue.agents.active} active` : undefined}
        />
        <HealthPill
          label="Ingestion Queue"
          status={queue?.ingestion.error ? 'down' : queue ? 'ok' : 'unknown'}
          detail={queue && !queue.ingestion.error ? `${queue.ingestion.waiting} waiting · ${queue.ingestion.active} active` : undefined}
        />
      </div>

      {/* User stats */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Users</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={overview?.users.total ?? '—'} />
        <StatCard label="New Today" value={overview?.users.today ?? '—'} />
        <StatCard label="New This Week" value={overview?.users.week ?? '—'} />
        <StatCard label="Free" value={overview?.users.free ?? '—'} />
        <StatCard
          label="Paid"
          value={overview?.users.paid ?? '—'}
          variant={(overview?.users.paid ?? 0) > 0 ? 'success' : 'default'}
        />
      </div>

      {/* Run stats */}
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Agent Runs (30 days)</h2>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Runs" value={runStats?.summary.totalLast30Days ?? '—'} />
        <StatCard label="Today" value={runStats?.summary.today ?? '—'} />
        <StatCard
          label="Success Rate"
          value={runStats ? `${runStats.summary.successRate}%` : '—'}
          variant={
            (runStats?.summary.successRate ?? 100) >= 90 ? 'success'
            : (runStats?.summary.successRate ?? 100) >= 70 ? 'warning'
            : 'danger'
          }
        />
        <StatCard
          label="Failed"
          value={runStats?.summary.failed ?? '—'}
          variant={(runStats?.summary.failed ?? 0) > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Mini charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Runs / Day" sub="Last 7 days">
          <AreaChart
            data={mini7Days}
            xKey="date"
            series={[
              { key: 'done', color: '#10b981', label: 'Done' },
              { key: 'failed', color: '#ef4444', label: 'Failed' },
            ]}
            height={180}
          />
        </ChartCard>

        <ChartCard title="Queue Depth" sub="Current snapshot">
          <div className="grid grid-cols-2 gap-3 pt-2">
            {queue && !queue.agents.error && (
              <>
                <QueueRow label="Agents waiting" value={queue.agents.waiting} color="text-yellow-400" />
                <QueueRow label="Agents active" value={queue.agents.active} color="text-blue-400" />
                <QueueRow label="Agents completed" value={queue.agents.completed} color="text-emerald-400" />
                <QueueRow label="Agents failed" value={queue.agents.failed} color={queue.agents.failed > 0 ? 'text-red-400' : 'text-zinc-400'} />
                <QueueRow label="Ingestion waiting" value={queue.ingestion.waiting} color="text-yellow-400" />
                <QueueRow label="Ingestion active" value={queue.ingestion.active} color="text-blue-400" />
              </>
            )}
            {(!queue || queue.agents.error) && (
              <p className="col-span-2 text-sm text-zinc-500">Queue data unavailable</p>
            )}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

function HealthPill({ label, status, detail }: { label: string; status: 'ok' | 'down' | 'unknown'; detail?: string }) {
  const cfg = {
    ok: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'Healthy' },
    down: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', text: 'Down' },
    unknown: { icon: AlertCircle, color: 'text-zinc-400', bg: 'bg-zinc-800 border-white/10', text: 'Unknown' },
  }[status]
  const Icon = cfg.icon
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${cfg.bg}`}>
      <Icon size={13} className={cfg.color} />
      <span className="font-medium text-white">{label}</span>
      <span className={cfg.color}>{detail ?? cfg.text}</span>
    </div>
  )
}

function QueueRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
      <span className="text-xs text-zinc-400">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${color}`}>{value}</span>
    </div>
  )
}
