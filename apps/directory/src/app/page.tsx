import Link from 'next/link'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { TrendingTicker } from '@/components/TrendingTicker'
import { ContentFeed } from '@/components/ContentFeed'
import { ContentCard } from '@/components/ContentCard'

async function getData() {
  try {
  const [trendingRaw, featuredSources, latestContent] = await Promise.all([
    // Top 20 trending players (last 48h, skip inactive)
    db.trendingPlayer.findMany({
      where: {
        fetchedAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        player: { status: { not: 'Inactive' } },
      },
      distinct: ['playerId'],
      include: {
        player: { select: { sleeperId: true, firstName: true, lastName: true, position: true, team: true } },
      },
      orderBy: { count: 'desc' },
      take: 20,
    }),

    // Featured / partner sources
    db.contentSource.findMany({
      where: { featured: true, isActive: true },
      orderBy: [{ partnerTier: 'asc' }, { name: 'asc' }],
      take: 6,
    }),

    // Latest content items with source + player mentions
    db.contentItem.findMany({
      where: {
        source: { isActive: true },
        publishedAt: { not: null },
      },
      include: {
        source: {
          select: { name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
        },
        playerMentions: {
          include: {
            player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } },
          },
          take: 6,
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    }),
  ])

  const trending = (trendingRaw as Array<typeof trendingRaw[0] & { player: { sleeperId: string; firstName: string; lastName: string; position: string | null; team: string | null } }>).map((t) => ({ ...t.player, count: t.count }))

  // Separate featured content (from partner sources) for the featured section
  const featuredSourceNames = new Set(featuredSources.map((s) => s.name))
  const featuredContent = latestContent.filter((item) => item.source && featuredSourceNames.has(item.source.name)).slice(0, 3)
  const regularContent = latestContent.filter((item) => !featuredContent.includes(item))

  return { trending, featuredContent, featuredSources, regularContent }
  } catch {
    // DB unavailable during build or missing migration — return empty state
    return { trending: [], featuredContent: [], featuredSources: [], regularContent: [] }
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { trending, featuredContent, featuredSources, regularContent } = await getData()

  return (
    <div className="relative min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />

      {/* Trending ticker */}
      {trending.length > 0 && <TrendingTicker players={trending} />}

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-16 md:py-20">
        {/* Background glow */}
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(220,38,38), transparent)' }}
        />
        <div className="relative text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wider"
            style={{ borderColor: 'rgba(220,38,38,0.4)', color: 'rgb(220,38,38)', background: 'rgba(220,38,38,0.08)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: 'rgb(220,38,38)' }} />
            Live NFL Intelligence Hub
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white md:text-6xl">
            Red Zone{' '}
            <span style={{ color: 'rgb(220,38,38)' }}>Fantasy</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed md:text-lg" style={{ color: 'rgb(163,163,163)' }}>
            Every ranking, injury report, trade value, and expert take — aggregated from the web&apos;s best fantasy football sources in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="rounded-lg px-6 py-3 font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ background: 'rgb(220,38,38)', boxShadow: '0 0 20px rgba(220,38,38,0.25)' }}
            >
              Search Players
            </Link>
            <Link
              href="/sources"
              className="rounded-lg border px-6 py-3 font-semibold text-white transition-all hover:bg-white/5"
              style={{ borderColor: 'rgb(38,38,38)' }}
            >
              Browse Sources
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x md:grid-cols-4" style={{ borderColor: 'rgb(38,38,38)' }}>
          {[
            { value: '1,500+', label: 'NFL Players' },
            { value: `${trending.length}`, label: 'Trending Now' },
            { value: 'Live', label: 'Injury Reports' },
            { value: 'Weekly', label: 'Ranking Updates' },
          ].map(({ value, label }) => (
            <div key={label} className="px-6 py-5 text-center" style={{ borderColor: 'rgb(38,38,38)' }}>
              <div className="text-xl font-bold text-white md:text-2xl">{value}</div>
              <div className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured partner content */}
      {featuredContent.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Featured</h2>
              <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
                Highlighted content from partner sources
              </p>
            </div>
            {featuredSources.length > 0 && (
              <Link href="/sources" className="text-sm transition hover:text-white" style={{ color: 'rgb(220,38,38)' }}>
                All sources →
              </Link>
            )}
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredContent.map((item) => (
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
              />
            ))}
          </div>
        </section>
      )}

      {/* Latest news feed */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Latest Fantasy Content</h2>
          <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            Updated continuously from {featuredSources.length > 0 ? 'all tracked sources' : 'top fantasy sources'}
          </p>
        </div>
        {regularContent.length > 0 ? (
          <ContentFeed items={regularContent.map((item) => ({
            id: item.id,
            title: item.title,
            summary: item.summary,
            thumbnailUrl: item.thumbnailUrl,
            sourceUrl: item.sourceUrl,
            publishedAt: item.publishedAt,
            contentType: item.contentType,
            authorName: item.authorName,
            source: item.source,
            playerMentions: item.playerMentions,
          }))} />
        ) : (
          <div
            className="rounded-xl border py-16 text-center"
            style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
          >
            <div className="text-4xl">📡</div>
            <p className="mt-3 font-medium text-white">Content ingestion in progress</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
              New articles and videos will appear here as they&apos;re indexed.
            </p>
          </div>
        )}
      </section>

      {/* RosterMind CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div
          className="relative overflow-hidden rounded-2xl border p-8 text-center"
          style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(220,38,38,0.15), transparent 70%)' }}
          />
          <div className="relative">
            <div className="mb-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'rgb(220,38,38)' }}>
              Powered by this data
            </div>
            <h3 className="text-2xl font-bold text-white">Meet RosterMind AI</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm" style={{ color: 'rgb(163,163,163)' }}>
              Your personal fantasy football AI — trained on every source in this directory.
              Get personalized lineup advice, waiver wire picks, and trade analysis.
            </p>
            <a
              href={process.env.NEXT_PUBLIC_ROSTERMIND_URL ?? 'https://rostermind.vercel.app'}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'rgb(220,38,38)' }}
            >
              Try RosterMind AI →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
