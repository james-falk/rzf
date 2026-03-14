import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { RankingsClient } from './RankingsClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fantasy Rankings — Red Zone Fantasy',
  description: 'A curated directory of the best fantasy football ranking sites — redraft, dynasty, DFS, best ball, and more.',
}

export default async function RankingsPage() {
  const sites = await db.rankingSite.findMany({
    where: { isActive: true },
    orderBy: [{ featured: 'desc' }, { popularityScore: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Rankings Directory</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            {sites.length} curated ranking sites across all fantasy formats
          </p>
        </div>
        <RankingsClient sites={sites} />
      </main>
    </div>
  )
}
