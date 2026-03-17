'use client'

import { useEffect, useState } from 'react'
import { xEngineApi, type TweetMonitorRule, type XAccount } from '@/lib/api'

interface IngestedTweet {
  id: string
  text: string
  authorId: string
  authorHandle?: string
  createdAt?: string
  publicMetrics?: { likeCount: number; retweetCount: number; replyCount: number }
}

export default function MonitorPage() {
  const [rules, setRules] = useState<TweetMonitorRule[]>([])
  const [account, setAccount] = useState<XAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQuery, setNewQuery] = useState('')
  const [saving, setSaving] = useState(false)

  // Live run results (ephemeral — not stored to DB here)
  const [runningRuleId, setRunningRuleId] = useState<string | null>(null)
  const [runResults, setRunResults] = useState<{ ruleId: string; tweets: IngestedTweet[] } | null>(null)

  async function loadAll() {
    setLoading(true)
    try {
      const [rulesRes, accountRes] = await Promise.all([
        xEngineApi.getRules(),
        xEngineApi.getAccount(),
      ])
      setRules(rulesRes.rules)
      setAccount(accountRes.account)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void loadAll() }, [])

  async function handleAddRule() {
    if (!account) return alert('No connected X account.')
    if (!newQuery.trim()) return
    setSaving(true)
    try {
      await xEngineApi.createRule({ xAccountId: account.id, query: newQuery.trim() })
      setNewQuery('')
      setShowAddForm(false)
      await loadAll()
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(rule: TweetMonitorRule) {
    await xEngineApi.toggleRule(rule.id, !rule.isActive)
    await loadAll()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this rule?')) return
    await xEngineApi.deleteRule(id)
    await loadAll()
  }

  async function handleRun(rule: TweetMonitorRule) {
    setRunningRuleId(rule.id)
    setRunResults(null)
    try {
      const res = await xEngineApi.runRule(rule.id)
      setRunResults({ ruleId: rule.id, tweets: res.tweets as IngestedTweet[] })
    } catch {
      alert('Failed to run rule. Check your API credentials and tier limits.')
    } finally {
      setRunningRuleId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">X Engine</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Tweet Monitor</h1>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
        >
          + Add Rule
        </button>
      </div>

      {/* Free-tier notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400">
          <span className="font-semibold">Free tier limit:</span> 100 reads/month. Upgrade to Basic ($100/mo) to run monitor rules at scale.
        </p>
      </div>

      {/* Add rule form */}
      {showAddForm && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <p className="mb-3 text-sm font-medium text-white">New Monitor Rule</p>
          <div className="flex gap-3">
            <input
              value={newQuery}
              onChange={(e) => setNewQuery(e.target.value)}
              placeholder='e.g. #fantasyfootball waiver wire -is:retweet'
              className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') void handleAddRule() }}
            />
            <button
              onClick={handleAddRule}
              disabled={saving || !newQuery.trim()}
              className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button
              onClick={() => { setShowAddForm(false); setNewQuery('') }}
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-600">Use Twitter search syntax. Add <code className="bg-zinc-800 px-1 rounded">-is:retweet</code> to exclude retweets.</p>
        </div>
      )}

      {/* Rules list */}
      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500">Loading…</div>
      ) : rules.length === 0 ? (
        <div className="py-12 text-center text-sm text-zinc-500">No monitor rules yet. Add one to start ingesting tweets.</div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-xl border border-white/10 bg-zinc-900 p-5">
              <div className="flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(rule)}
                  className={`mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${rule.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                  <span className={`block h-3.5 w-3.5 translate-x-0.5 rounded-full bg-white transition-transform ${rule.isActive ? 'translate-x-4' : ''}`} />
                </button>

                {/* Query */}
                <div className="flex-1 min-w-0">
                  <code className="block text-sm text-zinc-200 break-all">{rule.query}</code>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    {rule.xAccount && <span>@{rule.xAccount.handle}</span>}
                    <span>·</span>
                    <span className={rule.isActive ? 'text-emerald-400' : 'text-zinc-500'}>{rule.isActive ? 'Active' : 'Paused'}</span>
                    {rule.lastRanAt && <><span>·</span><span>Last run: {new Date(rule.lastRanAt).toLocaleDateString()}</span></>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleRun(rule)}
                    disabled={runningRuleId === rule.id}
                    className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 transition hover:text-white disabled:opacity-60"
                  >
                    {runningRuleId === rule.id ? 'Running…' : 'Run Now'}
                  </button>
                  <button
                    onClick={() => handleDelete(rule.id)}
                    className="rounded-lg border border-red-500/20 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Run results */}
              {runResults?.ruleId === rule.id && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <p className="mb-3 text-xs font-medium text-zinc-400">{runResults.tweets.length} tweet{runResults.tweets.length !== 1 ? 's' : ''} found</p>
                  {runResults.tweets.length === 0 ? (
                    <p className="text-xs text-zinc-500">No results for this query.</p>
                  ) : (
                    <div className="space-y-2">
                      {runResults.tweets.map((t) => (
                        <div key={t.id} className="rounded-lg border border-white/5 bg-zinc-800/50 p-3">
                          <p className="text-xs text-zinc-400">
                            {t.authorHandle ? `@${t.authorHandle}` : t.authorId}
                            {t.createdAt && <span className="ml-2 text-zinc-600">{new Date(t.createdAt).toLocaleDateString()}</span>}
                          </p>
                          <p className="mt-1 text-sm text-zinc-200">{t.text}</p>
                          {t.publicMetrics && (
                            <div className="mt-1 flex gap-3 text-[11px] text-zinc-600">
                              <span>♥ {t.publicMetrics.likeCount}</span>
                              <span>↺ {t.publicMetrics.retweetCount}</span>
                              <span>↩ {t.publicMetrics.replyCount}</span>
                            </div>
                          )}
                          <a
                            href={`https://x.com/i/web/status/${t.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 block text-[11px] text-blue-400 hover:underline"
                          >
                            View on X ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
