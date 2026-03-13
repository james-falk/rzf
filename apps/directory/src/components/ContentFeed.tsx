'use client'

import { useState } from 'react'
import { ContentCard } from './ContentCard'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'youtube_video', label: 'YouTube' },
  { key: 'news', label: 'News' },
]

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
    name: string
    platform: string
    avatarUrl: string | null
    featured: boolean
    partnerTier: string | null
  } | null
  playerMentions: Array<{ player: { sleeperId: string; firstName: string; lastName: string; position: string | null } }>
}

export function ContentFeed({ items }: { items: FeedItem[] }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? items
    : items.filter((item) => item.contentType === filter)

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
            style={
              filter === f.key
                ? { background: 'rgb(220,38,38)', color: 'white' }
                : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
            }
          >
            {f.label}
            <span className="ml-1.5 text-xs opacity-60">
              {f.key === 'all' ? items.length : items.filter((i) => i.contentType === f.key).length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
        >
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>No content in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <ContentCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  )
}
