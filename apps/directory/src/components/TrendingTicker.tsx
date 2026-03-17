'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

interface TrendingPlayer {
  sleeperId: string
  firstName: string
  lastName: string
  position: string | null
  team: string | null
  count: number
}

const POSITION_COLOR: Record<string, string> = {
  QB: '#f87171',
  RB: '#4ade80',
  WR: '#60a5fa',
  TE: '#facc15',
  K: '#c084fc',
  DEF: '#2dd4bf',
}

export function TrendingTicker({ players }: { players: TrendingPlayer[] }) {
  if (players.length === 0) return null

  const [paused, setPaused] = useState(false)
  // Duplicate for seamless loop
  const doubled = [...players, ...players]

  return (
    <div
      className="border-b py-2 overflow-hidden"
      style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
    >
      <div className="flex items-center gap-3 px-4 mb-1.5">
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
        >
          🔥 Trending
        </span>
      </div>
      <div className="relative">
        <div
          className="flex gap-3 animate-ticker whitespace-nowrap"
          style={{ width: 'max-content', animationPlayState: paused ? 'paused' : 'running' }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {doubled.map((p, i) => (
            <Link
              key={`${p.sleeperId}-${i}`}
              href={`/players/${p.sleeperId}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2.5 text-xs font-medium transition hover:border-red-800/50 hover:bg-white/5"
              style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}
            >
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full bg-zinc-800">
                <Image
                  src={`https://sleepercdn.com/content/nfl/players/thumb/${p.sleeperId}.jpg`}
                  alt={`${p.firstName} ${p.lastName}`}
                  fill
                  className="object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  unoptimized
                />
              </div>
              <span style={{ color: p.position ? (POSITION_COLOR[p.position] ?? 'rgb(163,163,163)') : 'rgb(163,163,163)' }}>
                {p.position}
              </span>
              <span className="text-white">{p.firstName} {p.lastName}</span>
              {p.team && <span style={{ color: 'rgb(115,115,115)' }}>{p.team}</span>}
              <span style={{ color: 'rgb(220,38,38)' }}>+{p.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
