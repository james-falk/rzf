import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { ProGate } from '@/components/ProGate'
import { PlayerTradeValuesSection } from '@/components/PlayerTradeValuesSection'
import { PlayerNewsMentionCard } from '@/components/PlayerNewsMentionCard'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const player = await db.player.findUnique({ where: { sleeperId: id }, select: { firstName: true, lastName: true } })
  if (!player) return { title: 'Player Not Found' }
  return { title: `${player.firstName} ${player.lastName} — Red Zone Fantasy` }
}

function rankingSourceLabel(source: string): string {
  const m: Record<string, string> = {
    fantasypros: 'FantasyPros',
    espn: 'ESPN',
    sleeper_trending: 'Sleeper',
  }
  return m[source] ?? source
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

  const freeMentions = player.contentMentions.slice(0, 3)
  const proMentions = player.contentMentions.slice(3)

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
                      {rankingSourceLabel(r.source)}
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
                        · #{r.rankOverall} overall
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
              <div className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>Overall rank</div>
              <div className="mt-0.5 text-xs" style={{ color: 'rgb(163,163,163)' }}>
                {rankingSourceLabel(heroRank.source)}
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

        {freeMentions.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Recent news & analysis</h2>
            <p className="mb-4 text-xs" style={{ color: 'rgb(115,115,115)' }}>
              Logos use each source&apos;s avatar from Source Manager when set; otherwise a site favicon.
            </p>
            <div className="flex flex-col gap-3">
              {freeMentions.map(({ content }) => (
                <PlayerNewsMentionCard key={content.id} content={content} />
              ))}
            </div>
          </section>
        )}

        {(proMentions.length > 0 || player.projections.length > 0) && (
          <section className="mt-8">
            <ProGate
              preview={
                <div className="pointer-events-none flex flex-col gap-3">
                  {proMentions.slice(0, 2).map(({ content }) => (
                    <div key={content.id} className="rounded-xl border p-4" style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}>
                      <p className="font-medium text-white">{content.title}</p>
                      {content.summary && <p className="mt-1 text-sm line-clamp-1" style={{ color: 'rgb(115,115,115)' }}>{content.summary}</p>}
                    </div>
                  ))}
                </div>
              }
            >
              <h2 className="mb-4 text-lg font-bold text-white">More coverage</h2>
              <div className="flex flex-col gap-3">
                {proMentions.map(({ content }) => (
                  <PlayerNewsMentionCard key={content.id} content={content} />
                ))}
              </div>
            </ProGate>
          </section>
        )}

        {player.contentMentions.length === 0 && player.projections.length === 0 && (
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
