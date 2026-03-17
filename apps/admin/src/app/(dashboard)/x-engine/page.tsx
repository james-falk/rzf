'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { xEngineApi, type XAccount, type XStats } from '@/lib/api'

// ── per-account config ────────────────────────────────────────────────────────

const ACCOUNT_DEFS = [
  {
    label: 'rostermind' as const,
    title: 'RosterMind',
    subtitle: 'Reply-focused — answers fan questions, links to rzf.gg/chat',
    accentClass: 'border-indigo-500/30 bg-indigo-500/5',
    badgeClass: 'bg-indigo-500/10 text-indigo-400',
    iconClass: 'text-indigo-400',
    primaryTool: { href: '/x-engine/replies', label: 'Reply Queue' },
    secondaryTool: { href: '/x-engine/scheduler', label: 'Post Scheduler' },
  },
  {
    label: 'directory' as const,
    title: 'RZF Directory',
    subtitle: 'Broadcast-focused — Start/Sit, Waiver, Trending & Matchup posts',
    accentClass: 'border-emerald-500/30 bg-emerald-500/5',
    badgeClass: 'bg-emerald-500/10 text-emerald-400',
    iconClass: 'text-emerald-400',
    primaryTool: { href: '/x-engine/scheduler', label: 'Post Scheduler' },
    secondaryTool: { href: '/x-engine/monitor', label: 'Tweet Monitor' },
  },
]

// ── small stat pill ───────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-lg bg-zinc-800/60 px-4 py-2.5 min-w-[70px]">
      <span className="text-xl font-bold text-white">{value}</span>
      <span className="mt-0.5 text-[10px] text-zinc-500 text-center leading-tight">{label}</span>
    </div>
  )
}

// ── per-account card ──────────────────────────────────────────────────────────

