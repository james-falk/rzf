'use client'

import { useState, useMemo, useId, useCallback, useEffect, type Dispatch, type SetStateAction } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { brandLogoUrlFromFeedUrl } from '@/lib/brandLogo'
import type { TrendingTopicRow } from '@/lib/getTrendingTopics'
import { ContentCard } from './ContentCard'
import { TrendingTopicChips } from './TrendingTopicChips'
import { CustomFeedsManager } from './CustomFeedsManager'

interface FeedItem {
  id: string
  title: string
  summary: string | null
  thumbnailUrl: string | null
  sourceUrl: string
  publishedAt: Date | null
  contentType: string
  authorName: string | null
  source: {
    id?: string
    name: string
    platform: string
    feedUrl?: string | null
    avatarUrl: string | null
    featured: boolean
    partnerTier: string | null
  } | null
  playerMentions: Array<{ player: { sleeperId: string; firstName: string; lastName: string; position: string | null } }>
  topics: string[]
}

interface Source {
  id: string
  name: string
  platform: string
  avatarUrl: string | null
  feedUrl: string | null
}

interface FeedWithFiltersProps {
  items: FeedItem[]
  /** Cursor for the next `/api/feed` page (same global sort as the server). */
  initialFeedNextCursor?: string | null
  sources: Source[]
  userTier: string | null
  trendingTopics: TrendingTopicRow[]
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  rss: 'Articles & News',
  reddit: 'Reddit',
  twitter: 'X / Twitter',
  api: 'News APIs',
  podcast: 'Podcasts',
  manual: 'Other',
}

const CONTENT_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'video', label: 'Videos' },
]

type FeedStream = 'all' | 'social' | 'news'

const FEED_STREAMS: { key: FeedStream; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'social', label: 'Social (Reddit & X)' },
  { key: 'news', label: 'News & video' },
]

function isSocialPlatform(platform: string | undefined): boolean {
  return platform === 'reddit' || platform === 'twitter'
}

/** Stable order for platform groups in the sidebar */
const PLATFORM_ORDER = ['youtube', 'rss', 'reddit', 'twitter', 'api', 'podcast', 'manual']

function sortPlatformKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = PLATFORM_ORDER.indexOf(a)
    const ib = PLATFORM_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
}

