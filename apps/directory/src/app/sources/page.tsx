import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Source Registry — Red Zone Fantasy',
  description: 'All tracked content sources — expert analysts, sites, and social accounts.',
}

export const revalidate = 3600

export default async function SourcesPage() {
  const sources = await db.contentSource.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      platform: true,
      feedUrl: true,
      avatarUrl: true,
      isActive: true,
      _count: { select: { items: true } },
    },
  })

  const byPlatform = sources.reduce<Record<string, typeof sources>>(
    (acc, s) => {
      const key = s.platform ?? 'OTHER'
      ;(acc[key] ??= []).push(s)
      return acc
    },
    {},
  )

  const platformOrder = ['RSS', 'YOUTUBE', 'TWITTER', 'PODCAST', 'OTHER']

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Source Registry</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            {sources.length} tracked source{sources.length !== 1 ? 's' : ''} across all platforms
          </p>
        </div>

        {sources.length === 0 && (
          <div className="rounded-xl border py-16 text-center" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
            <div className="text-4xl">📡</div>
            <p className="mt-3 font-medium text-white">No sources configured yet</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
              Content connectors are being set up. Sources will appear here once ingestion runs.
            </p>
          </div>
        )}

        {platformOrder.map((platform) => {
          const group = byPlatform[platform]
          if (!group?.length) return null
          return (
            <section key={platform} className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-lg">{PLATFORM_ICON[platform] ?? '🔗'}</span>
                <h2 className="text-lg font-bold text-white">{PLATFORM_LABEL[platform] ?? platform}</h2>
                <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgb(26,26,26)', color: 'rgb(115,115,115)' }}>
                  {group.length}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((source) => (
                  <a
                    key={source.id}
                    href={source.feedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
                    style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
                  >
                    {source.avatarUrl ? (
                      <img src={source.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
                      >
                        {source.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white group-hover:text-red-400 transition-colors">
                        {source.name}
                      </p>
                      <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>
                        {source._count.items.toLocaleString()} item{source._count.items !== 1 ? 's' : ''}
                        {!source.isActive && <span className="ml-2 text-red-500">Inactive</span>}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )
        })}
      </main>
    </div>
  )
}

const PLATFORM_LABEL: Record<string, string> = {
  RSS: 'RSS Feeds',
  YOUTUBE: 'YouTube',
  TWITTER: 'Twitter / X',
  PODCAST: 'Podcasts',
  OTHER: 'Other',
}

const PLATFORM_ICON: Record<string, string> = {
  RSS: '📰',
  YOUTUBE: '▶️',
  TWITTER: '🐦',
  PODCAST: '🎙️',
  OTHER: '🔗',
}