function AccountCard({
  def,
  account,
  stats,
  isConfigured,
  loading,
  onDisconnect,
  onConnect,
}: {
  def: typeof ACCOUNT_DEFS[number]
  account: XAccount | null
  stats: XStats | null
  isConfigured: boolean
  loading: boolean
  onDisconnect: () => void
  onConnect: () => void
}) {
  return (
    <div className={`flex flex-col rounded-2xl border p-6 ${def.accentClass}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white text-base">{def.title}</p>
          <p className="mt-0.5 text-xs text-zinc-500 max-w-[220px]">{def.subtitle}</p>
        </div>
        {/* Connection badge */}
        {loading ? (
          <span className="text-xs text-zinc-600">…</span>
        ) : account ? (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${def.badgeClass}`}>Connected</span>
        ) : (
          <span className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-[11px] text-zinc-400">Not connected</span>
        )}
      </div>

      {/* Handle */}
      <div className="mt-4">
        {account ? (
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${def.iconClass}`}>@{account.handle}</span>
            <button
              onClick={onDisconnect}
              className="ml-auto rounded-lg border border-red-500/20 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 italic">No account connected</span>
            <button
              onClick={onConnect}
              disabled={!isConfigured}
              title={isConfigured ? undefined : 'Set X_CLIENT_ID and X_CLIENT_SECRET first'}
              className="ml-auto rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Connect
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      {account && stats && (
        <div className="mt-5 flex gap-2 flex-wrap">
          {def.label === 'rostermind' && (
            <>
              <Stat label="Pending replies" value={stats.pendingReplies} />
              <Stat label="Posts pending" value={stats.pendingPosts} />
              <Stat label="Posted / wk" value={stats.postedThisWeek} />
            </>
          )}
          {def.label === 'directory' && (
            <>
              <Stat label="Posted / wk" value={stats.postedThisWeek} />
              <Stat label="Posts pending" value={stats.pendingPosts} />
              <Stat label="Active rules" value={stats.activeRules} />
            </>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="mt-5 flex gap-2 flex-wrap">
        <Link
          href={def.primaryTool.href}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-white/10 ${def.badgeClass} border-current`}
        >
          {def.primaryTool.label} →
        </Link>
        <Link
          href={def.secondaryTool.href}
          className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white"
        >
          {def.secondaryTool.label}
        </Link>
      </div>

      {/* Not configured note */}
      {!isConfigured && !account && (
        <p className="mt-4 text-[11px] text-amber-500/80">
          Set <code className="rounded bg-zinc-800 px-1">X_CLIENT_ID</code> &amp; <code className="rounded bg-zinc-800 px-1">X_CLIENT_SECRET</code> in your API env to enable OAuth.
        </p>
      )}
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function XEngineOverviewPage() {
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [statsMap, setStatsMap] = useState<Record<string, XStats>>({})
  const [isConfigured, setIsConfigured] = useState(false)
  const [tierNote, setTierNote] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await xEngineApi.getAccounts()
      setAccounts(res.accounts)
      setIsConfigured(res.isConfigured)
      setTierNote(res.tierNote)

      // Fetch per-account stats in parallel
      const statsEntries = await Promise.all(
        res.accounts.map(async (a) => {
          const s = await xEngineApi.getStats(a.id)
          return [a.id, s] as [string, XStats]
        }),
      )
      setStatsMap(Object.fromEntries(statsEntries))
    } catch {
      // silently fail — not configured yet
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  function accountForLabel(label: string): XAccount | null {
    return accounts.find((a) => a.label === label) ?? null
  }

  async function handleDisconnect(account: XAccount) {
    if (!confirm(`Disconnect @${account.handle}?`)) return
    await xEngineApi.disconnectAccount(account.id)
    void load()
  }

  async function handleConnect(label: 'rostermind' | 'directory') {
    try {
      const callbackUrl = `${window.location.origin}/x-engine/callback`
      const { url } = await xEngineApi.getAuthUrl(callbackUrl, label)
      window.location.href = url
    } catch {
      alert('Failed to get auth URL. Check that X_CLIENT_ID is configured.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
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

      {/* Two account cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {ACCOUNT_DEFS.map((def) => {
          const account = accountForLabel(def.label)
          return (
            <AccountCard
              key={def.label}
              def={def}
              account={account}
              stats={account ? (statsMap[account.id] ?? null) : null}
              isConfigured={isConfigured}
              loading={loading}
              onDisconnect={() => account && handleDisconnect(account)}
              onConnect={() => handleConnect(def.label)}
            />
          )
        })}
      </div>

      {/* Setup instructions (shown when neither account is configured) */}
      {!isConfigured && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="text-xs font-semibold text-zinc-400">Setup Instructions</p>
          <ol className="mt-3 space-y-2 text-xs text-zinc-500 list-decimal list-inside">
            <li>Create a project at <a href="https://developer.twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">developer.twitter.com</a></li>
            <li>Enable OAuth 2.0 with PKCE. Add callback URL: <code className="rounded bg-zinc-800 px-1">{typeof window !== 'undefined' ? `${window.location.origin}/x-engine/callback` : '<your-admin-url>/x-engine/callback'}</code></li>
            <li>Set <code className="rounded bg-zinc-800 px-1">X_CLIENT_ID</code> and <code className="rounded bg-zinc-800 px-1">X_CLIENT_SECRET</code> in your API environment</li>
            <li>Return here and click <strong className="text-zinc-300">Connect</strong> on each account card above</li>
          </ol>
        </div>
      )}

      {/* Tool quick links */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">Tools</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { href: '/x-engine/scheduler', label: 'Post Scheduler', desc: 'Queue and manage outgoing tweets for both accounts.' },
            { href: '/x-engine/monitor', label: 'Tweet Monitor', desc: 'Search rules that ingest fantasy tweets (Directory).' },
            { href: '/x-engine/replies', label: 'Reply Queue', desc: 'AI-suggested replies to @mentions (RosterMind).' },
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
    </div>
  )
}
