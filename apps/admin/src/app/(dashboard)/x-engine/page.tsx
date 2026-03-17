'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { xEngineApi, type XAccount, type XStats } from '@/lib/api'
import { ApiError } from '@/lib/api'

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  )
}

export default function XEngineOverviewPage() {
  const [account, setAccount] = useState<XAccount | null>(null)
  const [stats, setStats] = useState<XStats | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [tierNote, setTierNote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([xEngineApi.getAccount(), xEngineApi.getStats()])
      .then(([accountRes, statsRes]) => {
        setAccount(accountRes.account)
        setIsConfigured(accountRes.isConfigured)
        setTierNote(accountRes.tierNote)
        setStats(statsRes)
      })
      .catch((err) => {
        if (!(err instanceof ApiError)) console.error(err)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleDisconnect() {
    if (!account) return
    if (!confirm(`Disconnect @${account.handle}?`)) return
    await xEngineApi.disconnectAccount(account.id)
    setAccount(null)
    setStats(null)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">X Engine</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Overview</h1>
      </div>

      {/* Free-tier banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
        <p className="text-sm font-semibold text-amber-400">X/Twitter Free Tier Active</p>
        <p className="mt-1 text-sm text-zinc-400">{tierNote || 'Free tier: 500 posts/month write, 100 reads/month. Upgrade to Basic ($100/mo) for full ingestion.'}</p>
      </div>

      {/* Account status */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Connected X Account</p>
            {loading ? (
              <p className="mt-2 text-sm text-zinc-500">Loading…</p>
            ) : account ? (
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-zinc-300">@{account.handle}</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">Connected</span>
              </div>
            ) : (
              <div className="mt-2 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-zinc-600" />
                <span className="text-sm text-zinc-500">No account connected</span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {account ? (
              <button
                onClick={handleDisconnect}
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-500/20"
              >
                Disconnect
              </button>
            ) : (
              <ConnectButton isConfigured={isConfigured} />
            )}
          </div>
        </div>

        {!isConfigured && (
          <div className="mt-4 rounded-lg border border-white/10 bg-zinc-800/50 p-4">
            <p className="text-xs font-semibold text-zinc-400">Setup Instructions</p>
            <ol className="mt-2 space-y-1 text-xs text-zinc-500 list-decimal list-inside">
              <li>Create a project at <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">developer.twitter.com</a></li>
              <li>Enable OAuth 2.0 with PKCE and add your callback URL</li>
              <li>Set <code className="rounded bg-zinc-700 px-1">X_CLIENT_ID</code> and <code className="rounded bg-zinc-700 px-1">X_CLIENT_SECRET</code> in your API environment</li>
              <li>Return here to connect your X account</li>
            </ol>
          </div>
        )}
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Posts this week" value={stats.postedThisWeek} sub="successfully posted" />
          <StatCard label="Pending posts" value={stats.pendingPosts} sub="scheduled" />
          <StatCard label="Active rules" value={stats.activeRules} sub="monitor queries" />
          <StatCard label="Pending replies" value={stats.pendingReplies} sub="awaiting approval" />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { href: '/x-engine/scheduler', label: 'Post Scheduler', desc: 'Queue and manage outgoing tweets.' },
          { href: '/x-engine/monitor', label: 'Tweet Monitor', desc: 'Search rules that ingest fantasy tweets.' },
          { href: '/x-engine/replies', label: 'Reply Queue', desc: 'AI-suggested replies to @mentions.' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col rounded-xl border border-white/10 bg-zinc-900 p-5 transition hover:border-white/20 hover:bg-zinc-800/60"
          >
            <p className="font-medium text-white">{item.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{item.desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-zinc-400 transition group-hover:text-white">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function ConnectButton({ isConfigured }: { isConfigured: boolean }) {
  const [loading, setLoading] = useState(false)

  async function handleConnect() {
    setLoading(true)
    try {
      const callbackUrl = `${window.location.origin}/x-engine/callback`
      const { url } = await xEngineApi.getAuthUrl(callbackUrl)
      window.location.href = url
    } catch {
      alert('Failed to get auth URL. Check that X_CLIENT_ID is configured.')
    } finally {
      setLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <span className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-500 cursor-not-allowed">
        API keys required
      </span>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-60"
    >
      {loading ? 'Redirecting…' : 'Connect X Account'}
    </button>
  )
}
