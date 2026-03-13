'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type TokenUsageRow, type AgentUsageRow, ApiError } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { DollarSign, Zap, Users, RefreshCw } from 'lucide-react'

const AGENT_LABELS: Record<string, string> = {
  team_eval: 'Team Analysis',
  injury_watch: 'Injury Watch',
  waiver: 'Waiver Wire',
  lineup: 'Start / Sit',
  trade_analysis: 'Trade Advice',
  player_scout: 'Player Scout',
}

type Range = '7d' | '30d' | '90d'

function getRangeDates(range: Range): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  if (range === '7d') start.setDate(start.getDate() - 7)
  else if (range === '30d') start.setDate(start.getDate() - 30)
  else start.setDate(start.getDate() - 90)
  return { startDate: start.toISOString(), endDate: end.toISOString() }
}

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtTokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function TokenUsagePage() {
  const router = useRouter()
  const [range, setRange] = useState<Range>('30d')
  const [data, setData] = useState<{ rows: TokenUsageRow[]; byAgent: AgentUsageRow[]; totalTokens: number; totalCostUsd: number; since: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'tokens' | 'cost' | 'runs'>('tokens')

  const load = useCallback(async (r: Range) => {
    setLoading(true)
    try {
      const { startDate, endDate } = getRangeDates(r)
      const res = await api.getTokenUsage(startDate, endDate)
      setData(res)
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void load(range) }, [load, range])

  const sortKey = sort === 'cost' ? 'costUsd' : sort === 'runs' ? 'runs' : 'tokens'
  const sorted = data
    ? [...data.rows].sort((a, b) => b[sortKey] - a[sortKey])
    : []

  const chartData = sorted.slice(0, 10).map((r) => ({
    name: r.email.split('@')[0] ?? r.userId.slice(0, 8),
    tokens: r.tokens,
    cost: r.costUsd,
  }))

  const agentChartData = (data?.byAgent ?? []).map((r) => ({
    name: AGENT_LABELS[r.agentType] ?? r.agentType,
    cost: r.costUsd,
    tokens: r.tokensUsed,
    runs: r.runs,
    avg: r.avgTokensPerRun,
  }))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Token Usage</h1>
          {data && (
            <p className="mt-1 text-xs text-zinc-500">
              Since {new Date(data.since).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="flex rounded-lg border border-white/10 p-0.5">
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${range === r ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {r === '7d' ? 'Last 7d' : r === '30d' ? 'Last 30d' : 'Last 90d'}
              </button>
            ))}
          </div>
          <button
            onClick={() => void load(range)}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-400">
            <Zap size={15} />
            <span className="text-xs font-medium uppercase tracking-wider">Total Tokens</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data ? fmtTokens(data.totalTokens) : '—'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-400">
            <DollarSign size={15} />
            <span className="text-xs font-medium uppercase tracking-wider">Est. Cost</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data ? `$${fmt(data.totalCostUsd, 4)}` : '—'}</p>
          <p className="mt-0.5 text-xs text-zinc-600">Blended Haiku/Sonnet rate</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <div className="flex items-center gap-2 text-zinc-400">
            <Users size={15} />
            <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{data ? data.rows.length : '—'}</p>
        </div>
      </div>

      {/* Per-agent cost section */}
      <div className="mb-6 rounded-xl border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Cost by Agent</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Estimated spend per agent type based on model tier and token usage</p>
        </div>

        {agentChartData.length > 0 ? (
          <>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={agentChartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v: number) => `$${fmt(v, 4)}`} tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} width={60} />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number) => [`$${fmt(v, 4)}`, 'Est. Cost']}
                  />
                  <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                    {agentChartData.map((row, i) => (
                      <Cell key={i} fill={row.avg > 4000 ? '#f97316' : i === 0 ? '#ef4444' : '#3f3f46'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t border-white/5 text-left text-xs text-zinc-500">
                    <th className="px-5 py-3 font-medium">Agent</th>
                    <th className="px-5 py-3 font-medium text-right">Runs</th>
                    <th className="px-5 py-3 font-medium text-right">Total Tokens</th>
                    <th className="px-5 py-3 font-medium text-right">Avg Tokens / Run</th>
                    <th className="px-5 py-3 font-medium text-right">Est. Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.byAgent ?? []).map((row) => (
                    <tr key={row.agentType} className="border-t border-white/5 hover:bg-white/2">
                      <td className="px-5 py-3 font-medium text-white">
                        {AGENT_LABELS[row.agentType] ?? row.agentType}
                        <span className="ml-2 font-mono text-xs text-zinc-600">{row.agentType}</span>
                      </td>
                      <td className="px-5 py-3 text-right text-zinc-300">{row.runs.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right text-zinc-300">{fmtTokens(row.tokensUsed)}</td>
                      <td className={`px-5 py-3 text-right font-mono ${row.avgTokensPerRun > 4000 ? 'text-orange-400' : 'text-zinc-300'}`}>
                        {fmtTokens(row.avgTokensPerRun)}
                        {row.avgTokensPerRun > 4000 && <span className="ml-1 text-[10px]">⚠</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-zinc-300">
                        ${fmt(row.costUsd, 4)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-zinc-500">
            {loading ? 'Loading...' : 'No agent run data for this period'}
          </p>
        )}
      </div>

      {/* Top 10 users bar chart */}
      {chartData.length > 0 && (
        <div className="mb-6 rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Top 10 Users by Token Consumption</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtTokens} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={45} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [fmtTokens(v), 'Tokens']}
              />
              <Bar dataKey="tokens" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#ef4444' : i < 3 ? '#f97316' : '#3f3f46'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Per-user table */}
      <div className="rounded-xl border border-white/10 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Per-User Breakdown</h2>
          <div className="flex gap-1">
            {(['tokens', 'cost', 'runs'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition ${sort === s ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {s === 'tokens' ? 'Tokens' : s === 'cost' ? 'Cost' : 'Runs'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Tier</th>
                <th className="px-5 py-3 font-medium text-right">Runs</th>
                <th className="px-5 py-3 font-medium text-right">Tokens</th>
                <th className="px-5 py-3 font-medium text-right">Est. Cost</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">Loading...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-zinc-500">No data yet</td>
                </tr>
              ) : sorted.map((row) => (
                <tr key={row.userId} className="border-b border-white/5 last:border-0 hover:bg-white/2">
                  <td className="px-5 py-3">
                    <div>
                      <p className="font-medium text-white">{row.email}</p>
                      <p className="text-xs text-zinc-600 font-mono">{row.userId.slice(0, 12)}…</p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.tier === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                      {row.tier}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-zinc-300">{row.runs.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-zinc-300">{fmtTokens(row.tokens)}</td>
                  <td className={`px-5 py-3 text-right font-mono ${row.costUsd > 0.1 ? 'text-orange-400' : 'text-zinc-300'}`}>
                    ${fmt(row.costUsd, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
