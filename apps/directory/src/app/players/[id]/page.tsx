import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { ProGate } from '@/components/ProGate'
import type { Metadata } from 'next'

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
      rankings: { orderBy: { week: 'asc' }, take: 10 },
      projections: { orderBy: { week: 'asc' }, take: 10 },
      contentMentions: {
        include: { content: { include: { source: true } } },
        orderBy: { content: { publishedAt: 'desc' } },
        take: 20,
      },
      tradeValues: { orderBy: { fetchedAt: 'desc' }, take: 3 },
    },
  })

  if (!player) notFound()

  const latestRanking = player.rankings[0]
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
          {/* Sleeper headshot */}
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
          </div>

          {latestRanking && (
            <div className="rounded-xl border px-6 py-4 text-center" style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.05)' }}>
              <div className="text-4xl font-extrabold" style={{ color: 'rgb(220,38,38)' }}>
                #{latestRanking.rankOverall}
              </div>
              <div className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>Overall Rank</div>
              <div className="mt-0.5 text-xs" style={{ color: 'rgb(163,163,163)' }}>
                {player.position}{latestRanking.rankPosition}
              </div>
            </div>
          )}
        </div>

        {/* Trade values (free) */}
        {player.tradeValues.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Trade Values</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {player.tradeValues.map((tv) => {
                const vals = [
                  tv.dynasty1qb != null && { label: 'Dynasty 1QB', val: tv.dynasty1qb },
                  tv.dynastySf != null && { label: 'Dynasty SF', val: tv.dynastySf },
                  tv.redraft != null && { label: 'Redraft', val: tv.redraft },
                ].filter(Boolean) as Array<{ label: string; val: number }>
                return vals.map(({ label, val }) => (
                  <div key={`${tv.id}-${label}`} className="rounded-xl border p-4 text-center" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}>
                    <div className="text-2xl font-bold text-white">{val}</div>
                    <div className="mt-1 text-xs capitalize" style={{ color: 'rgb(115,115,115)' }}>{label}</div>
                    <div className="text-[10px]" style={{ color: 'rgb(82,82,91)' }}>{tv.source}</div>
                  </div>
                ))
              })}
            </div>
          </section>
        )}

        {/* Free content (3 items) */}
        {freeMentions.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Recent News & Analysis</h2>
            <div className="flex flex-col gap-3">
              {freeMentions.map(({ content }) => (
                <a
                  key={content.id}
                  href={content.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
                  style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                        <span>{content.source?.name ?? 'Unknown'}</span>
                        {content.publishedAt && (
                          <><span>·</span><span>{new Date(content.publishedAt).toLocaleDateString()}</span></>
                        )}
                      </div>
                      <p className="mt-1 font-medium text-white transition-colors group-hover:text-red-400 line-clamp-1">
                        {content.title}
                      </p>
                      {content.summary && (
                        <p className="mt-1 text-sm line-clamp-2" style={{ color: 'rgb(115,115,115)' }}>
                          {content.summary}
                        </p>
                      )}
                    </div>
                    {content.thumbnailUrl && (
                      <img src={content.thumbnailUrl} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Pro-gated: more content + projections */}
        {(proMentions.length > 0 || player.projections.length > 0) && (
          <section className="mt-8">
            <ProGate
              preview={
                <div className="flex flex-col gap-3 pointer-events-none">
                  {proMentions.slice(0, 2).map(({ content }) => (
                    <div key={content.id} className="rounded-xl border p-4" style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}>
                      <p className="font-medium text-white">{content.title}</p>
                      {content.summary && <p className="mt-1 text-sm line-clamp-1" style={{ color: 'rgb(115,115,115)' }}>{content.summary}</p>}
                    </div>
                  ))}
                </div>
              }
            >
              <div className="flex flex-col gap-3">
                {proMentions.map(({ content }) => (
                  <a
                    key={content.id}
                    href={content.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
                    style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                          <span>{content.source?.name ?? 'Unknown'}</span>
                          {content.publishedAt && (
                            <><span>·</span><span>{new Date(content.publishedAt).toLocaleDateString()}</span></>
                          )}
                        </div>
                        <p className="mt-1 font-medium text-white transition-colors group-hover:text-red-400 line-clamp-1">
                          {content.title}
                        </p>
                        {content.summary && (
                          <p className="mt-1 text-sm line-clamp-2" style={{ color: 'rgb(115,115,115)' }}>{content.summary}</p>
                        )}
                      </div>
                      {content.thumbnailUrl && (
                        <img src={content.thumbnailUrl} alt="" className="h-16 w-24 flex-shrink-0 rounded-lg object-cover" />
                      )}
                    </div>
                  </a>
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
