'use client'

import { useEffect, useState, useCallback } from 'react'
import { xEngineApi, type PendingReply, type XAccount } from '@/lib/api'

const STATUS_TABS = ['pending', 'approved', 'sent', 'skipped']

const STATUS_COLORS: Record<string, string> = {
  pending:  'bg-blue-500/10 text-blue-400',
  approved: 'bg-indigo-500/10 text-indigo-400',
  sent:     'bg-emerald-500/10 text-emerald-400',
  skipped:  'bg-zinc-700 text-zinc-400',
}

const LABEL_COLORS: Record<string, string> = {
  rostermind: 'bg-indigo-500/10 text-indigo-400',
  directory:  'bg-emerald-500/10 text-emerald-400',
  custom:     'bg-zinc-700 text-zinc-400',
}

export default function RepliesPage() {
  const [accounts, setAccounts] = useState<XAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string>('')
  const [replies, setReplies] = useState<PendingReply[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const loadReplies = useCallback(async (accountId?: string) => {
    setLoading(true)
    try {
      const res = await xEngineApi.getReplies({ status, page, accountId })
      setReplies(res.replies)
      setTotal(res.total)
      setPages(res.pages)
    } finally {
      setLoading(false)
    }
  }, [status, page])

  // Load accounts on mount, default to RosterMind
  useEffect(() => {
    xEngineApi.getAccounts().then((res) => {
      setAccounts(res.accounts)
      const rm = res.accounts.find((a) => a.label === 'rostermind') ?? res.accounts[0]
      if (rm) {
        setSelectedAccountId(rm.id)
        void loadReplies(rm.id)
      } else {
        void loadReplies()
      }
    }).catch(() => { void loadReplies() })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { void loadReplies(selectedAccountId || undefined) }, [loadReplies, selectedAccountId])

  function handleAccountChange(id: string) {
    setSelectedAccountId(id)
    setPage(1)
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await xEngineApi.syncMentions(selectedAccountId || undefined)
      alert(`Synced ${res.synced} mentions, ${res.created} new.`)
      await loadReplies(selectedAccountId || undefined)
    } catch {
      alert('Sync failed. Check API credentials and tier limits.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">X Engine</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Reply Queue</h1>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-60"
        >
          {syncing ? 'Syncing…' : 'Sync Mentions'}
        </button>
      </div>

      {/* Free-tier notice */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
        <p className="text-xs text-amber-400">
          <span className="font-semibold">Free tier limit:</span> 100 reads/month. Mention sync uses your read quota. Upgrade to Basic ($100/mo) for real-time monitoring.
        </p>
      </div>

      {/* Account picker */}
      {accounts.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Account:</span>
          <div className="flex gap-1.5">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => handleAccountChange(a.id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  selectedAccountId === a.id ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                @{a.handle} <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${LABEL_COLORS[a.label] ?? ''}`}>{a.label}</span>
              </button>
            ))}
          </div>
          {/* Show AI voice indicator */}
          {selectedAccountId && (() => {
            const acct = accounts.find((a) => a.id === selectedAccountId)
            return acct ? (
              <span className="ml-2 text-xs text-zinc-600">
                AI voice: <span className="capitalize text-zinc-500">{acct.label}</span>
              </span>
            ) : null
          })()}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1) }}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${status === s ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="text-xs text-zinc-500">{total} mention{total !== 1 ? 's' : ''}</p>

      {/* Reply cards */}
      {loading ? (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      ) : replies.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">
          {status === 'pending'
            ? 'No pending mentions. Click "Sync Mentions" to pull the latest @mentions.'
            : `No ${status} replies.`}
        </div>
      ) : (
        <div className="space-y-4">
          {replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} onUpdate={() => loadReplies(selectedAccountId || undefined)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded px-3 py-1 text-sm text-zinc-400 hover:text-white disabled:opacity-40">← Prev</button>
          <span className="text-sm text-zinc-500">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded px-3 py-1 text-sm text-zinc-400 hover:text-white disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  )
}

function ReplyCard({ reply, onUpdate }: { reply: PendingReply; onUpdate: () => void }) {
  const [aiReply, setAiReply] = useState(reply.aiReply ?? '')
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)

  const accountLabel = reply.xAccount?.label ?? 'custom'

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await xEngineApi.generateReply(reply.id)
      setAiReply(res.aiReply)
    } catch {
      alert('Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSend(content: string) {
    if (!content.trim()) return alert('Reply content cannot be empty.')
    if (!confirm('Send this reply on X?')) return
    setSending(true)
    try {
      await xEngineApi.sendReply(reply.id, content)
      onUpdate()
    } catch {
      alert('Failed to send reply. Check credentials and rate limits.')
    } finally {
      setSending(false)
    }
  }

  async function handleSkip() {
    await xEngineApi.skipReply(reply.id)
    onUpdate()
  }

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
      {/* Original mention */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-400">
          {reply.authorHandle.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white">@{reply.authorHandle}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[reply.status] ?? ''}`}>
              {reply.status}
            </span>
            {reply.xAccount?.label && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] capitalize ${LABEL_COLORS[reply.xAccount.label] ?? ''}`}>
                {reply.xAccount.label} voice
              </span>
            )}
            <a
              href={`https://x.com/i/web/status/${reply.tweetId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-[11px] text-blue-400 hover:underline"
            >
              View ↗
            </a>
          </div>
          <p className="mt-1 text-sm text-zinc-300">{reply.tweetText}</p>
          <p className="mt-1 text-xs text-zinc-600">{new Date(reply.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* AI voice hint */}
      <div className="mt-3 rounded-lg border border-white/5 bg-zinc-800/40 px-3 py-2 text-xs text-zinc-500">
        {accountLabel === 'rostermind'
          ? 'AI will reply as RosterMind — helpful fantasy analysis, links to rzf.gg/chat'
          : accountLabel === 'directory'
          ? 'AI will reply as RZF Directory — informational, references rankings/tools at rzf.gg'
          : 'AI will reply as RZF — general fantasy football assistant'}
      </div>

      {/* AI Reply section */}
      {reply.status === 'pending' && (
        <div className="mt-4 border-t border-white/10 pt-4">
          {!aiReply && !editMode ? (
            <div className="flex gap-2">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-60"
              >
                {generating ? 'Generating…' : '✦ Generate AI Reply'}
              </button>
              <button
                onClick={() => { setEditMode(true); setDraft('') }}
                className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
              >
                Write Manually
              </button>
              <button
                onClick={handleSkip}
                className="ml-auto rounded-lg px-3 py-1.5 text-xs text-zinc-600 transition hover:text-zinc-400"
              >
                Skip
              </button>
            </div>
          ) : editMode ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400">Your Reply</label>
                <span className="text-xs text-zinc-600">{draft.length}/280</span>
              </div>
              <textarea
                rows={3}
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 280))}
                placeholder="Type your reply…"
                className="w-full resize-none rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleSend(draft)}
                  disabled={sending}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Send Reply'}
                </button>
                <button onClick={() => setEditMode(false)} className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 hover:text-white">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">AI Suggested Reply</p>
              <textarea
                rows={3}
                value={aiReply}
                onChange={(e) => setAiReply(e.target.value.slice(0, 280))}
                className="w-full resize-none rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
              />
              <p className="text-xs text-zinc-600">{aiReply.length}/280 chars</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSend(aiReply)}
                  disabled={sending}
                  className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
                >
                  {sending ? 'Sending…' : 'Approve & Send'}
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white disabled:opacity-60"
                >
                  {generating ? '…' : 'Regenerate'}
                </button>
                <button
                  onClick={handleSkip}
                  className="ml-auto rounded-lg px-3 py-1.5 text-xs text-zinc-600 transition hover:text-zinc-400"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sent confirmation */}
      {reply.status === 'sent' && reply.aiReply && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-xs text-zinc-500">Replied: <span className="text-zinc-300">{reply.aiReply}</span></p>
          {reply.sentAt && <p className="mt-0.5 text-xs text-zinc-600">Sent at {new Date(reply.sentAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  )
}
