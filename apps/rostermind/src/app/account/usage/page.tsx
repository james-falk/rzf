'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface UsageData {
  runCredits: number
  tier: string
  monthlyTokensUsed: number
  monthlyRunsUsed: number
  recentRuns: Array<{
    id: string
    agentType: string
    status: string
    tokensUsed: number | null
    durationMs: number | null
    rating: string | null
    createdAt: string
  }>
}

export default function UsagePage() {
  const { getToken } = useAuth()
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const usage = await api.getUsage(token)
        setData(usage as UsageData)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Usage & Credits</h1>
      <p className="mb-8 text-zinc-400">Track your agent runs and token usage</p>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading...</div>
      ) : !data ? (
        <div className="text-sm text-indigo-400">Failed to load usage data</div>
      ) : (
        <>
          {/* Credits card */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
              <p className="mb-1 text-xs text-zinc-400">Credits Remaining</p>
              <p className="text-4xl font-bold text-white">{data.runCredits}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {data.tier === 'free' ? 'Lifetime (free tier)' : '50/month (Pro)'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
              <p className="mb-1 text-xs text-zinc-400">Runs This Month</p>
              <p className="text-4xl font-bold text-white">{data.monthlyRunsUsed}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
              <p className="mb-1 text-xs text-zinc-400">Tokens This Month</p>
              <p className="text-4xl font-bold text-white">
                {(data.monthlyTokensUsed / 1000).toFixed(1)}k
              </p>
            </div>
          </div>

          {/* Upgrade CTA for free users */}
          {data.tier === 'free' && data.runCredits === 0 && (
            <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-5">
              <p className="mb-3 text-sm font-medium text-yellow-300">
                You&apos;ve used all your free analyses
              </p>
              <a
                href="/account/billing"
                className="inline-block rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-zinc-900"
              >
                Upgrade to Pro — $20/month
              </a>
            </div>
          )}

          {/* Recent runs */}
          <div className="rounded-xl border border-white/10 bg-zinc-900">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">Recent Runs</h2>
            </div>
            {data.recentRuns.length === 0 ? (
              <div className="p-8 text-center text-sm text-zinc-400">
                No runs yet.{' '}
                <a href="/dashboard/team-eval" className="text-indigo-400">
                  Run your first analysis
                </a>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {data.recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium capitalize text-white">
                        {run.agentType.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-zinc-500">{formatRelativeTime(run.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      <span>{run.tokensUsed ?? '-'} tokens</span>
                      <span
                        className={
                          run.status === 'done'
                            ? 'text-emerald-400'
                            : run.status === 'failed'
                              ? 'text-indigo-400'
                              : 'text-yellow-400'
                        }
                      >
                        {run.status}
                      </span>
                      {run.rating && <span>{run.rating === 'up' ? '👍' : '👎'}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