/** One platform: collapsed summary + expandable search, select/clear, checklist */
function PlatformSourceGroup({
  platformKey,
  label,
  platformSources,
  checkedSources,
  toggleSource,
  setCheckedSources,
}: {
  platformKey: string
  label: string
  platformSources: Source[]
  checkedSources: Set<string>
  toggleSource: (id: string) => void
  setCheckedSources: Dispatch<SetStateAction<Set<string>>>
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const searchId = useId()

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim()
    if (!t) return platformSources
    return platformSources.filter((s) => s.name.toLowerCase().includes(t))
  }, [platformSources, q])

  const selectedInPlatform = useMemo(
    () => platformSources.filter((s) => checkedSources.has(s.id)).length,
    [platformSources, checkedSources],
  )

  const summary = selectedInPlatform === 0 ? `All ${label}` : `${selectedInPlatform} selected`

  const selectAllFiltered = () => {
    const ids = filtered.map((s) => s.id)
    setCheckedSources((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.add(id)
      return next
    })
  }

  const clearThisPlatform = () => {
    const ids = new Set(platformSources.map((s) => s.id))
    setCheckedSources((prev) => {
      const next = new Set(prev)
      for (const id of ids) next.delete(id)
      return next
    })
  }

  return (
    <div className="rounded-lg border" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(10,10,10)' }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.03]"
        aria-expanded={open}
        aria-controls={`platform-panel-${platformKey}`}
      >
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgb(115,115,115)' }}>
            {label}
          </div>
          <div className="truncate text-xs font-medium text-white">{summary}</div>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: 'rgb(115,115,115)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          id={`platform-panel-${platformKey}`}
          className="border-t px-2 pb-2 pt-2"
          style={{ borderColor: 'rgb(38,38,38)' }}
        >
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
              style={{ color: 'rgb(115,115,115)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              id={searchId}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              autoComplete="off"
              className="w-full rounded-md border py-1.5 pl-7 pr-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-red-600"
              style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
            />
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={selectAllFiltered}
              className="flex-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors"
              style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(252,165,165)' }}
            >
              Select all
            </button>
            <button
              type="button"
              onClick={clearThisPlatform}
              className="flex-1 rounded-md border py-1.5 text-[11px] font-medium transition-colors hover:bg-white/5"
              style={{ borderColor: 'rgb(52,52,52)', color: 'rgb(163,163,163)' }}
            >
              Clear all
            </button>
          </div>
          <div
            className="mt-2 max-h-[200px] overflow-y-auto overscroll-contain rounded-md border pr-0.5"
            style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
          >
            {filtered.length === 0 ? (
              <p className="px-2 py-3 text-center text-[11px]" style={{ color: 'rgb(115,115,115)' }}>
                No sources match.
              </p>
            ) : (
              <div className="space-y-0.5 p-1.5">
                {filtered.map((src) => {
                  const logo = src.avatarUrl ?? brandLogoUrlFromFeedUrl(src.feedUrl)
                  const checked = checkedSources.has(src.id)
                  return (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => toggleSource(src.id)}
                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors hover:bg-white/5"
                      style={{ color: checked ? 'white' : 'rgb(163,163,163)' }}
                    >
                      <span
                        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
                        style={{
                          background: checked ? 'rgb(220,38,38)' : 'transparent',
                          borderColor: checked ? 'rgb(220,38,38)' : 'rgb(63,63,63)',
                        }}
                      >
                        {checked && (
                          <svg viewBox="0 0 12 12" className="h-3 w-3 text-white" aria-hidden>
                            <path
                              d="M10 3L5 8.5 2 5.5"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      {logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logo} alt="" className="h-4 w-4 shrink-0 rounded object-contain" />
                      ) : (
                        <span
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[8px] font-bold"
                          style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
                        >
                          {src.name.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0 truncate">{src.name}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SourcesSidebarPanel({
  sources,
  checkedSources,
  toggleSource,
  setCheckedSources,
}: {
  sources: Source[]
  checkedSources: Set<string>
  toggleSource: (id: string) => void
  setCheckedSources: Dispatch<SetStateAction<Set<string>>>
}) {
  const groupedFull = useMemo(() => {
    const g: Record<string, Source[]> = {}
    for (const s of sources) {
      if (!g[s.platform]) g[s.platform] = []
      g[s.platform]!.push(s)
    }
    return g
  }, [sources])

  const platformKeys = useMemo(() => sortPlatformKeys(Object.keys(groupedFull)), [groupedFull])

  return (
    <div className="flex max-h-[min(70vh,520px)] flex-col gap-2 overflow-y-auto pr-0.5">
      {platformKeys.map((key) => (
        <PlatformSourceGroup
          key={key}
          platformKey={key}
          label={PLATFORM_LABEL[key] ?? key}
          platformSources={groupedFull[key]!}
          checkedSources={checkedSources}
          toggleSource={toggleSource}
          setCheckedSources={setCheckedSources}
        />
      ))}
    </div>
  )
}

function parseFeedApiItem(raw: Record<string, unknown>): FeedItem {
  const publishedAt = raw['publishedAt']
  const topicsRaw = raw['topics']
  const topics = Array.isArray(topicsRaw)
    ? topicsRaw.filter((t): t is string => typeof t === 'string')
    : []
  return {
    ...(raw as unknown as FeedItem),
    topics,
    publishedAt:
      typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt instanceof Date ? publishedAt : null,
  }
}

export function FeedWithFilters({
  items,
  initialFeedNextCursor = null,
  sources,
  userTier,
  trendingTopics,
}: FeedWithFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedTopic = searchParams.get('topic')
  const streamParam = searchParams.get('stream')
  const feedStream: FeedStream =
    streamParam === 'social' ? 'social' : streamParam === 'news' ? 'news' : 'all'

  const setTopicParam = useCallback(
    (slug: string | null) => {
      const p = new URLSearchParams(searchParams.toString())
      if (slug) p.set('topic', slug)
      else p.delete('topic')
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const setStreamParam = useCallback(
    (stream: FeedStream) => {
      const p = new URLSearchParams(searchParams.toString())
      if (stream === 'all') p.delete('stream')
      else p.set('stream', stream)
      const qs = p.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [tab, setTab] = useState<'feed' | 'custom'>('feed')
  const [contentType, setContentType] = useState('all')
  const [search, setSearch] = useState('')
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [feedItems, setFeedItems] = useState<FeedItem[]>(items)
  const [feedNextCursor, setFeedNextCursor] = useState<string | null>(initialFeedNextCursor ?? null)
  const [loadingMoreFeed, setLoadingMoreFeed] = useState(false)

  useEffect(() => {
    setFeedItems(items)
    setFeedNextCursor(initialFeedNextCursor ?? null)
  }, [items, initialFeedNextCursor])

  const loadMoreFeed = useCallback(async () => {
    if (!feedNextCursor || loadingMoreFeed) return
    setLoadingMoreFeed(true)
    try {
      const res = await fetch(`/api/feed?cursor=${encodeURIComponent(feedNextCursor)}`)
      if (!res.ok) return
      const data = (await res.json()) as { items?: Record<string, unknown>[]; nextCursor?: string | null }
      const parsed = (data.items ?? []).map((row) => parseFeedApiItem(row))
      setFeedItems((prev) => {
        const seen = new Set(prev.map((i) => i.id))
        const next = [...prev]
        for (const row of parsed) {
          if (!seen.has(row.id)) {
            seen.add(row.id)
            next.push(row)
          }
        }
        return next
      })
      setFeedNextCursor(data.nextCursor ?? null)
    } finally {
      setLoadingMoreFeed(false)
    }
  }, [feedNextCursor, loadingMoreFeed])

  const toggleSource = (id: string) => {
    setCheckedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const filtered = useMemo(() => {
    return feedItems.filter((item) => {
      // Source filter
      if (checkedSources.size > 0 && item.source?.id && !checkedSources.has(item.source.id)) return false
      // Content type filter
      if (contentType !== 'all' && item.contentType !== contentType) return false
      // Topic filter (?topic=slug)
      if (selectedTopic && selectedTopic.length > 0) {
        const t = item.topics ?? []
        if (!t.includes(selectedTopic)) return false
      }
      // Stream: social vs news & video (?stream=social|news)
      if (feedStream === 'social' && !isSocialPlatform(item.source?.platform)) return false
      if (feedStream === 'news' && isSocialPlatform(item.source?.platform)) return false
      // Search filter
      const q = search.toLowerCase().trim()
      if (q && !item.title.toLowerCase().includes(q) && !(item.summary ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [feedItems, checkedSources, contentType, search, selectedTopic, feedStream])

  const filterCount =
    (checkedSources.size > 0 ? 1 : 0) +
    (contentType !== 'all' ? 1 : 0) +
    (search ? 1 : 0) +
    (selectedTopic ? 1 : 0) +
    (feedStream !== 'all' ? 1 : 0)

  return (
    <div>
      {/* Tab row */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgb(18,18,18)', border: '1px solid rgb(38,38,38)' }}>
            <button
              type="button"
              onClick={() => setTab('feed')}
              className="rounded-md px-4 py-2.5 text-sm font-medium transition-all"
              style={tab === 'feed' ? { background: 'rgb(220,38,38)', color: 'white' } : { color: 'rgb(115,115,115)' }}
            >
              All Feed
            </button>
            <button
              type="button"
              onClick={() => setTab('custom')}
              className="rounded-md px-4 py-2.5 text-sm font-medium transition-all"
              style={tab === 'custom' ? { background: 'rgb(220,38,38)', color: 'white' } : { color: 'rgb(115,115,115)' }}
            >
              Custom Feeds
            </button>
          </div>
          {tab === 'feed' && (
            <span className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
              {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {tab === 'feed' && (
          <p className="mt-2 max-w-3xl text-xs leading-relaxed" style={{ color: 'rgb(82,82,91)' }}>
            Use <strong className="font-medium text-neutral-400">Social</strong> for Reddit and X-only threads;{' '}
            <strong className="font-medium text-neutral-400">News &amp; video</strong> for articles, YouTube, and APIs. Filter by source
            type on the left if you need finer control. If posts are missing, confirm ingestion jobs and registered sources.{' '}
            <span className="block mt-1 text-[11px] text-neutral-500">
              “Load more” appends the next global page (newest first). Sidebar and stream filters apply only to items already loaded.
            </span>
          </p>
        )}
      </div>

      {tab === 'custom' ? (
        <CustomFeedsManager userTier={userTier} sources={sources} />
      ) : (
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-4 rounded-xl border p-3" style={{ background: 'rgb(14,14,14)', borderColor: 'rgb(38,38,38)' }}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(115,115,115)' }}>
                  Sources
                </span>
                {checkedSources.size > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(252,165,165)' }}
                  >
                    {checkedSources.size}
                  </span>
                )}
              </div>
              <SourcesSidebarPanel
                sources={sources}
                checkedSources={checkedSources}
                toggleSource={toggleSource}
                setCheckedSources={setCheckedSources}
              />
              {checkedSources.size > 0 && (
                <button
                  type="button"
                  onClick={() => setCheckedSources(new Set())}
                  className="mt-3 w-full rounded-md py-1.5 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'rgb(220,38,38)' }}
                >
                  Clear all source filters
                </button>
              )}
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0 flex-1">
            {/* Search + type chips */}
            <div className="mb-4 space-y-3">
              <TrendingTopicChips
                topics={trendingTopics}
                selectedSlug={selectedTopic}
                onSelect={setTopicParam}
              />

              <div className="relative">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'rgb(115,115,115)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search titles & summaries…"
                  className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
                  style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-[10px] font-semibold uppercase tracking-wider lg:w-auto" style={{ color: 'rgb(115,115,115)' }}>
                  Stream
                </span>
                {FEED_STREAMS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStreamParam(s.key)}
                    className="rounded-full px-3 py-2 text-xs font-medium transition-all"
                    style={
                      feedStream === s.key
                        ? { background: 'rgb(220,38,38)', color: 'white' }
                        : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="w-full text-[10px] font-semibold uppercase tracking-wider lg:w-auto" style={{ color: 'rgb(115,115,115)' }}>
                  Type
                </span>
                {CONTENT_TYPES.map((ct) => (
                  <button
                    key={ct.key}
                    onClick={() => setContentType(ct.key)}
                    className="rounded-full px-3 py-2 text-xs font-medium transition-all"
                    style={
                      contentType === ct.key
                        ? { background: 'rgb(220,38,38)', color: 'white' }
                        : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                    }
                  >
                    {ct.label}
                  </button>
                ))}
                {/* Mobile source filter toggle */}
                <button
                  onClick={() => setSidebarOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all lg:hidden"
                  style={
                    checkedSources.size > 0
                      ? { background: 'rgba(220,38,38,0.15)', color: 'rgb(252,165,165)', border: '1px solid rgba(220,38,38,0.3)' }
                      : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                  }
                >
                  Sources {checkedSources.size > 0 && `(${checkedSources.size})`}
                </button>
                {filterCount > 0 && (
                  <button
                    onClick={() => {
                      setCheckedSources(new Set())
                      setContentType('all')
                      setSearch('')
                      setTopicParam(null)
                      setStreamParam('all')
                    }}
                    className="rounded-full px-3 py-1 text-xs transition-all"
                    style={{ color: 'rgb(220,38,38)' }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Mobile sidebar panel */}
              {sidebarOpen && (
                <div className="rounded-xl border p-4 lg:hidden" style={{ background: 'rgb(14,14,14)', borderColor: 'rgb(38,38,38)' }}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(115,115,115)' }}>
                    Sources
                  </p>
                  <SourcesSidebarPanel
                    sources={sources}
                    checkedSources={checkedSources}
                    toggleSource={toggleSource}
                    setCheckedSources={setCheckedSources}
                  />
                </div>
              )}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div
                className="rounded-xl border py-16 text-center"
                style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
              >
                <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
                  {feedItems.length === 0 ? 'Content ingestion in progress — check back soon.' : 'No content matches your filters.'}
                </p>
                {filterCount > 0 && (
                  <button
                    onClick={() => {
                      setCheckedSources(new Set())
                      setContentType('all')
                      setSearch('')
                      setTopicParam(null)
                      setStreamParam('all')
                    }}
                    className="mt-3 text-sm transition-colors hover:text-white"
                    style={{ color: 'rgb(220,38,38)' }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <ContentCard key={item.id} {...item} />
                ))}
              </div>
            )}
            {tab === 'feed' && feedNextCursor && filtered.length > 0 && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMoreFeed()}
                  disabled={loadingMoreFeed}
                  className="rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 hover:border-red-800/50 hover:bg-white/[0.02]"
                  style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }}
                >
                  {loadingMoreFeed ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

