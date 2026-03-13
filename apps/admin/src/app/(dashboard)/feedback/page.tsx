'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type FeedbackItem, ApiError } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

type AppFilter = 'all' | 'rostermind' | 'directory'

const APP_LABELS: Record<string, { label: string; color: string }> = {
  rostermind: { label: 'RosterMind', color: 'bg-indigo-500/20 text-indigo-400' },
  directory:  { label: 'Directory',  color: 'bg-red-500/20 text-red-400' },
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function ExpandableMessage({ message }: { message: string }) {
  const [expanded, setExpanded] = useState(false)
  const truncated = message.length > 200
  const display = expanded || !truncated ? message : message.slice(0, 200) + '…'

  return (
    <div>
      <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{display}</p>
      {truncated && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Show more</>}
        </button>
      )}
    </div>
  )
}

export default function FeedbackPage() {
  const router = useRouter()
  const [appFilter, setAppFilter] = useState<AppFilter>('all')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<{ items: FeedbackItem[]; total: number; rostermindCount: number; directoryCount: number; pages: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (filter: AppFilter, p: number) => {
    setLoading(true)
    try {
      const res = await api.getFeedback(filter, p)
      setData(res)
    } catch (err) {
      if (err instanceof ApiError && err.isUnauthorized) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { void load(appFilter, page) }, [load, appFilter, page])

  function handleTabChange(tab: AppFilter) {
    setAppFilter(tab)
    setPage(1)
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare size={18} className="text-zinc-400" />
          <h1 className="text-2xl font-bold text-white">Feedback</h1>
        </div>
        <p className="text-sm text-zinc-500">User-submitted improvement suggestions from RosterMind and Directory.</p>
      </div>

      {/* Count cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Total</p>
          <p className="mt-2 text-2xl font-bold text-white">
            {data ? (data.rostermindCount + data.directoryCount).toLocaleString() : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">RosterMind</p>
          <p className="mt-2 text-2xl font-bold text-white">{data ? data.rostermindCount.toLocaleString() : '—'}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Directory</p>
          <p className="mt-2 text-2xl font-bold text-white">{data ? data.directoryCount.toLocaleString() : '—'}</p>
        </div>
      </div>

      {/* Tabs + table */}
      <div className="rounded-xl border border-white/10 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex gap-1">
            {(['all', 'rostermind', 'directory'] as AppFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${appFilter === tab ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                {tab === 'all' ? 'All' : APP_LABELS[tab]?.label ?? tab}
              </button>
            ))}
          </div>
          {data && (
            <p className="text-xs text-zinc-600">{data.total} total</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs text-zinc-500">
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">App</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Page</th>
                <th className="px-5 py-3 font-medium w-96">Message</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-500">Loading...</td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-500">No feedback yet</td>
                </tr>
              ) : data.items.map((item) => (
                <tr key={item.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 align-top">
                  <td className="px-5 py-4 text-xs text-zinc-500 whitespace-nowrap">{timeAgo(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${APP_LABELS[item.app]?.color ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {APP_LABELS[item.app]?.label ?? item.app}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {item.userEmail ? (
                      <div>
                        <p className="text-xs text-white truncate max-w-[140px]">{item.userEmail}</p>
                        {item.userTier && (
                          <span className={`mt-0.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${item.userTier === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'}`}>
                            {item.userTier}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">Anonymous</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {item.pageUrl ? (
                      <span className="text-[10px] text-zinc-600 font-mono truncate block max-w-[120px]" title={item.pageUrl}>
                        {new URL(item.pageUrl).pathname}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <ExpandableMessage message={item.message} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-zinc-500">Page {page} of {data.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
