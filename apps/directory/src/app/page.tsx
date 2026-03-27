import { Suspense } from 'react'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { TrendingTicker } from '@/components/TrendingTicker'
import { FeedWithFilters } from '@/components/FeedWithFilters'
import { FeaturedContentCarousel } from '@/components/FeaturedContentCarousel'
import { getTrendingTopics } from '@/lib/getTrendingTopics'
import { encodeFeedCursor, FEED_PAGE_SIZE } from '@/lib/feed-cursor'

const contentInclude = {
  source: {
    select: { id: true, name: true, platform: true, feedUrl: true, avatarUrl: true, featured: true, partnerTier: true },
  },
  playerMentions: {
    include: {
      player: { select: { sleeperId: true, firstName: true, lastName: true, position: true } },
    },
    take: 6,
  },
}

async function getData() {
  try {
  const [trendingRaw, featuredSources, allSources, trendingTopics] = await Promise.all([
    // Trending players (last 48h, skip inactive) — fetch extra to dedup in JS
    db.trendingPlayer.findMany({
      where: {
        fetchedAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
        player: { status: { not: 'Inactive' } },
      },
      include: {
        player: { select: { sleeperId: true, firstName: true, lastName: true, position: true, team: true } },
      },
      orderBy: { count: 'desc' },
      take: 200,
    }),

    // Featured / partner sources
    db.contentSource.findMany({
      where: { featured: true, isActive: true },
      orderBy: [{ partnerTier: 'asc' }, { name: 'asc' }],
      take: 6,
    }),

    // All active sources for sidebar filter
    db.contentSource.findMany({
      where: { isActive: true },
      select: { id: true, name: true, platform: true, avatarUrl: true, feedUrl: true },
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    }),

    getTrendingTopics(),
  ])

  const featuredSourceIds = featuredSources.map((s) => s.id)

  const [featuredCarouselItems, latestContent] = await Promise.all([
    featuredSourceIds.length === 0
      ? Promise.resolve([])
      : db.contentItem.findMany({
          where: {
            sourceId: { in: featuredSourceIds },
            publishedAt: { not: null },
            source: { isActive: true },
          },
          include: contentInclude,
          orderBy: { publishedAt: 'desc' },
          take: 12,
        }),
    db.contentItem.findMany({
      where: {
        source: { isActive: true },
        publishedAt: { not: null },
      },
      include: contentInclude,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      take: FEED_PAGE_SIZE,
    }),
  ])

  // Deduplicate by sleeperId in JS — Prisma's distinct+orderBy combo doesn't
  // reliably deduplicate when ordering by a column other than the distinct column.
  const seen = new Set<string>()
  const trending = (trendingRaw as Array<typeof trendingRaw[0] & { player: { sleeperId: string; firstName: string; lastName: string; position: string | null; team: string | null } }>)
    .filter((t) => {
      if (seen.has(t.player.sleeperId)) return false
      seen.add(t.player.sleeperId)
      return true
    })
    .slice(0, 20)
    .map((t) => ({ ...t.player, count: t.count }))

  const featuredContent = featuredCarouselItems
  const featuredIds = new Set(featuredContent.map((item) => item.id))
  const regularContent = latestContent.filter((item) => !featuredIds.has(item.id))

  const last = latestContent[latestContent.length - 1]
  const feedNextCursor =
    latestContent.length === FEED_PAGE_SIZE && last?.publishedAt
      ? encodeFeedCursor(last.publishedAt, last.id)
      : null

  return { trending, featuredContent, featuredSources, regularContent, allSources, trendingTopics, feedNextCursor }
  } catch {
    // DB unavailable during build or missing migration — return empty state
    return {
      trending: [],
      featuredContent: [],
      featuredSources: [],
      regularContent: [],
      allSources: [],
      trendingTopics: [],
      feedNextCursor: null,
    }
  }
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { trending, featuredContent, featuredSources, regularContent, allSources, trendingTopics, feedNextCursor } =
    await getData()

  // Get user tier for upgrade gate in custom feeds tab
  const { userId: clerkId } = await auth()
  let userTier: string | null = null
  if (clerkId) {
    try {
      const user = await db.user.findUnique({ where: { clerkId }, select: { tier: true } })
      userTier = user?.tier ?? 'free'
    } catch { /* ignore */ }
  }

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

      {/* Featured partner carousel (before main feed) */}
      {featuredContent.length > 0 && (
        <>
          <FeaturedContentCarousel
            slides={featuredContent.map((item) => ({
              id: item.id,
              title: item.title,
              summary: item.summary,
              thumbnailUrl: item.thumbnailUrl,
              sourceUrl: item.sourceUrl,
              contentType: item.contentType,
              sourceName: item.source?.name ?? null,
            }))}
          />
          {featuredSources.length > 0 && (
            <div className="mx-auto max-w-7xl px-4 pb-4 text-center">
              <Link href="/sources" className="text-sm transition hover:text-white" style={{ color: 'rgb(220,38,38)' }}>
                All partner sources →
              </Link>
            </div>
          )}
        </>
      )}

      {/* Content feed with sidebar filters + custom feeds tab */}
      <section id="feed" className="mx-auto max-w-7xl px-4 py-12">
        <Suspense
          fallback={
            <div className="animate-pulse rounded-xl border py-24 text-center text-sm" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)', color: 'rgb(115,115,115)' }}>
              Loading feed…
            </div>
          }
        >
          <FeedWithFilters
            items={regularContent.map((item) => ({
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
              topics: item.topics ?? [],
            }))}
            initialFeedNextCursor={feedNextCursor}
            sources={allSources}
            userTier={userTier}
            trendingTopics={trendingTopics}
          />
        </Suspense>
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
