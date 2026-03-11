import Navbar from '@/components/Navbar'
import PlayerSearchClient from './PlayerSearchClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Player Search — Red Zone Fantasy',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Player Search</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            Search across rankings, projections, and news for any NFL player
          </p>
        </div>
        <PlayerSearchClient />
      </main>
    </div>
  )
}
