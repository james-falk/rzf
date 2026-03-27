'use client'

import { topicDisplayLabel } from '@/lib/topicLabels'
import type { TrendingTopicRow } from '@/lib/getTrendingTopics'

interface TrendingTopicChipsProps {
  topics: TrendingTopicRow[]
  selectedSlug: string | null
  onSelect: (slug: string | null) => void
}

export function TrendingTopicChips({ topics, selectedSlug, onSelect }: TrendingTopicChipsProps) {
  if (topics.length === 0) return null

  return (
    <div className="mb-4">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgb(115,115,115)' }}>
        Trending topics
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
          style={
            selectedSlug === null
              ? { background: 'rgb(220,38,38)', color: 'white' }
              : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
          }
        >
          All topics
        </button>
        {topics.map(({ slug, count }) => (
          <button
            key={slug}
            type="button"
            onClick={() => onSelect(slug === selectedSlug ? null : slug)}
            className="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
            style={
              selectedSlug === slug
                ? { background: 'rgb(220,38,38)', color: 'white' }
                : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
            }
            title={`${count} items in last 72h`}
          >
            {topicDisplayLabel(slug)}
            <span className="ml-1.5 opacity-60">({count})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
