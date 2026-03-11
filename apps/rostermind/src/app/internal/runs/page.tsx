'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface Run {
  id: string
  agentType: string
  status: string
  tokensUsed: number | null
  durationMs: number | null
  rating: string | null
  errorMessage: string | null
  createdAt: string
  user: { email: string; tier: string }
}

export default function InternalRunsPage() {
  const [runs, setRuns] = useState<Run[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [agentTypeFilter, setAgentTypeFilter] = useState('')
  const [autoRefresh, setAutoRefresh] = useState(true)

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true)
    const secret = localStorage.getItem('admin_secret') ?? ''
    try {
      const data = await api.getInternalRuns(
        secret,
        1,
        statusFilter || undefined,
        agentTypeFilter || undefined,
      ) as { runs: Run[]; total: number }
      setRuns(data.runs)
      setTotal(data.total)
    } catch {
      // handle
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [statusFilter, agentTypeFilter])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      void load(false)
    }, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, statusFilter, agentTypeFilter])

  const statusColors: Record<string, string> = {
    done: 'text-emerald-400',
    running: 'text-blue-400',
    queued: 'text-yellow-400',
    failed: 'text-red-400',
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Agent Runs ({total})</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-white/20 bg-zinc-800"
            />
            Auto-refresh (5s)
          </label>
          <button
            onClick={() => load()}
            disabled={loading}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All statuses</option>
          <option value="done">Done</option>
          <option value="failed">Failed</option>
          <option value="running">Running</option>
          <option value="queued">Queued</option>
        </select>
        <select
          value={agentTypeFilter}
          onChange={(e) => setAgentTypeFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All agent types</option>
          <option value="team_eval">team_eval</option>
          <option value="injury_watch">injury_watch</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="px-4 py-3 font-medium">User</th>
              <th className="px-4 py-3 font-medium">Agent</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Tokens</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-400">Loading...</td></tr>
            ) : runs.map((r) => (
              <tr key={r.id} className="text-sm">
                <td className="px-4 py-3 text-zinc-300">{r.user.email}</td>
                <td className="px-4 py-3 capitalize text-white">{r.agentType.replace('_', ' ')}</td>
                <td className={`px-4 py-3 font-medium ${statusColors[r.status] ?? 'text-zinc-400'}`}>
                  {r.status}
                </td>
                <td className="px-4 py-3 text-zinc-400">{r.tokensUsed ?? '-'}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {r.durationMs ? `${(r.durationMs / 1000).toFixed(1)}s` : '-'}
                </td>
                <td className="px-4 py-3">{r.rating === 'up' ? '👍' : r.rating === 'down' ? '👎' : '-'}</td>
                <td className="px-4 py-3 text-zinc-500">{formatRelativeTime(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
