'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ContentCard } from '@/components/ContentCard'

function parsePublishedAt(v: unknown): Date | null {
  if (v == null) return null
  if (v instanceof Date) return v
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d
}

interface Item {
  id: string
  title: string
  summary: string | null
  thumbnailUrl: string | null
  sourceUrl: string
  publishedAt: Date | null
  contentType: string
  authorName: string | null
  topics: string[]
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

export function CustomFeedViewClient({ feedId, initialName }: { feedId: string; initialName: string }) {
  const [name] = useState(initialName)
  const [items, setItems] = useState<Item[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const load = useCallback(
    async (nextCursor: string | null, append: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const u = new URL(`/api/custom-feeds/${feedId}/items`, window.location.origin)
        u.searchParams.set('limit', '30')
        if (nextCursor) u.searchParams.set('cursor', nextCursor)
        const res = await fetch(u.toString(), { credentials: 'same-origin' })
        if (res.status === 401) {
          setError('Sign in to view this feed.')
          return
        }
        if (!res.ok) throw new Error('Failed to load feed')
        const data = (await res.json()) as {
          items: Item[]
          nextCursor: string | null
          error?: string
        }
        if (data.error) setWarning(data.error)
        else setWarning(null)
        const mapped: Item[] = data.items.map((it) => ({
          ...it,
          publishedAt: parsePublishedAt(it.publishedAt),
        }))
        setItems((prev) => {
          if (!append) return mapped
          const seen = new Set(prev.map((i) => i.id))
          const extra = mapped.filter((i) => !seen.has(i.id))
          return [...prev, ...extra]
        })
        setCursor(data.nextCursor)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    },
    [feedId],
  )

  useEffect(() => {
    void load(null, false)
  }, [load])

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <Link href="/" className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
          ← Back to directory
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-white">{name}</h1>
        {warning && (
          <p className="mt-2 text-sm" style={{ color: 'rgb(234,179,8)' }}>
            {warning}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border px-4 py-8 text-center text-sm" style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(252,165,165)' }}>
          {error}
        </div>
      )}

      {!error && items.length === 0 && !loading && !warning && (
        <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
          No matching content yet.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <ContentCard
            key={item.id}
            id={item.id}
            title={item.title}
            summary={item.summary}
            thumbnailUrl={item.thumbnailUrl}
            sourceUrl={item.sourceUrl}
            publishedAt={item.publishedAt}
            contentType={item.contentType}
            authorName={item.authorName}
            source={item.source}
            playerMentions={item.playerMentions}
            topics={item.topics ?? []}
          />
        ))}
      </div>

      {cursor && (
        <div className="mt-8 text-center">
          <button
            type="button"
            disabled={loading}
            onClick={() => void load(cursor, true)}
            className="rounded-lg px-6 py-2 text-sm font-medium text-white transition disabled:opacity-50"
            style={{ background: 'rgb(220,38,38)' }}
          >
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </main>
  )
}
