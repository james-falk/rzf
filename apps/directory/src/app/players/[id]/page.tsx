import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
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
    },
  })

  if (!player) notFound()

  const latestRanking = player.rankings[0]

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Player header */}
        <div
          className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border p-6"
          style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest" style={{ color: 'rgb(115,115,115)' }}>
              {player.team} · {player.position}
            </div>
            <h1 className="mt-1 text-4xl font-extrabold text-white">
              {player.firstName} {player.lastName}
            </h1>
            {player.status && player.status !== 'Active' && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: 'rgba(239,68,68,0.3)', color: 'rgb(239,68,68)', background: 'rgba(239,68,68,0.08)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {player.status}
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

        {/* Projections */}
        {player.projections.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Projections</h2>
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'rgb(38,38,38)' }}>
                    {['Week', 'Points', 'Source'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'rgb(115,115,115)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {player.projections.map((proj) => (
                    <tr key={proj.id} className="border-b last:border-0" style={{ borderColor: 'rgb(26,26,26)' }}>
                      <td className="px-4 py-2.5 text-white">Week {proj.week}</td>
                      <td className="px-4 py-2.5 font-medium" style={{ color: 'rgb(220,38,38)' }}>
                        {proj.fpts.toFixed(1)}
                      </td>
                      <td className="px-4 py-2.5" style={{ color: 'rgb(115,115,115)' }}>{proj.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Recent content */}
        {player.contentMentions.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold text-white">Recent News & Analysis</h2>
            <div className="flex flex-col gap-3">
              {player.contentMentions.map(({ content }) => (
                <a
                  key={content.id}
                  href={content.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
                  style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                        <span>{content.source?.name ?? 'Unknown'}</span>
                        {content.publishedAt && (
                          <>
                            <span>·</span>
                            <span>{new Date(content.publishedAt).toLocaleDateString()}</span>
                          </>
                        )}
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] uppercase font-medium"
                          style={{ background: 'rgb(26,26,26)', color: 'rgb(163,163,163)' }}
                        >
                          {content.contentType}
                        </span>
                      </div>
                      <p className="mt-1 font-medium text-white group-hover:text-red-400 transition-colors line-clamp-1">
                        {content.title}
                      </p>
                      {content.summary && (
                        <p className="mt-1 text-sm line-clamp-2" style={{ color: 'rgb(115,115,115)' }}>
                          {content.summary}
                        </p>
                      )}
                    </div>
                    {content.thumbnailUrl && (
                      <img
                        src={content.thumbnailUrl}
                        alt=""
                        className="h-16 w-24 flex-shrink-0 rounded-lg object-cover"
                      />
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {player.contentMentions.length === 0 && player.projections.length === 0 && (
          <div className="mt-8 rounded-xl border py-12 text-center" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
            <div className="text-3xl">📡</div>
            <p className="mt-3 font-medium text-white">No data yet</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
              Content connectors are being configured. Check back soon.
            </p>
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
