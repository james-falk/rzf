'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface RunSummary {
  id: string
  agentType: string
  status: string
  tokensUsed: number | null
  durationMs: number | null
  rating: string | null
  createdAt: string
}

const STATUS_STYLE: Record<string, string> = {
  done: 'text-emerald-400',
  failed: 'text-indigo-400',
  running: 'text-yellow-400',
  queued: 'text-zinc-400',
}

export default function HistoryPage() {
  const { getToken } = useAuth()
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.getRunHistory(token)
        setRuns(data.recentRuns)
      } catch {
        // silent — empty state handles it
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Report History</h1>
        <p className="mt-1 text-zinc-400">Your last 20 agent analyses</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900">
        {loading ? (
          <div className="p-8 text-center text-sm text-zinc-400">Loading...</div>
        ) : runs.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-zinc-400">No reports yet.</p>
            <Link
              href="/dashboard/team-eval"
              className="mt-3 inline-block text-sm text-indigo-400 hover:text-indigo-300"
            >
              Run your first analysis →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium capitalize text-white">
                    {run.agentType.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-zinc-500">{formatRelativeTime(run.createdAt)}</p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="hidden sm:block text-zinc-500">
                    {run.tokensUsed != null ? `${run.tokensUsed} tok` : '—'}
                  </span>
                  <span className="hidden sm:block text-zinc-500">
                    {run.durationMs != null ? `${(run.durationMs / 1000).toFixed(1)}s` : '—'}
                  </span>
                  {run.rating && (
                    <span>{run.rating === 'up' ? '👍' : '👎'}</span>
                  )}
                  <span className={STATUS_STYLE[run.status] ?? 'text-zinc-400'}>
                    {run.status}
                  </span>
                  {run.status === 'done' ? (
                    <Link
                      href={`/dashboard/history/${run.id}`}
                      className="rounded-lg border border-white/10 px-3 py-2.5 text-zinc-300 transition hover:border-indigo-500/50 hover:text-indigo-300"
                    >
                      View →
                    </Link>
                  ) : (
                    <span className="w-14" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
