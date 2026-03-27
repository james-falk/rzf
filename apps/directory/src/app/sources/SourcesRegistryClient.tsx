'use client'

import { useMemo, useState } from 'react'
import { SourceRegistryCard } from '@/components/SourceRegistryCard'
import type { SourceRegistryRow } from './types'

/** Maps DB platform → filter bucket (RSS vs news APIs vs YouTube vs rest) */
export type PlatformBucket = 'all' | 'rss' | 'api' | 'youtube' | 'social' | 'podcast' | 'other'

const BUCKET_FILTERS: { key: PlatformBucket; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'rss', label: 'RSS / Articles' },
  { key: 'api', label: 'News & APIs' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'social', label: 'Reddit & X' },
  { key: 'podcast', label: 'Podcasts' },
  { key: 'other', label: 'Other' },
]

function bucketForPlatform(platform: string): Exclude<PlatformBucket, 'all'> {
  switch (platform) {
    case 'rss':
      return 'rss'
    case 'api':
      return 'api'
    case 'youtube':
      return 'youtube'
    case 'reddit':
    case 'twitter':
      return 'social'
    case 'podcast':
      return 'podcast'
    default:
      return 'other'
  }
}

type SortKey = 'records' | 'name-asc' | 'name-desc'

export function SourcesRegistryClient({ sources }: { sources: SourceRegistryRow[] }) {
  const [bucket, setBucket] = useState<PlatformBucket>('all')
  const [sort, setSort] = useState<SortKey>('records')

  const filtered = useMemo(() => {
    let list =
      bucket === 'all' ? sources : sources.filter((s) => bucketForPlatform(s.platform) === bucket)

    list = [...list].sort((a, b) => {
      if (sort === 'records') return b.itemCount - a.itemCount
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      return sort === 'name-asc' ? cmp : -cmp
    })

    return list
  }, [sources, bucket, sort])

  const totalRecords = useMemo(() => sources.reduce((n, s) => n + s.itemCount, 0), [sources])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
            {sources.length} source{sources.length !== 1 ? 's' : ''} · {totalRecords.toLocaleString()} total
            ingested item{totalRecords !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(115,115,115)' }}>
            Sort
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['records', 'Most records'],
                ['name-asc', 'Name A–Z'],
                ['name-desc', 'Name Z–A'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className="rounded-full px-3 py-2 text-xs font-medium transition-all"
                style={
                  sort === key
                    ? { background: 'rgb(220,38,38)', color: 'white' }
                    : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgb(115,115,115)' }}>
          Filter by type
        </p>
        <div className="flex flex-wrap gap-2">
          {BUCKET_FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setBucket(key)}
              className="rounded-full px-3 py-2 text-xs font-medium transition-all"
              style={
                bucket === key
                  ? { background: 'rgb(220,38,38)', color: 'white' }
                  : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
        >
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
            No sources match this filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((source) => (
            <SourceRegistryCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}
