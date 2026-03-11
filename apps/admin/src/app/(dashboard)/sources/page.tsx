'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type SourceSummary, type SourceItem, ApiError } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/lib/utils'
import { RefreshCw, ChevronDown, ChevronRight, Play, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

const INGESTION_JOBS = [
  { type: 'content_refresh', label: 'Content Refresh', desc: 'Fetch all active RSS feeds' },
  { type: 'player_refresh', label: 'Player Refresh', desc: 'Sync all NFL players from Sleeper' },
  { type: 'trending_refresh', label: 'Trending Refresh', desc: 'Update trending adds/drops' },
  { type: 'rankings_refresh', label: 'Rankings Refresh', desc: 'Update player rankings' },
  { type: 'credits_refill', label: 'Credits Refill', desc: 'Reset paid users to 50 credits' },
]

export default function SourcesPage() {
  const router = useRouter()
  const [sources, setSources] = useState<SourceSummary[]>([])
  const [summary, setSummary] = useState<{ total: number; active: number; stale: number; totalItems: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sourceItems, setSourceItems] = useState<Record<string, SourceItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState<string | null>(null)
  const [triggering, setTriggering] = useState<string | null>(null)
  const [triggerResults, setTriggerResults] = useState<Record<string, { success: boolean; jobId?: string; error?: string }>>({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getSources()
      setSources(data.sources)
      setSummary(data.summary)
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void load() }, [load])

  async function toggleExpand(id: string) {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!sourceItems[id]) {
      setItemsLoading(id)
      try {
        const data = await api.getSourceItems(id)
        setSourceItems((prev) => ({ ...prev, [id]: data.items }))
      } finally {
        setItemsLoading(null)
      }
    }
  }

  async function trigger(type: string) {
    setTriggering(type)
    try {
      const result = await api.triggerIngestion(type)
      setTriggerResults((prev) => ({ ...prev, [type]: { success: true, jobId: result.jobId } }))
    } catch (err) {
      setTriggerResults((prev) => ({
        ...prev,
        [type]: { success: false, error: err instanceof Error ? err.message : 'Failed' },
      }))
    } finally {
      setTriggering(null)
    }
  }

  const sortedSources = [...sources].sort((a, b) => {
    const order = { stale: 0, healthy: 1, inactive: 2 }
    return (order[a.health] ?? 3) - (order[b.health] ?? 3)
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Content Sources</h1>
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
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Sources" value={summary?.total ?? '—'} />
        <StatCard label="Active" value={summary?.active ?? '—'} variant={summary && summary.active > 0 ? 'success' : 'default'} />
        <StatCard
          label="Stale"
          value={summary?.stale ?? '—'}
          variant={(summary?.stale ?? 0) > 0 ? 'warning' : 'default'}
          sub="Last fetch > 2× refresh interval"
        />
        <StatCard label="Total Items" value={summary?.totalItems ?? '—'} />
      </div>

      {/* Source health table */}
      <div className="mb-8 rounded-xl border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Source Health</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="w-6 px-4 py-2" />
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium">Platform</th>
              <th className="px-4 py-2 font-medium">Health</th>
              <th className="px-4 py-2 font-medium">Last Fetched</th>
              <th className="px-4 py-2 font-medium">Items</th>
              <th className="px-4 py-2 font-medium">Interval</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-400">Loading...</td></tr>
            ) : sortedSources.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-zinc-500">No sources configured yet</td></tr>
            ) : sortedSources.map((s) => (
              <>
                <tr
                  key={s.id}
                  className="cursor-pointer text-sm hover:bg-white/[0.02]"
                  onClick={() => void toggleExpand(s.id)}
                >
                  <td className="px-4 py-3 text-zinc-500">
                    {expandedId === s.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {s.health === 'stale' && <AlertTriangle size={13} className="shrink-0 text-yellow-400" />}
                      <span className="font-medium text-white">{s.name}</span>
                    </div>
                    <p className="mt-0.5 max-w-xs truncate text-xs text-zinc-500">{s.feedUrl}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="default">{s.platform}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.health}>{s.health}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {s.lastFetchedAt ? formatRelativeTime(s.lastFetchedAt) : 'Never'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-zinc-300">{s.itemCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-zinc-400">{s.refreshIntervalMins}m</td>
                </tr>
                {expandedId === s.id && (
                  <tr key={`${s.id}-detail`}>
                    <td colSpan={7} className="border-t border-white/5 bg-zinc-950/50 px-6 py-4">
                      <p className="mb-3 text-xs font-semibold uppercase text-zinc-500">Recent Items</p>
                      {itemsLoading === s.id ? (
                        <p className="text-sm text-zinc-400">Loading...</p>
                      ) : (sourceItems[s.id]?.length ?? 0) === 0 ? (
                        <p className="text-sm text-zinc-500">No items yet</p>
                      ) : (
                        <div className="space-y-2">
                          {sourceItems[s.id]?.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-4 rounded-lg bg-zinc-900 px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm text-white hover:text-red-400"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {item.title}
                                </a>
                                <div className="mt-1 flex flex-wrap gap-2">
                                  <span className="text-xs text-zinc-500">{item.contentType}</span>
                                  <span className="text-xs text-zinc-500">{item._count.playerMentions} player mentions</span>
                                  {item.topics.slice(0, 3).map((t) => (
                                    <span key={t} className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400">{t}</span>
                                  ))}
                                </div>
                              </div>
                              <span className="shrink-0 text-xs text-zinc-500">{formatRelativeTime(item.fetchedAt)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Manual ingestion triggers */}
      <div className="rounded-xl border border-white/10 bg-zinc-900">
        <div className="border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">Manual Triggers</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Enqueue ingestion jobs immediately, bypassing the scheduler</p>
        </div>
        <div className="divide-y divide-white/5">
          {INGESTION_JOBS.map((job) => {
            const result = triggerResults[job.type]
            return (
              <div key={job.type} className="flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{job.label}</p>
                  <p className="text-xs text-zinc-500">{job.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  {result && (
                    <span className={`text-xs ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.success ? `Queued (${result.jobId?.slice(0, 8)}...)` : result.error}
                    </span>
                  )}
                  <button
                    onClick={() => void trigger(job.type)}
                    disabled={triggering === job.type}
                    className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
                  >
                    <Play size={11} />
                    {triggering === job.type ? 'Queuing...' : 'Trigger'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
