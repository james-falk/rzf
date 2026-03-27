'use client'

import { useCallback, useEffect, useState } from 'react'
import { PlayerNewsMentionCard } from '@/components/PlayerNewsMentionCard'

export type SerializedMentionContent = {
  id: string
  title: string
  summary: string | null
  sourceUrl: string
  publishedAt: string | null
  thumbnailUrl: string | null
  source: { name: string | null; avatarUrl: string | null; feedUrl: string | null } | null
}

function toCardContent(c: SerializedMentionContent) {
  return {
    ...c,
    publishedAt: c.publishedAt ? new Date(c.publishedAt) : null,
  }
}

export function PlayerMentionsSection({
  sleeperId,
  initialItems,
  initialNextCursor,
}: {
  sleeperId: string
  initialItems: SerializedMentionContent[]
  initialNextCursor: string | null
}) {
  const [items, setItems] = useState(initialItems)
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setItems(initialItems)
    setNextCursor(initialNextCursor)
  }, [sleeperId, initialItems, initialNextCursor])

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/players/${encodeURIComponent(sleeperId)}/mentions?cursor=${encodeURIComponent(nextCursor)}`,
      )
      if (!res.ok) return
      const data = (await res.json()) as {
        items?: SerializedMentionContent[]
        nextCursor?: string | null
      }
      const batch = data.items ?? []
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i.id))
        const merged = [...prev]
        for (const row of batch) {
          if (!seen.has(row.id)) {
            seen.add(row.id)
            merged.push(row)
          }
        }
        return merged
      })
      setNextCursor(data.nextCursor ?? null)
    } finally {
      setLoading(false)
    }
  }, [nextCursor, loading, sleeperId])

  if (items.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-lg font-bold text-white">Recent news & analysis</h2>
      <p className="mb-4 text-xs" style={{ color: 'rgb(115,115,115)' }}>
        Logos use each source&apos;s avatar from Source Manager when set; otherwise a site favicon.
      </p>
      <div className="flex flex-col gap-3">
        {items.map((c) => (
          <PlayerNewsMentionCard key={c.id} content={toCardContent(c)} />
        ))}
      </div>
      {nextCursor && (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="rounded-lg border px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50 hover:border-red-800/50 hover:bg-white/[0.02]"
            style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }}
          >
            {loading ? 'Loading…' : 'Load more mentions'}
          </button>
        </div>
      )}
    </section>
  )
}
