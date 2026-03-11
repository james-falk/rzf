'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { api, type RunStats, type AgentRun, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { Badge } from '@/components/ui/Badge'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { formatDate, formatDuration, formatRelativeTime } from '@/lib/utils'
import { RefreshCw, ChevronDown, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

const STATUS_OPTIONS = ['', 'done', 'failed', 'running', 'queued']
const AGENT_OPTIONS = ['', 'team_eval', 'injury_watch']

export default function RunsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<RunStats | null>(null)
  const [runs, setRuns] = useState<AgentRun[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [agentFilter, setAgentFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadStats = useCallback(async () => {
    try {
      const s = await api.getRunStats()
      setStats(s)
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    }
  }, [router])

  const loadRuns = useCallback(async (p: number, silent = false) => {
    if (!silent) setTableLoading(true)
    try {
      const data = await api.getRuns(p, statusFilter || undefined, agentFilter || undefined)
      setRuns(data.runs)
      setTotal(data.total)
      setPages(data.pages)
    } finally {
      if (!silent) setTableLoading(false)
    }
  }, [statusFilter, agentFilter])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([loadStats(), loadRuns(page)])
    setLoading(false)
  }, [loadStats, loadRuns, page])

  useEffect(() => { void loadAll() }, [loadAll])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, agentFilter])

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        void loadStats()
        void loadRuns(page, true)
      }, 5000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [autoRefresh, loadStats, loadRuns, page])

  const dailyData = stats?.daily.map((d) => ({ ...d, date: formatDate(d.date) })) ?? []

  const agentBarData = stats?.byAgentType.map((a) => ({
    name: a.agentType.replace('_', ' '),
    done: a.done,
    failed: a.failed,
  })) ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Agent Runs</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={() => void loadAll()}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI stat cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total (30d)" value={stats?.summary.totalLast30Days ?? '—'} />
        <StatCard label="Today" value={stats?.summary.today ?? '—'} />
        <StatCard label="This Week" value={stats?.summary.week ?? '—'} />
        <StatCard
          label="Success Rate"
          value={stats ? `${stats.summary.successRate}%` : '—'}
          variant={
            (stats?.summary.successRate ?? 100) >= 90 ? 'success'
            : (stats?.summary.successRate ?? 100) >= 70 ? 'warning'
            : 'danger'
          }
        />
        <StatCard
          label="Avg Duration"
          value={stats ? formatDuration(stats.summary.avgDurationMs) : '—'}
        />
        <StatCard
          label="Avg Tokens"
          value={stats?.summary.avgTokens ?? '—'}
          variant={(stats?.summary.failed ?? 0) > 0 ? 'danger' : 'default'}
        />
      </div>

      {/* Charts row */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Runs Over Time" sub="Last 30 days" className="lg:col-span-2">
          <AreaChart
            data={dailyData}
            xKey="date"
            series={[
              { key: 'done', color: '#10b981', label: 'Done' },
              { key: 'failed', color: '#ef4444', label: 'Failed' },
              { key: 'queued', color: '#f59e0b', label: 'Queued' },
            ]}
            height={220}
          />
        </ChartCard>

        <ChartCard title="By Agent Type" sub="All time">
          <BarChart
            data={agentBarData}
            xKey="name"
            series={[
              { key: 'done', color: '#10b981', label: 'Done' },
              { key: 'failed', color: '#ef4444', label: 'Failed' },
            ]}
            height={220}
          />
        </ChartCard>
      </div>

      {/* Token usage chart */}
      <ChartCard title="Token Usage / Day" sub="Last 30 days" className="mb-6">
        <BarChart
          data={dailyData}
          xKey="date"
          series={[{ key: 'tokens', color: '#8b5cf6', label: 'Tokens' }]}
          height={180}
        />
      </ChartCard>

      {/* Run table */}
      <div className="rounded-xl border border-white/10 bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <p className="text-sm font-semibold text-white">Run Log ({total})</p>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-xs text-white"
            >
              {AGENT_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All agents'}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="w-6 px-4 py-2" />
              <th className="px-4 py-2 font-medium">User</th>
              <th className="px-4 py-2 font-medium">Agent</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Tokens</th>
              <th className="px-4 py-2 font-medium">Duration</th>
              <th className="px-4 py-2 font-medium">Rating</th>
              <th className="px-4 py-2 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-400">Loading...</td></tr>
            ) : runs.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-zinc-500">No runs found</td></tr>
            ) : runs.map((r) => (
              <>
                <tr
                  key={r.id}
                  className="cursor-pointer text-sm hover:bg-white/[0.02]"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {expandedId === r.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{r.user.email}</td>
                  <td className="px-4 py-3 capitalize text-white">{r.agentType.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <Badge variant={r.status as 'done' | 'failed' | 'running' | 'queued'}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-400">{r.tokensUsed ?? '-'}</td>
                  <td className="px-4 py-3 tabular-nums text-zinc-400">{formatDuration(r.durationMs)}</td>
                  <td className="px-4 py-3">{r.rating === 'up' ? '👍' : r.rating === 'down' ? '👎' : '—'}</td>
                  <td className="px-4 py-3 text-zinc-500">{formatRelativeTime(r.createdAt)}</td>
                </tr>
                {expandedId === r.id && (
                  <tr key={`${r.id}-detail`}>
                    <td colSpan={8} className="border-t border-white/5 bg-zinc-950/50 px-6 py-4">
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-zinc-500">Input</p>
                          <pre className="overflow-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300 max-h-48">
                            {JSON.stringify(r.inputJson, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase text-zinc-500">
                            {r.errorMessage ? 'Error' : 'Output Preview'}
                          </p>
                          <pre className="overflow-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-300 max-h-48">
                            {r.errorMessage
                              ? r.errorMessage
                              : r.outputJson
                                ? JSON.stringify(r.outputJson, null, 2).slice(0, 2000)
                                : 'No output yet'}
                          </pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
            <p className="text-xs text-zinc-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="rounded border border-white/10 px-3 py-1 text-xs text-zinc-300 hover:bg-white/5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
