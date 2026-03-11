'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type ContentStats, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { ChartCard } from '@/components/ui/ChartCard'
import { AreaChart } from '@/components/charts/AreaChart'
import { BarChart } from '@/components/charts/BarChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { formatDate, platformColor } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

const CONTENT_TYPE_COLORS: Record<string, string> = {
  article: '#3b82f6',
  video: '#ef4444',
  social_post: '#8b5cf6',
  podcast_episode: '#f59e0b',
  vlog: '#ec4899',
  stat_update: '#10b981',
}

export default function ContentPage() {
  const router = useRouter()
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getContentStats()
      setStats(data)
      setLastRefreshed(new Date())
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void load() }, [load])

  const dailyData = stats?.daily.map((d) => ({ ...d, date: formatDate(String(d.date)) })) ?? []

  const contentTypeSeries = [...new Set(
    dailyData.flatMap((d) => Object.keys(d).filter((k) => k !== 'date'))
  )].map((type) => ({
    key: type,
    color: CONTENT_TYPE_COLORS[type] ?? '#6b7280',
    label: type.replace(/_/g, ' '),
  }))

  const platformDonutData = stats?.byPlatform.map((p) => ({
    name: p.platform,
    value: p.count,
    color: platformColor(p.platform),
  })) ?? []

  const topicBarData = stats?.topics.slice(0, 15).map((t) => ({
    name: t.topic,
    count: t.count,
  })) ?? []

  const playerBarData = stats?.topPlayers.slice(0, 15).map((p) => ({
    name: p.name,
    mentions: p.mentions,
    label: p.team ? `${p.name} (${p.position} · ${p.team})` : p.name,
  })) ?? []

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Content Analytics</h1>
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

      {/* KPI cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Items" value={stats?.summary.totalItems ?? '—'} />
        <StatCard label="Items This Week" value={stats?.summary.itemsThisWeek ?? '—'} />
        <StatCard label="Unique Players Mentioned" value={stats?.summary.uniquePlayersMentioned ?? '—'} />
        <StatCard label="Active Sources" value={stats?.summary.activeSources ?? '—'} />
        <StatCard label="Avg Items / Source" value={stats?.summary.avgItemsPerSource ?? '—'} />
        <StatCard label="Total Sources" value={stats?.summary.totalSources ?? '—'} />
      </div>

      {/* Items over time + platform donut */}
      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ChartCard title="Items Ingested / Day" sub="Last 30 days — by content type" className="lg:col-span-2">
          {loading ? (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">Loading...</div>
          ) : dailyData.length > 0 && contentTypeSeries.length > 0 ? (
            <AreaChart
              data={dailyData}
              xKey="date"
              series={contentTypeSeries}
              height={220}
              stacked
            />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">No data yet</div>
          )}
        </ChartCard>

        <ChartCard title="By Platform" sub="Last 30 days">
          {loading ? (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">Loading...</div>
          ) : platformDonutData.length > 0 ? (
            <DonutChart data={platformDonutData} height={220} />
          ) : (
            <div className="flex h-56 items-center justify-center text-sm text-zinc-500">No data yet</div>
          )}
        </ChartCard>
      </div>

      {/* Topic distribution + top players */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Topic Distribution" sub="Top 15 topics from last 30 days">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Loading...</div>
          ) : topicBarData.length > 0 ? (
            <BarChart
              data={topicBarData}
              xKey="name"
              series={[{ key: 'count', color: '#3b82f6', label: 'Items' }]}
              layout="vertical"
              height={topicBarData.length * 28 + 24}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">No topic data yet</div>
          )}
        </ChartCard>

        <ChartCard title="Top Mentioned Players" sub="Most referenced players in content">
          {loading ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">Loading...</div>
          ) : playerBarData.length > 0 ? (
            <BarChart
              data={playerBarData}
              xKey="name"
              series={[{ key: 'mentions', color: '#10b981', label: 'Mentions' }]}
              layout="vertical"
              height={playerBarData.length * 28 + 24}
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-500">No mention data yet</div>
          )}
        </ChartCard>
      </div>

      {/* Content type breakdown table */}
      {stats && stats.byContentType.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Items by Content Type</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Total Items</th>
                <th className="px-4 py-2 font-medium">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats.byContentType.map((row) => {
                const share = stats.summary.totalItems > 0
                  ? Math.round((row.count / stats.summary.totalItems) * 100)
                  : 0
                return (
                  <tr key={row.type} className="text-sm">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: CONTENT_TYPE_COLORS[row.type] ?? '#6b7280' }}
                        />
                        <span className="capitalize text-white">{row.type.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-300">{row.count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-800">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${share}%`, backgroundColor: CONTENT_TYPE_COLORS[row.type] ?? '#6b7280' }}
                          />
                        </div>
                        <span className="text-xs tabular-nums text-zinc-400">{share}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
