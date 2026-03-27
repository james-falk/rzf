import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'
import { SourcesRegistryClient } from './SourcesRegistryClient'
import type { SourceRegistryRow } from './types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Source Registry — Red Zone Fantasy',
  description: 'All tracked content sources — expert analysts, sites, and social accounts.',
}

export default async function SourcesPage() {
  const raw = await db.contentSource.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      platform: true,
      feedUrl: true,
      avatarUrl: true,
      isActive: true,
      featured: true,
      partnerTier: true,
      lastFetchedAt: true,
      _count: { select: { items: true } },
    },
  })

  const sources: SourceRegistryRow[] = raw.map((s) => ({
    id: s.id,
    name: s.name,
    platform: s.platform,
    feedUrl: s.feedUrl,
    avatarUrl: s.avatarUrl,
    isActive: s.isActive,
    itemCount: s._count.items,
    featured: s.featured,
    partnerTier: s.partnerTier,
    lastFetchedAt: s.lastFetchedAt?.toISOString() ?? null,
  }))

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Source Registry</h1>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed" style={{ color: 'rgb(163,163,163)' }}>
            Every ingestion endpoint we track — filter by RSS, news APIs, YouTube, or social. Card counts are total
            items stored in the directory.
          </p>
        </div>

        {sources.length === 0 ? (
          <div
            className="rounded-xl border py-16 text-center"
            style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
          >
            <div className="text-4xl">📡</div>
            <p className="mt-3 font-medium text-white">No sources configured yet</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
              Content connectors are being set up. Sources will appear here once ingestion runs.
            </p>
          </div>
        ) : (
          <SourcesRegistryClient sources={sources} />
        )}
      </main>
    </div>
  )
}
