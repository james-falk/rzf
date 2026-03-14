'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ContentCard } from './ContentCard'

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
}

const PLATFORM_LABEL: Record<string, string> = {
  youtube: 'YouTube',
  rss: 'Articles & News',
}

const CONTENT_TYPES = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'video', label: 'Videos' },
]

function clearbitLogo(feedUrl: string | null, name: string): string | null {
  if (!feedUrl) return null
  try {
    const url = feedUrl.startsWith('http') ? feedUrl : `https://${feedUrl}`
    const domain = new URL(url).hostname.replace(/^www\./, '')
    if (!domain.includes('.')) return null
    return `https://logo.clearbit.com/${domain}`
  } catch {
    return null
  }
}

export function FeedWithFilters({ items, sources, userTier }: FeedWithFiltersProps) {
  const [tab, setTab] = useState<'feed' | 'custom'>('feed')
  const [contentType, setContentType] = useState('all')
  const [search, setSearch] = useState('')
  const [checkedSources, setCheckedSources] = useState<Set<string>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Group sources by platform
  const grouped = useMemo(() => {
    const g: Record<string, Source[]> = {}
    for (const s of sources) {
      const key = s.platform
      if (!g[key]) g[key] = []
      g[key]!.push(s)
    }
    return g
  }, [sources])

  const toggleSource = (id: string) => {
    setCheckedSources((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filtered = useMemo(() => {
    return items.filter((item) => {
      // Source filter
      if (checkedSources.size > 0 && item.source?.id && !checkedSources.has(item.source.id)) return false
      // Content type filter
      if (contentType !== 'all' && item.contentType !== contentType) return false
      // Search filter
      const q = search.toLowerCase().trim()
      if (q && !item.title.toLowerCase().includes(q) && !(item.summary ?? '').toLowerCase().includes(q)) return false
      return true
    })
  }, [items, checkedSources, contentType, search])

  const filterCount = (checkedSources.size > 0 ? 1 : 0) + (contentType !== 'all' ? 1 : 0) + (search ? 1 : 0)

  return (
    <div>
      {/* Tab row */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgb(18,18,18)', border: '1px solid rgb(38,38,38)' }}>
          <button
            onClick={() => setTab('feed')}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
            style={tab === 'feed' ? { background: 'rgb(220,38,38)', color: 'white' } : { color: 'rgb(115,115,115)' }}
          >
            All Feed
          </button>
          <button
            onClick={() => setTab('custom')}
            className="rounded-md px-4 py-1.5 text-sm font-medium transition-all"
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

      {tab === 'custom' ? (
        <CustomFeedsTab userTier={userTier} />
      ) : (
        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-4 rounded-xl border p-4" style={{ background: 'rgb(14,14,14)', borderColor: 'rgb(38,38,38)' }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(115,115,115)' }}>
                Sources
              </p>
              <div className="space-y-4">
                {Object.entries(grouped).map(([platform, srcs]) => (
                  <div key={platform}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(115,115,115)' }}>
                      {PLATFORM_LABEL[platform] ?? platform}
                    </p>
                    <div className="space-y-1">
                      {srcs.map((src) => {
                        const logo = src.avatarUrl ?? clearbitLogo(src.feedUrl, src.name)
                        const checked = checkedSources.has(src.id)
                        return (
                          <button
                            key={src.id}
                            onClick={() => toggleSource(src.id)}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-white/5"
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
                                  <path d="M10 3L5 8.5 2 5.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </span>
                            {logo ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={logo} alt={src.name} className="h-4 w-4 shrink-0 rounded object-contain" />
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
              {checkedSources.size > 0 && (
                <button
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
                    className="rounded-full px-3 py-1 text-xs font-medium transition-all"
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
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all lg:hidden"
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
                    onClick={() => { setCheckedSources(new Set()); setContentType('all'); setSearch('') }}
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
                  <div className="space-y-4">
                    {Object.entries(grouped).map(([platform, srcs]) => (
                      <div key={platform}>
                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(115,115,115)' }}>
                          {PLATFORM_LABEL[platform] ?? platform}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {srcs.map((src) => {
                            const checked = checkedSources.has(src.id)
                            return (
                              <button
                                key={src.id}
                                onClick={() => toggleSource(src.id)}
                                className="rounded-full px-2.5 py-1 text-xs font-medium transition-all"
                                style={
                                  checked
                                    ? { background: 'rgba(220,38,38,0.15)', color: 'rgb(252,165,165)', border: '1px solid rgba(220,38,38,0.3)' }
                                    : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                                }
                              >
                                {src.name}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
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
                    onClick={() => { setCheckedSources(new Set()); setContentType('all'); setSearch('') }}
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

function CustomFeedsTab({ userTier }: { userTier: string | null }) {
  const isPaid = userTier === 'pro' || userTier === 'premium'

  if (!isPaid) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border p-10 text-center"
        style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.04)' }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.12), transparent 70%)' }}
        />
        <div className="relative">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(220,38,38,0.12)' }}>
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" style={{ color: 'rgb(220,38,38)' }}>
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white">Custom Feeds are a Pro feature</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm" style={{ color: 'rgb(115,115,115)' }}>
            Upgrade to Pro to create up to 5 personalized feeds — sync with your Sleeper roster, follow specific players, or track a whole team.
          </p>
          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="flex flex-wrap justify-center gap-3">
              {['Sleeper Roster Sync', 'Player Feeds', 'Team Feeds', 'Source Toggles'].map((f) => (
                <span
                  key={f}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: 'rgba(220,38,38,0.1)', color: 'rgb(252,165,165)' }}
                >
                  ✓ {f}
                </span>
              ))}
            </div>
            <Link
              href={process.env.NEXT_PUBLIC_ROSTERMIND_URL ?? 'https://rostermind.vercel.app'}
              className="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'rgb(220,38,38)' }}
            >
              Upgrade for $20/mo →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Paid user — show empty state with CTA to create feeds (builder coming soon)
  return (
    <div
      className="rounded-xl border py-16 text-center"
      style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
    >
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: 'rgba(220,38,38,0.12)' }}>
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" style={{ color: 'rgb(220,38,38)' }}>
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
      </div>
      <p className="font-semibold text-white">No custom feeds yet</p>
      <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
        Create a personalized feed using your Sleeper roster, players, or a team.
      </p>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{ background: 'rgb(220,38,38)' }}
      >
        + Create Feed
      </button>
    </div>
  )
}
