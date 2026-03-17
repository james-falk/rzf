'use client'

import { useEffect, useState, useCallback } from 'react'
import { xEngineApi, type ScheduledPost, type XAccount } from '@/lib/api'

const POST_TYPES = [
  { value: 'start_sit', label: 'Start / Sit' },
  { value: 'waiver', label: 'Waiver Wire' },
  { value: 'trade', label: 'Trade Alert' },
  { value: 'trending', label: 'Trending Player' },
  { value: 'matchup', label: 'Great Matchup' },
  { value: 'custom', label: 'Custom' },
]

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-blue-500/10 text-blue-400',
  posted:    'bg-emerald-500/10 text-emerald-400',
  failed:    'bg-red-500/10 text-red-400',
  cancelled: 'bg-zinc-700 text-zinc-400',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function SchedulerPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDrawer, setShowDrawer] = useState(false)
  const [account, setAccount] = useState<XAccount | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await xEngineApi.getPosts({ status: filterStatus || undefined, page })
      setPosts(res.posts)
      setTotal(res.total)
      setPages(res.pages)
    } finally {
      setLoading(false)
    }
  }, [filterStatus, page])

  useEffect(() => { void load() }, [load])

  useEffect(() => {
    xEngineApi.getAccount().then((r) => setAccount(r.account)).catch(() => null)
  }, [])

  async function handleCancel(id: string) {
    if (!confirm('Cancel this post?')) return
    await xEngineApi.updatePost(id, { status: 'cancelled' })
    void load()
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">X Engine</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Post Scheduler</h1>
        </div>
        <button
          onClick={() => setShowDrawer(true)}
          className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white"
        >
          + New Post
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['', 'pending', 'posted', 'failed', 'cancelled'].map((s) => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${filterStatus === s ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
          >
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Total */}
      <p className="text-xs text-zinc-500">{total} post{total !== 1 ? 's' : ''}</p>

      {/* Posts list */}
      {loading ? (
        <div className="py-16 text-center text-sm text-zinc-500">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-sm text-zinc-500">No posts yet. Create one to get started.</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="flex gap-4 rounded-xl border border-white/10 bg-zinc-900 p-5">
              {/* Left: type chip */}
              <div className="flex flex-col items-start gap-2 w-32 shrink-0">
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400 capitalize">
                  {POST_TYPES.find((t) => t.value === post.postType)?.label ?? post.postType}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[post.status] ?? 'bg-zinc-800 text-zinc-400'}`}>
                  {post.status}
                </span>
              </div>

              {/* Center: content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 line-clamp-3">{post.content}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Scheduled: {formatDate(post.scheduledFor)}
                  {post.xAccount && <> · @{post.xAccount.handle}</>}
                </p>
                {post.tweetId && (
                  <a
                    href={`https://x.com/i/web/status/${post.tweetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-xs text-blue-400 hover:underline"
                  >
                    View on X ↗
                  </a>
                )}
                {post.errorMessage && (
                  <p className="mt-1 text-xs text-red-400">{post.errorMessage}</p>
                )}
              </div>

              {/* Right: actions */}
              {post.status === 'pending' && (
                <button
                  onClick={() => handleCancel(post.id)}
                  className="shrink-0 rounded-lg border border-red-500/20 px-2 py-1 text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  Cancel
                </button>
              )}
            </div>
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

      {/* New Post Drawer */}
      {showDrawer && (
        <NewPostDrawer
          account={account}
          onClose={() => setShowDrawer(false)}
          onCreated={() => { setShowDrawer(false); void load() }}
        />
      )}
    </div>
  )
}

function NewPostDrawer({
  account,
  onClose,
  onCreated,
}: {
  account: XAccount | null
  onClose: () => void
  onCreated: () => void
}) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('custom')
  const [scheduledFor, setScheduledFor] = useState(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 30)
    return d.toISOString().slice(0, 16)
  })
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [context, setContext] = useState('')
  const [charCount, setCharCount] = useState(0)

  function handleContentChange(val: string) {
    if (val.length <= 280) {
      setContent(val)
      setCharCount(val.length)
    }
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await xEngineApi.generateDraft(postType, context || undefined)
      setContent(res.draft)
      setCharCount(res.draft.length)
    } catch {
      alert('Failed to generate draft')
    } finally {
      setGenerating(false)
    }
  }

  async function handleSave() {
    if (!account) return alert('No connected X account.')
    if (!content.trim()) return alert('Post content required.')
    setSaving(true)
    try {
      await xEngineApi.createPost({
        xAccountId: account.id,
        content,
        postType,
        scheduledFor: new Date(scheduledFor).toISOString(),
      })
      onCreated()
    } catch {
      alert('Failed to create post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-white/10 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Scheduled Post</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
        </div>

        <div className="space-y-5">
          {/* Post type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Post Type</label>
            <div className="flex flex-wrap gap-2">
              {POST_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPostType(t.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${postType === t.value ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI generate */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Context (optional — for AI draft)</label>
            <input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. Ja'Marr Chase vs Bears, great matchup"
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="mt-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-zinc-500 hover:text-white disabled:opacity-60"
            >
              {generating ? 'Generating…' : '✦ AI Draft'}
            </button>
          </div>

          {/* Content */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400">Tweet Content</label>
              <span className={`text-xs ${charCount > 260 ? 'text-red-400' : 'text-zinc-500'}`}>{charCount}/280</span>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Write your tweet here…"
              className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">Schedule Date/Time (local)</label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-zinc-500 focus:outline-none"
            />
          </div>

          {!account && (
            <p className="text-xs text-amber-400">No X account connected. Connect one from the Overview page first.</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !account}
              className="flex-1 rounded-lg bg-zinc-100 py-2 text-sm font-medium text-zinc-900 transition hover:bg-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Schedule Post'}
            </button>
            <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
