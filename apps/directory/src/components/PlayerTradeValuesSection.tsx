'use client'

import { useMemo, useState } from 'react'
import { getTradeValueSourceLabel, sortTradeValueRows } from '@/lib/tradeValueSources'

export type TradeValueRow = {
  id: string
  source: string
  dynasty1qb: number | null
  dynastySf: number | null
  redraft: number | null
  trend30d: number | null
}

type LeagueMode = 'dynasty' | 'redraft'
type DynastyFormat = '1qb' | 'sf'

export function PlayerTradeValuesSection({ rows }: { rows: TradeValueRow[] }) {
  const sorted = useMemo(() => sortTradeValueRows(rows), [rows])
  const [leagueMode, setLeagueMode] = useState<LeagueMode>('dynasty')
  const [dynastyFormat, setDynastyFormat] = useState<DynastyFormat>('1qb')

  const hasAnyRedraft = sorted.some((r) => r.redraft != null)

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Trade values</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: 'rgb(115,115,115)' }}>
            Each card is a separate market index (not only Dynasty Daddy). KTC and FantasyCalc also include redraft
            where available.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex rounded-lg p-0.5"
            style={{ background: 'rgb(18,18,18)', border: '1px solid rgb(38,38,38)' }}
          >
            <button
              type="button"
              onClick={() => setLeagueMode('dynasty')}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              style={
                leagueMode === 'dynasty'
                  ? { background: 'rgb(220,38,38)', color: 'white' }
                  : { color: 'rgb(115,115,115)' }
              }
            >
              Dynasty
            </button>
            <button
              type="button"
              onClick={() => setLeagueMode('redraft')}
              disabled={!hasAnyRedraft}
              className="rounded-md px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={
                leagueMode === 'redraft'
                  ? { background: 'rgb(220,38,38)', color: 'white' }
                  : { color: 'rgb(115,115,115)' }
              }
            >
              Redraft
            </button>
          </div>
          {leagueMode === 'dynasty' && (
            <div
              className="inline-flex rounded-lg p-0.5"
              style={{ background: 'rgb(18,18,18)', border: '1px solid rgb(38,38,38)' }}
            >
              <button
                type="button"
                onClick={() => setDynastyFormat('1qb')}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={
                  dynastyFormat === '1qb'
                    ? { background: 'rgb(63,63,63)', color: 'white' }
                    : { color: 'rgb(115,115,115)' }
                }
              >
                1 QB
              </button>
              <button
                type="button"
                onClick={() => setDynastyFormat('sf')}
                className="rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={
                  dynastyFormat === 'sf'
                    ? { background: 'rgb(63,63,63)', color: 'white' }
                    : { color: 'rgb(115,115,115)' }
                }
              >
                Superflex
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((tv) => {
          const { title, subtitle } = getTradeValueSourceLabel(tv.source)
          let value: number | null = null
          let valueLabel = ''

          if (leagueMode === 'redraft') {
            value = tv.redraft
            valueLabel = 'Redraft'
          } else {
            value = dynastyFormat === '1qb' ? tv.dynasty1qb : tv.dynastySf
            valueLabel = dynastyFormat === '1qb' ? 'Dynasty · 1 QB' : 'Dynasty · Superflex'
          }

          const empty = value == null
          const displayVal = value != null ? value.toLocaleString() : '—'

          return (
            <div
              key={tv.id}
              className="flex flex-col rounded-xl border p-4 text-left transition-colors hover:border-red-900/40"
              style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
            >
              <div className="mb-2">
                <p className="text-sm font-semibold text-white">{title}</p>
                {subtitle && <p className="mt-0.5 text-[10px] leading-snug" style={{ color: 'rgb(115,115,115)' }}>{subtitle}</p>}
              </div>
              <div
                className={`text-3xl font-bold tabular-nums ${empty ? 'text-zinc-600' : 'text-white'}`}
              >
                {displayVal}
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wide" style={{ color: 'rgb(82,82,91)' }}>
                {valueLabel}
              </p>
              {tv.trend30d != null && !empty && leagueMode === 'dynasty' && (
                <p
                  className="mt-2 text-xs font-medium"
                  style={{ color: tv.trend30d >= 0 ? 'rgb(74,222,128)' : 'rgb(248,113,113)' }}
                >
                  {tv.trend30d >= 0 ? '+' : ''}
                  {tv.trend30d} vs 30d
                </p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
