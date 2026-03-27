'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  api,
  type SourceSummary,
  type SourceCreateInput,
  type SourceUpdateInput,
  type ContentPlatform,
  ApiError,
} from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/lib/utils'
import Image from 'next/image'
import {
  Plus,
  RefreshCw,
  Trash2,
  Pencil,
  Check,
  X,
  AlertTriangle,
  Youtube,
  Rss,
  Globe,
  AtSign,
} from 'lucide-react'
import { normalizeTwitterFeedUrl, parseNitterBaseUrls } from '@rzf/shared'

// ─── Platform Config ──────────────────────────────────────────────────────────

const PLATFORM_LABELS: Record<ContentPlatform, string> = {
  rss: 'RSS',
  youtube: 'YouTube',
  twitter: 'Twitter / X',
  podcast: 'Podcast',
  reddit: 'Reddit',
  api: 'API',
  manual: 'Manual',
}

const PLATFORM_COLORS: Record<ContentPlatform, string> = {
  rss: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  youtube: 'bg-red-500/20 text-red-300 border-red-500/30',
  twitter: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  podcast: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  reddit: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  api: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  manual: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
}

// Connectors not wired for ingestion yet (twitter uses Nitter RSS like reddit — now enabled)
const COMING_SOON_PLATFORMS: ContentPlatform[] = ['podcast', 'api', 'manual']

const PLATFORM_ICON: Record<string, React.ReactNode> = {
  rss: <Rss size={13} />,
  youtube: <Youtube size={13} />,
  reddit: <Globe size={13} />,
  twitter: <AtSign size={13} />,
}

// ─── Health Badge ─────────────────────────────────────────────────────────────

function HealthBadge({ health }: { health: string }) {
  if (health === 'healthy') return <Badge variant="success">Healthy</Badge>
  if (health === 'stale') return <Badge variant="warning">Stale</Badge>
  return <Badge variant="default">Inactive</Badge>
}

// ─── Platform Input Normalization ─────────────────────────────────────────────

/**
 * Normalize a YouTube channel input into a canonical identifier for storage.
 * Handles: full URLs, @handles, channel/UCxxxxxx paths, and raw IDs.
 * The YouTubeConnector resolves @handles to channel IDs on first run.
 */
function normalizeYouTubeInput(input: string): string {
  const trimmed = input.trim()
  // Extract @handle from full URL: youtube.com/@Handle
  const handleMatch = trimmed.match(/youtube\.com\/@([\w.-]+)/i)
  if (handleMatch) return `@${handleMatch[1]}`
  // Extract channel ID from: youtube.com/channel/UCxxxxxx
  const channelMatch = trimmed.match(/youtube\.com\/channel\/(UC[\w-]+)/i)
  if (channelMatch) return channelMatch[1]!
  // Bare @handle
  if (trimmed.startsWith('@')) return trimmed
  // Raw UCxxxxxx channel ID
  if (/^UC[\w-]{20,}$/.test(trimmed)) return trimmed
  // Return as-is for anything else (connector will attempt resolution)
  return trimmed
}

/**
 * Normalize a Reddit input into an RSS feed URL.
 * Accepts: subreddit name, r/name, or full .rss URL.
 */
