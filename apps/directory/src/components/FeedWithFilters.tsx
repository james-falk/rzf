'use client'

import { useState, useMemo, useId, useCallback } from 'react'
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

/** Scrollable source list (~5 rows visible); shared by desktop sidebar and mobile panel */
function SourceFilterList({
  grouped,
  checkedSources,
  toggleSource,
  sourceSearch,
  setSourceSearch,
  inputId,
}: {
  grouped: Record<string, Source[]>
  checkedSources: Set<string>
  toggleSource: (id: string) => void
  sourceSearch: string
  setSourceSearch: (v: string) => void
  inputId: string
}) {
  const totalShown = Object.values(grouped).reduce((n, arr) => n + arr.length, 0)

  return (
    <div className="flex flex-col gap-2 min-h-0">
      <div className="relative shrink-0">
        <svg
          className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2"
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
          id={inputId}
          type="search"
          value={sourceSearch}
          onChange={(e) => setSourceSearch(e.target.value)}
          placeholder="Search sources…"
          autoComplete="off"
          className="w-full rounded-md border py-2 pl-8 pr-2 text-xs text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
          style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
        />
      </div>
      <div
        className="max-h-[200px] overflow-y-auto overscroll-contain rounded-md border pr-0.5"
        style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(10,10,10)' }}
      >
        {totalShown === 0 ? (
          <p className="px-2 py-3 text-center text-xs" style={{ color: 'rgb(115,115,115)' }}>
            No sources match your search.
          </p>
        ) : (
          <div className="space-y-3 p-2">
            {Object.entries(grouped).map(([platform, srcs]) => (
              <div key={platform}>
                <p
                  className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgb(115,115,115)' }}
                >
                  {PLATFORM_LABEL[platform] ?? platform}
                </p>
                <div className="space-y-0.5">
                  {srcs.map((src) => {
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
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded"
                          style={{
                            background: checked ? 'rgb(220,38,38)' : 'transparent',
                            border: `1px solid ${checked ? 'rgb(220,38,38)' : 'rgb(63,63,63)'}`,
                          }}
                        >
                          {checked && (
                            <svg viewBox="0 0 12 12" fill="currentColor" className="h-3 w-3 text-white">
                              <path
                                d="M10 3L5 8.5 2 5.5"
                                stroke="white"
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function FeedWithFilters({ items, sources, userTier, trendingTopics }: FeedWithFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const selectedTopic = searchParams.get('topic')

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

  const [tab, setTab] = useState<'feed' | 'custom'>('feed')
  const [contentType, setContentType] = useState('all')
  const [search, setSearch] = useState('')
  const [sourceSearch, setSourceSearch] = useState('')
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sourceFilterInputId = useId()

  // Group sources by platform, filtered by source search (sidebar)
  const grouped = useMemo(() => {
    const q = sourceSearch.toLowerCase().trim()
    const filtered = q
      ? sources.filter((s) => {
          const label = PLATFORM_LABEL[s.platform] ?? s.platform
          return s.name.toLowerCase().includes(q) || label.toLowerCase().includes(q)
        })
      : sources
    const g: Record<string, Source[]> = {}
    for (const s of filtered) {
      const key = s.platform
      if (!g[key]) g[key] = []
      g[key]!.push(s)
    }
    return g
  }, [sources, sourceSearch])

  const toggleSource = (id: string) => {
    setCheckedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Source filter
      if (checkedSources.size > 0 && item.source?.id && !checkedSources.has(item.source.id)) return false
      // Content type filter
      if (contentType !== 'all' && item.contentType !== contentType) return false
      // Topic filter (?topic=slug)
      if (selectedTopic && selectedTopic.length > 0) {
        const t = item.topics ?? []
        if (!t.includes(selectedTopic)) return false
      }
      // Search filter
      const q = search.toLowerCase().trim()
      if (q && !item.title.toLowerCase().includes(q) && !(item.summary ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [items, checkedSources, contentType, search, selectedTopic])

  const filterCount =
    (checkedSources.size > 0 ? 1 : 0) +
    (contentType !== 'all' ? 1 : 0) +
    (search ? 1 : 0) +
    (selectedTopic ? 1 : 0)

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
            The pipeline pulls Reddit, X/Twitter (Nitter RSS), articles, and YouTube into one stream — filter by source on the left. If
            something is missing, check that ingestion jobs are running on the API/worker and sources are registered.
          </p>
        )}
      </div>

      {tab === 'custom' ? (
        <CustomFeedsManager userTier={userTier} sources={sources} />
      ) : (
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-4 rounded-xl border p-3" style={{ background: 'rgb(14,14,14)', borderColor: 'rgb(38,38,38)' }}>
              <details open className="group">
                <summary
                  className="list-none cursor-pointer select-none [&::-webkit-details-marker]:hidden"
                  style={{ color: 'rgb(163,163,163)' }}
                >
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider">
                    <span style={{ color: 'rgb(115,115,115)' }}>Sources</span>
                    <span className="flex items-center gap-1.5 font-normal normal-case">
                      {checkedSources.size > 0 && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(252,165,165)' }}
                        >
                          {checkedSources.size}
                        </span>
                      )}
                      <svg
                        className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                        style={{ color: 'rgb(115,115,115)' }}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </span>
                </summary>
                <div className="mt-3">
                  <SourceFilterList
                    grouped={grouped}
                    checkedSources={checkedSources}
                    toggleSource={toggleSource}
                    sourceSearch={sourceSearch}
                    setSourceSearch={setSourceSearch}
                    inputId={sourceFilterInputId}
                  />
                </div>
              </details>
              {checkedSources.size > 0 && (
                <button
                  type="button"
                  onClick={() => setCheckedSources(new Set())}
                  className="mt-3 w-full rounded-md py-1 text-xs transition-colors hover:bg-white/5"
                  style={{ color: 'rgb(220,38,38)' }}
                >
                  Clear filters
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
                  <SourceFilterList
                    grouped={grouped}
                    checkedSources={checkedSources}
                    toggleSource={toggleSource}
                    sourceSearch={sourceSearch}
                    setSourceSearch={setSourceSearch}
                    inputId={`${sourceFilterInputId}-mobile`}
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
                  {items.length === 0 ? 'Content ingestion in progress — check back soon.' : 'No content matches your filters.'}
                </p>
                {filterCount > 0 && (
                  <button
                    onClick={() => {
                      setCheckedSources(new Set())
                      setContentType('all')
                      setSearch('')
                      setTopicParam(null)
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
          </div>
        </div>
      )}
    </div>
  )
}

