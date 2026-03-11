'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF']

type PlayerResult = {
  sleeperId: string
  firstName: string
  lastName: string
  position: string
  team: string | null
  status: string
}

export default function PlayerSearchClient() {
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState('All')
  const [results, setResults] = useState<PlayerResult[]>([])
  const [isPending, startTransition] = useTransition()
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2 && position === 'All') {
      setResults([])
      setHasSearched(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      startTransition(async () => {
        try {
          const params = new URLSearchParams()
          if (q) params.set('q', q)
          if (position !== 'All') params.set('pos', position)

          const res = await fetch(`/api/players/search?${params}`, { signal: controller.signal })
          if (!res.ok) throw new Error('Search failed')
          const data = await res.json()
          setResults(data.players ?? [])
          setHasSearched(true)
        } catch {
          // ignore abort errors
        }
      })
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, position])

  return (
    <div>
      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: 'rgb(115,115,115)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search players (e.g. Justin Jefferson)"
            className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
            style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
          />
        </div>

        {/* Position filter */}
        <div className="flex gap-1.5 flex-wrap">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosition(pos)}
              className="rounded-md px-3 py-2 text-sm font-medium transition-all"
              style={
                position === pos
                  ? { background: 'rgb(220,38,38)', color: 'white' }
                  : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
              }
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {isPending && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            <div className="h-3 w-3 rounded-full border border-red-600 border-t-transparent animate-spin" />
            Searching...
          </div>
        )}

        {!isPending && hasSearched && results.length === 0 && (
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
            No players found. Try a different name or position.
          </p>
        )}

        {!isPending && results.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((player) => (
              <Link
                key={player.sleeperId}
                href={`/players/${player.sleeperId}`}
                className="group rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
                style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white group-hover:text-red-400 transition-colors">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                      {player.team ?? '—'} · {player.position ?? '—'}
                    </p>
                  </div>
                  {player.position && (
                    <span
                      className="rounded px-1.5 py-0.5 text-xs font-bold"
                      style={{
                        background: POSITION_BG[player.position] ?? 'rgba(115,115,115,0.15)',
                        color: POSITION_COLOR[player.position] ?? 'rgb(163,163,163)',
                      }}
                    >
                      {player.position}
                    </span>
                  )}
                </div>
                {player.status !== 'Active' && player.status !== 'active' && (
                  <div className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'rgb(239,68,68)' }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    {player.status}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {!hasSearched && !isPending && (
          <div className="rounded-xl border py-16 text-center" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
            <div className="text-4xl">🏈</div>
            <p className="mt-3 font-medium text-white">Start typing to search</p>
            <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
              Search by name or filter by position
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const POSITION_BG: Record<string, string> = {
  QB: 'rgba(239,68,68,0.15)',
  RB: 'rgba(34,197,94,0.15)',
  WR: 'rgba(59,130,246,0.15)',
  TE: 'rgba(234,179,8,0.15)',
  K: 'rgba(168,85,247,0.15)',
  DEF: 'rgba(20,184,166,0.15)',
}

const POSITION_COLOR: Record<string, string> = {
  QB: 'rgb(252,165,165)',
  RB: 'rgb(134,239,172)',
  WR: 'rgb(147,197,253)',
  TE: 'rgb(253,224,71)',
  K: 'rgb(216,180,254)',
  DEF: 'rgb(94,234,212)',
}
