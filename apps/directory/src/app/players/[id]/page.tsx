import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@rzf/db'
import { rankingSourceMeta } from '@rzf/shared'
import Navbar from '@/components/Navbar'
import { PlayerTradeValuesSection } from '@/components/PlayerTradeValuesSection'
import { PlayerMentionsSection } from '@/components/PlayerMentionsSection'
import { encodeMentionCursor } from '@/lib/mention-cursor'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const player = await db.player.findUnique({ where: { sleeperId: id }, select: { firstName: true, lastName: true } })
  if (!player) return { title: 'Player Not Found' }
  return { title: `${player.firstName} ${player.lastName} — Red Zone Fantasy` }
}

export default async function PlayerPage({ params }: Props) {
  const { id } = await params

  const player = await db.player.findUnique({
    where: { sleeperId: id },
    include: {
      rankings: { orderBy: [{ season: 'desc' }, { week: 'desc' }], take: 40 },
      projections: { orderBy: { week: 'asc' }, take: 10 },
      contentMentions: {
        include: { content: { include: { source: true } } },
        orderBy: { content: { publishedAt: 'desc' } },
        take: 20,
      },
      tradeValues: { orderBy: { fetchedAt: 'desc' }, take: 20 },
    },
  })

  if (!player) notFound()

  const mentionRows = player.contentMentions
  const serializedMentions = mentionRows.map(({ content }) => ({
    id: content.id,
    title: content.title,
    summary: content.summary,
    sourceUrl: content.sourceUrl,
    publishedAt: content.publishedAt?.toISOString() ?? null,
    thumbnailUrl: content.thumbnailUrl,
    source: content.source
      ? {
          name: content.source.name,
          avatarUrl: content.source.avatarUrl,
          feedUrl: content.source.feedUrl,
        }
      : null,
  }))
  const lastMention = mentionRows[mentionRows.length - 1]
  const mentionsNextCursor =
    mentionRows.length === 20 && lastMention?.content.publishedAt
      ? encodeMentionCursor(lastMention.content.publishedAt, lastMention.contentId)
      : null

  const recentTrades = await db.$queryRaw<
    Array<{ id: string; week: number; season: string; leagueId: string; createdAt: Date }>
  >`
    SELECT id, week, season, "leagueId", "createdAt"
    FROM trade_transactions
    WHERE adds::jsonb ? ${id} OR drops::jsonb ? ${id}
    ORDER BY "createdAt" DESC
    LIMIT 12
  `

  const rankingsSorted = player.rankings
  const top = rankingsSorted[0]
  const latestWeekRankings = top
    ? rankingsSorted.filter((r) => r.season === top.season && r.week === top.week)
    : []
  const fpRank = latestWeekRankings.find((r) => r.source === 'fantasypros')
  const heroRank = fpRank ?? latestWeekRankings[0]
  const otherWeekRankings = heroRank
    ? latestWeekRankings.filter((r) => r.id !== heroRank.id)
    : []

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">

        {/* Player header */}
        <div
          className="flex flex-wrap items-start gap-6 rounded-2xl border p-6"
          style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
        >
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-800">
            <Image
              src={`https://sleepercdn.com/content/nfl/players/${player.sleeperId}.jpg`}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className="object-cover"
              unoptimized
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'rgb(115,115,115)' }}>
              {player.team} · {player.position}
              {player.age && <span>· Age {player.age}</span>}
            </div>
            <h1 className="mt-1 text-3xl font-extrabold text-white md:text-4xl">
              {player.firstName} {player.lastName}
            </h1>
            {player.status && player.status !== 'Active' && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgb(239,68,68)', background: 'rgba(239,68,68,0.08)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {player.injuryStatus ?? player.status}
              </div>
            )}

            {otherWeekRankings.length > 0 && top && (
              <div className="mt-4 flex flex-wrap gap-2">
                {otherWeekRankings.map((r) => (
                  <div
                    key={`${r.source}-${r.id}`}
                    className="rounded-lg border px-3 py-2 text-left"
                    style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'rgb(115,115,115)' }}>
                      {rankingSourceMeta(r.source).label}
                    </div>
                    <div className="text-sm font-bold text-white">
                      {r.posRank ? (
                        <span>{r.posRank}</span>
                      ) : (
                        <span>
                          {player.position}
                          {r.rankPosition}
                        </span>
                      )}
                      <span className="ml-1.5 text-xs font-normal" style={{ color: 'rgb(115,115,115)' }}>
                        · #
                        {r.rankOverall}{' '}
                        {rankingSourceMeta(r.source).kind === 'adp' ? 'ADP' : 'overall'}
                      </span>
                    </div>
                    <div className="text-[10px]" style={{ color: 'rgb(82,82,91)' }}>
                      Week {r.week} · {r.season}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {heroRank && (
            <div className="rounded-xl border px-6 py-4 text-center" style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}>
              <div className="text-4xl font-extrabold" style={{ color: 'rgb(220,38,38)' }}>
                #{heroRank.rankOverall}
              </div>
              <div className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                {rankingSourceMeta(heroRank.source).kind === 'adp' ? 'Avg draft position' : 'Expert consensus rank'}
              </div>
              <div className="mt-0.5 text-xs" style={{ color: 'rgb(163,163,163)' }}>
                {rankingSourceMeta(heroRank.source).label}
                {heroRank.posRank && ` · ${heroRank.posRank}`}
                {!heroRank.posRank && (
                  <>
                    {' '}
                    · {player.position}
                    {heroRank.rankPosition}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {recentTrades.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-bold text-white">Recent trades (league aggregate)</h2>
            <p className="mb-3 text-xs" style={{ color: 'rgb(115,115,115)' }}>
              Observed Sleeper trades across linked leagues where this player moved. No user-identifying data.
            </p>
            <ul className="space-y-2 text-sm text-zinc-300">
              {recentTrades.map((t) => (
                <li
                  key={t.id}
                  className="rounded-lg border px-3 py-2"
                  style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
                >
                  Week {t.week} · Season {t.season} · {t.createdAt.toLocaleDateString()}
                </li>
              ))}
            </ul>
          </section>
        )}

        {player.tradeValues.length > 0 && (
          <PlayerTradeValuesSection
            rows={player.tradeValues.map((tv) => ({
              id: tv.id,
              source: tv.source,
              dynasty1qb: tv.dynasty1qb,
              dynastySf: tv.dynastySf,
              redraft: tv.redraft,
              trend30d: tv.trend30d,
            }))}
          />
        )}

        <PlayerMentionsSection
          sleeperId={player.sleeperId}
          initialItems={serializedMentions}
          initialNextCursor={mentionsNextCursor}
        />

        {mentionRows.length === 0 && player.projections.length === 0 && (
          <div className="mt-8 rounded-xl border py-12 text-center" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
            <div className="text-3xl">📡</div>
            <p className="mt-3 font-medium text-white">No data yet</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>Content is being indexed. Check back soon.</p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/search" className="text-sm transition-colors hover:text-white" style={{ color: 'rgb(115,115,115)' }}>
            ← Back to search
          </Link>
        </div>
      </main>
    </div>
  )
}