function normalizeRedditInput(input: string): string {
  const trimmed = input.trim()
  if (trimmed.startsWith('https://')) return trimmed
  const sub = trimmed.replace(/^r\//, '').replace(/\/$/, '')
  return `https://www.reddit.com/r/${sub}/.rss`
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

interface SourceFormState {
  name: string
  platform: ContentPlatform
  feedUrl: string
  refreshIntervalMins: number
  isActive: boolean
  avatarUrl: string
  tier: number
  featured: boolean
  partnerTier: string
}

const DEFAULT_FORM: SourceFormState = {
  name: '',
  platform: 'rss',
  feedUrl: '',
  refreshIntervalMins: 60,
  isActive: true,
  avatarUrl: '',
  tier: 2,
  featured: false,
  partnerTier: '',
}

function SourceModal({
  mode,
  initial,
  onSave,
  onClose,
  saving,
  error,
}: {
  mode: 'add' | 'edit'
  initial: SourceFormState
  onSave: (data: SourceFormState) => void
  onClose: () => void
  saving: boolean
  error: string | null
}) {
  const [form, setForm] = useState<SourceFormState>(initial)

  const set = (key: keyof SourceFormState, value: string | number | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const isComingSoon = COMING_SOON_PLATFORMS.includes(form.platform)

  const feedUrlLabel: Record<ContentPlatform, string> = {
    rss: 'Feed URL',
    youtube: 'Channel URL, @handle, or Channel ID',
    reddit: 'Subreddit (name, r/name, or full .rss URL)',
    podcast: 'Podcast RSS Feed URL',
    twitter: 'Twitter Handle or Search Term',
    api: 'API Endpoint',
    manual: 'Source Identifier',
  }

  const feedUrlPlaceholder: Record<ContentPlatform, string> = {
    rss: 'https://example.com/feed.rss',
    youtube: '@FantasyPros  or  UCxxxxxx  or  youtube.com/@FantasyPros',
    reddit: 'fantasyfootball  or  r/fantasyfootball  or  full .rss URL',
    podcast: 'https://example.com/podcast.rss',
    twitter: '@FantasyPros',
    api: 'https://api.example.com/feed',
    manual: 'source-identifier',
  }

  const feedUrlHint: Partial<Record<ContentPlatform, string>> = {
    youtube:
      'Accepts: @handle, channel URL, or raw UCxxxxxx ID. Handle resolution happens on first sync.',
    reddit:
      'Reddit RSS feeds require no API key. Public subreddits only.',
    rss: 'Must be a valid, publicly accessible RSS or Atom feed URL.',
    twitter:
      'Ingestion uses Nitter RSS (no X API). Enter @handle or x.com URL — we normalize to the first Nitter base. Set NITTER_BASE_URLS on the worker; instances can break. See docs/INGESTION_REDDIT_TWITTER.md.',
  }

  // Normalize feedUrl on save based on platform
  function handleSave() {
    let normalized = form.feedUrl.trim()
    if (form.platform === 'youtube') normalized = normalizeYouTubeInput(normalized)
    if (form.platform === 'reddit') normalized = normalizeRedditInput(normalized)
    if (form.platform === 'twitter') {
      normalized = normalizeTwitterFeedUrl(normalized, parseNitterBaseUrls(undefined))
    }
    onSave({ ...form, feedUrl: normalized })
  }

  const canSave = form.name.trim().length > 0 && (isComingSoon || form.feedUrl.trim().length > 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            {mode === 'add' ? 'Add Content Source' : 'Edit Source'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Platform */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(PLATFORM_LABELS) as ContentPlatform[]).map((p) => {
                const comingSoon = COMING_SOON_PLATFORMS.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => !comingSoon && set('platform', p)}
                    disabled={comingSoon}
                    title={comingSoon ? 'Coming soon — backend connector not yet implemented' : undefined}
                    className={[
                      'rounded-lg border px-2 py-2 text-xs font-medium transition',
                      form.platform === p
                        ? 'border-white/30 bg-white/10 text-white'
                        : comingSoon
                          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-zinc-600'
                          : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200',
                    ].join(' ')}
                  >
                    {PLATFORM_LABELS[p]}
                    {comingSoon && (
                      <span className="mt-0.5 block text-[9px] text-zinc-600">soon</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {isComingSoon && (
            <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-3 text-xs text-yellow-300">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>
                <strong>{PLATFORM_LABELS[form.platform]}</strong> connector is not yet implemented on the
                backend. Sources can be created but won&apos;t be refreshed automatically until the connector
                is built (tracked in GitHub).
              </span>
            </div>
          )}

          {/* Name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">Display Name</label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="The Fantasy Footballers"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
            />
          </div>

          {/* Feed URL / Channel Identifier */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              {feedUrlLabel[form.platform]}
            </label>
            <input
              value={form.feedUrl}
              onChange={(e) => set('feedUrl', e.target.value)}
              placeholder={feedUrlPlaceholder[form.platform]}
              disabled={isComingSoon}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none disabled:opacity-40"
            />
            {feedUrlHint[form.platform] && (
              <p className="mt-1 text-[11px] text-zinc-500">{feedUrlHint[form.platform]}</p>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Logo URL <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              value={form.avatarUrl}
              onChange={(e) => set('avatarUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Content tier (agent injection quality)
            </label>
            <select
              value={form.tier}
              onChange={(e) => set('tier', parseInt(e.target.value, 10))}
              disabled={isComingSoon}
              className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none disabled:opacity-40"
            >
              <option value={1}>Tier 1 — Premium beat / breaking</option>
              <option value={2}>Tier 2 — Established</option>
              <option value={3}>Tier 3 — General</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set('featured', e.target.checked)}
                disabled={isComingSoon}
                className="rounded disabled:opacity-40"
              />
              Featured source (Directory)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Partner tier</span>
              <select
                value={form.partnerTier}
                onChange={(e) => set('partnerTier', e.target.value)}
                disabled={isComingSoon}
                className="rounded-lg border border-white/10 bg-zinc-800 px-2 py-1.5 text-xs text-white disabled:opacity-40"
              >
                <option value="">—</option>
                <option value="gold">gold</option>
                <option value="silver">silver</option>
                <option value="bronze">bronze</option>
              </select>
            </div>
          </div>

          {/* Refresh interval + Active toggle */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Refresh Interval (min)
              </label>
              <select
                value={form.refreshIntervalMins}
                onChange={(e) => set('refreshIntervalMins', parseInt(e.target.value, 10))}
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={360}>6 hours</option>
                <option value={720}>12 hours</option>
                <option value={1440}>24 hours</option>
              </select>
            </div>
            <div className="flex flex-col justify-end">
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Active</label>
              <button
                type="button"
                onClick={() => set('isActive', !form.isActive)}
                className={[
                  'flex h-9 w-14 items-center justify-center rounded-lg border text-xs font-semibold transition',
                  form.isActive
                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                    : 'border-white/10 bg-white/5 text-zinc-500',
                ].join(' ')}
              >
                {form.isActive ? 'Yes' : 'No'}
              </button>
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !canSave}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
            {mode === 'add' ? 'Add Source' : 'Save Changes'}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:border-white/20 hover:text-zinc-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  source,
  onConfirm,
  onCancel,
  deleting,
}: {
  source: SourceSummary
  onConfirm: () => void
  onCancel: () => void
  deleting: boolean
}) {
  return (
    <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
      <p className="mb-2 text-xs text-red-300">
        Delete <strong>{source.name}</strong>? This will permanently remove the source and all{' '}
        {source.itemCount.toLocaleString()} content items. This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
        >
          {deleting ? <RefreshCw size={11} className="animate-spin" /> : <Trash2 size={11} />}
          Delete
        </button>
        <button
          onClick={onCancel}
          className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-zinc-200"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Automated APIs Tab Data ──────────────────────────────────────────────────

interface AutoConnector {
  name: string
  description: string
  data: string
  schedule: string
  jobType: string
  status: 'live' | 'coming_soon'
}

const AUTOMATED_CONNECTORS: AutoConnector[] = [
  {
    name: 'Sleeper — Players',
    description: 'Full NFL player roster: injuries, depth chart, status, practice participation',
    data: 'Player table',
    schedule: 'Daily 6am ET',
    jobType: 'player_refresh',
    status: 'live',
  },
  {
    name: 'Sleeper — Trending',
    description: 'Top 25 adds and drops across all Sleeper leagues (last 24 hours)',
    data: 'TrendingPlayer table',
    schedule: 'Hourly',
    jobType: 'trending_refresh',
    status: 'live',
  },
  {
    name: 'Sleeper — Trades',
    description: 'Trade transactions from all linked user leagues, with dynasty/redraft/superflex/teamCount metadata',
    data: 'TradeTransaction table',
    schedule: 'Daily 8am ET',
    jobType: 'trade_refresh',
    status: 'live',
  },
  {
    name: 'FantasyCalc',
    description: 'Dynasty 1QB + Superflex and redraft trade values derived from millions of real trades',
    data: 'PlayerTradeValue (source=fantasycalc)',
    schedule: 'Weekly — Tue 10am ET',
    jobType: 'trade_values_refresh',
    status: 'live',
  },
  {
    name: 'Dynasty Daddy',
    description: 'KTC dynasty + redraft, DynastyProcess, DynastySuperflex values, plus 8-week community trade volume for every player',
    data: 'PlayerTradeValue (ktc/dynastydaddy/dynastyprocess/dynastysuperflex) + PlayerTradeVolume',
    schedule: 'Weekly — Tue 11am ET',
    jobType: 'dynasty_daddy_refresh',
    status: 'live',
  },
  {
    name: 'Fantasy Football Calculator — ADP',
    description: 'Average Draft Position across PPR, half-PPR, and standard scoring formats',
    data: 'PlayerRanking (source=ffc_adp_*)',
    schedule: 'Weekly — Tue 10:30am ET',
    jobType: 'adp_refresh',
    status: 'live',
  },
  {
    name: 'Rankings Proxy',
    description: 'Consensus rankings derived from Sleeper searchRank field (FantasyPros CSV planned)',
    data: 'PlayerRanking (source=fantasypros)',
    schedule: 'Weekly — Tue 9am ET',
    jobType: 'rankings_refresh',
    status: 'live',
  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SourceManagerPage() {
  const [activeTab, setActiveTab] = useState<'managed' | 'automated'>('managed')
  const [sources, setSources] = useState<SourceSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState<ContentPlatform | 'all'>('all')
  const [triggering, setTriggering] = useState<Set<string>>(new Set())

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SourceSummary | null>(null)
  const [modalSaving, setModalSaving] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Per-row action state
  const [refreshing, setRefreshing] = useState<Set<string>>(new Set())
  const [toggling, setToggling] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const load = useCallback(async () => {
    try {
      const data = await api.getSources()
      setSources(data.sources)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load sources')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [load])

  const filtered = sources.filter((s) => {
    const matchName = s.name.toLowerCase().includes(search.toLowerCase())
    const matchPlatform = platformFilter === 'all' || s.platform === platformFilter
    return matchName && matchPlatform
  })

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleAdd(form: SourceFormState) {
    setModalSaving(true)
    setModalError(null)
    try {
      const payload: SourceCreateInput = {
        name: form.name,
        platform: form.platform,
        feedUrl: form.feedUrl,
        refreshIntervalMins: form.refreshIntervalMins,
        isActive: form.isActive,
        tier: form.tier,
        featured: form.featured,
        ...(form.partnerTier ? { partnerTier: form.partnerTier } : { partnerTier: null }),
        ...(form.avatarUrl ? { avatarUrl: form.avatarUrl } : {}),
        ...(form.platform === 'youtube' ? { platformConfig: { channelId: form.feedUrl } } : {}),
      }
      const created = await api.createSource(payload)
      setSources((prev) => [created, ...prev])
      setAddModalOpen(false)
      showToast(`"${created.name}" added`)
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to add source')
    } finally {
      setModalSaving(false)
    }
  }

  async function handleEdit(form: SourceFormState) {
    if (!editTarget) return
    setModalSaving(true)
    setModalError(null)
    try {
      const payload: SourceUpdateInput = {
        name: form.name,
        feedUrl: form.feedUrl,
        refreshIntervalMins: form.refreshIntervalMins,
        isActive: form.isActive,
        avatarUrl: form.avatarUrl || null,
        tier: form.tier,
        featured: form.featured,
        partnerTier: form.partnerTier || null,
      }
      const updated = await api.updateSource(editTarget.id, payload)
      setSources((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
      setEditTarget(null)
      showToast(`"${updated.name}" updated`)
    } catch (err) {
      setModalError(err instanceof ApiError ? err.message : 'Failed to update source')
    } finally {
      setModalSaving(false)
    }
  }

  async function handleToggleActive(source: SourceSummary) {
    setToggling((prev) => new Set(prev).add(source.id))
    try {
      const updated = await api.updateSource(source.id, { isActive: !source.isActive })
      setSources((prev) => prev.map((s) => (s.id === source.id ? { ...s, ...updated } : s)))
    } catch {
      showToast('Failed to toggle source')
    } finally {
      setToggling((prev) => { const next = new Set(prev); next.delete(source.id); return next })
    }
  }

  async function handleTrigger(jobType: string) {
    setTriggering((prev) => new Set(prev).add(jobType))
    try {
      await api.triggerIngestion(jobType)
      showToast(`Job "${jobType}" queued successfully`)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to trigger job')
    } finally {
      setTriggering((prev) => { const next = new Set(prev); next.delete(jobType); return next })
    }
  }

  async function handleRefresh(source: SourceSummary) {
    setRefreshing((prev) => new Set(prev).add(source.id))
    try {
      await api.refreshSource(source.id)
      showToast(`Refresh queued for "${source.name}"`)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Refresh failed')
    } finally {
      setRefreshing((prev) => { const next = new Set(prev); next.delete(source.id); return next })
    }
  }

  async function handleDelete(source: SourceSummary) {
    setDeleting((prev) => new Set(prev).add(source.id))
    try {
      await api.deleteSource(source.id)
      setSources((prev) => prev.filter((s) => s.id !== source.id))
      setDeleteTarget(null)
      showToast(`"${source.name}" deleted`)
    } catch {
      showToast('Delete failed')
    } finally {
      setDeleting((prev) => { const next = new Set(prev); next.delete(source.id); return next })
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const platformCounts = sources.reduce<Record<string, number>>((acc, s) => {
    acc[s.platform] = (acc[s.platform] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Source Manager</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage content sources and monitor automated data connectors. Ingestion job types and cron
            schedules are defined in the shared registry (`INGESTION_JOB_REGISTRY`); use{' '}
            <span className="text-zinc-300">Queue → Ingestion</span> to inspect BullMQ workers and DB run
            history, and trigger on-demand jobs (e.g. Reddit backfill) from Admin or the internal API.
          </p>
        </div>
        {activeTab === 'managed' && (
          <button
            onClick={() => { setAddModalOpen(true); setModalError(null) }}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
          >
            <Plus size={15} />
            Add Source
          </button>
        )}
      </div>

      {/* Tab Toggle */}
      <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.03] p-1 w-fit">
        <button
          onClick={() => setActiveTab('managed')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition',
            activeTab === 'managed'
              ? 'bg-white text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200',
          ].join(' ')}
        >
          Managed Sources
        </button>
        <button
          onClick={() => setActiveTab('automated')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition',
            activeTab === 'automated'
              ? 'bg-white text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200',
          ].join(' ')}
        >
          Automated APIs
        </button>
      </div>

      {/* Automated APIs Tab */}
      {activeTab === 'automated' && (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">
            These connectors run automatically on a schedule. No configuration needed — data lands directly in the database.
            Use the trigger button to run a job immediately.
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Connector</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Data Stored</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Schedule</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {AUTOMATED_CONNECTORS.map((connector) => (
                  <tr key={connector.jobType} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{connector.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">{connector.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-zinc-400 max-w-[200px]">
                      {connector.data}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-400 whitespace-nowrap">
                      {connector.schedule}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {connector.status === 'live'
                        ? <Badge variant="success">Live</Badge>
                        : <Badge variant="warning">Soon</Badge>
                      }
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleTrigger(connector.jobType)}
                        disabled={triggering.has(connector.jobType)}
                        title="Run this job now"
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ml-auto"
                      >
                        <RefreshCw size={11} className={triggering.has(connector.jobType) ? 'animate-spin' : ''} />
                        Trigger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Managed Sources Tab */}
      {activeTab === 'managed' && (<>

      {/* Stats strip */}
      <div className="flex flex-wrap gap-3">
        {(Object.keys(PLATFORM_LABELS) as ContentPlatform[]).filter((p) => platformCounts[p]).map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(platformFilter === p ? 'all' : p)}
            className={[
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition',
              platformFilter === p
                ? PLATFORM_COLORS[p]
                : 'border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-200',
            ].join(' ')}
          >
            {PLATFORM_ICON[p] ?? <Globe size={11} />}
            {PLATFORM_LABELS[p]}
            <span className="text-zinc-500">({platformCounts[p]})</span>
          </button>
        ))}
        {platformFilter !== 'all' && (
          <button
            onClick={() => setPlatformFilter('all')}
            className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search sources by name..."
        className="w-full max-w-sm rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-600 focus:border-white/20 focus:outline-none"
      />

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-zinc-500">Loading sources...</div>
      ) : error ? (
        <div className="py-16 text-center text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-zinc-500">
          {search || platformFilter !== 'all' ? 'No sources match your filter.' : 'No sources yet. Add one above.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Source</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Platform</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Health</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Items</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Last Fetch</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-zinc-500">Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((source) => (
                <>
                  <tr key={source.id} className="group hover:bg-white/[0.02]">
                    {/* Source name + feed URL */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {source.avatarUrl ? (
                          <Image src={source.avatarUrl} alt={source.name} width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-zinc-500">
                            {PLATFORM_ICON[source.platform] ?? <Globe size={12} />}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-white">{source.name}</p>
                          <p className="max-w-[220px] truncate text-xs text-zinc-500">{source.feedUrl}</p>
                        </div>
                      </div>
                    </td>

                    {/* Platform badge */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${PLATFORM_COLORS[source.platform as ContentPlatform] ?? ''}`}>
                        {PLATFORM_ICON[source.platform] ?? <Globe size={11} />}
                        {PLATFORM_LABELS[source.platform as ContentPlatform] ?? source.platform}
                      </span>
                    </td>

                    {/* Health */}
                    <td className="px-4 py-3">
                      <HealthBadge health={source.health} />
                    </td>

                    {/* Item count */}
                    <td className="px-4 py-3 text-right font-mono text-xs text-zinc-300">
                      {source.itemCount.toLocaleString()}
                    </td>

                    {/* Last fetch */}
                    <td className="px-4 py-3 text-xs text-zinc-400">
                      {source.lastFetchedAt ? formatRelativeTime(source.lastFetchedAt) : '—'}
                    </td>

                    {/* Active toggle */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(source)}
                        disabled={toggling.has(source.id)}
                        title={source.isActive ? 'Click to deactivate' : 'Click to activate'}
                        className={[
                          'inline-flex h-6 w-10 items-center justify-center rounded-full border transition',
                          source.isActive
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
                            : 'border-white/10 bg-white/5 text-zinc-600',
                        ].join(' ')}
                      >
                        {toggling.has(source.id) ? (
                          <RefreshCw size={10} className="animate-spin" />
                        ) : source.isActive ? (
                          <Check size={10} />
                        ) : (
                          <X size={10} />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Refresh */}
                        <button
                          onClick={() => handleRefresh(source)}
                          disabled={refreshing.has(source.id)}
                          title="Queue a manual refresh now"
                          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200 disabled:opacity-40"
                        >
                          <RefreshCw size={13} className={refreshing.has(source.id) ? 'animate-spin' : ''} />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => {
                            setEditTarget(source)
                            setModalError(null)
                          }}
                          title="Edit source"
                          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-200"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(deleteTarget === source.id ? null : source.id)}
                          title="Delete source"
                          className="rounded-md p-1.5 text-zinc-500 transition hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline delete confirm */}
                  {deleteTarget === source.id && (
                    <tr key={`${source.id}-delete`}>
                      <td colSpan={7} className="bg-red-950/20 px-4 py-1">
                        <DeleteConfirm
                          source={source}
                          onConfirm={() => handleDelete(source)}
                          onCancel={() => setDeleteTarget(null)}
                          deleting={deleting.has(source.id)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <p className="text-xs text-zinc-600">
          Showing {filtered.length} of {sources.length} sources
        </p>
      )}

      {/* Add Modal */}
      {addModalOpen && (
        <SourceModal
          mode="add"
          initial={DEFAULT_FORM}
          onSave={handleAdd}
          onClose={() => setAddModalOpen(false)}
          saving={modalSaving}
          error={modalError}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <SourceModal
          mode="edit"
          initial={{
            name: editTarget.name,
            platform: editTarget.platform as ContentPlatform,
            feedUrl: editTarget.feedUrl,
            refreshIntervalMins: editTarget.refreshIntervalMins,
            isActive: editTarget.isActive,
            avatarUrl: editTarget.avatarUrl ?? '',
            tier: editTarget.tier,
            featured: editTarget.featured ?? false,
            partnerTier: editTarget.partnerTier ?? '',
          }}
          onSave={handleEdit}
          onClose={() => setEditTarget(null)}
          saving={modalSaving}
          error={modalError}
        />
      )}
      </>)}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  )
}
