'use client'

import { cn } from '@/lib/utils'
import type { PlayerCompareOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

const WIN_MARGIN_STYLES = {
  clear: { label: 'Clear Winner', bg: 'bg-indigo-500/10 border-indigo-500/30', text: 'text-indigo-300' },
  slight: { label: 'Slight Edge', bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-300' },
  even: { label: 'Essentially Even', bg: 'bg-zinc-700/40 border-white/10', text: 'text-zinc-300' },
}

const TREND_BADGE: Record<string, { label: string; cls: string }> = {
  rising: { label: 'Rising', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  falling: { label: 'Falling', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  stable: { label: 'Stable', cls: 'text-zinc-400 bg-zinc-700/40 border-white/10' },
  unknown: { label: 'Unknown', cls: 'text-zinc-500 bg-zinc-800 border-white/5' },
}

export function PlayerCompareResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: PlayerCompareOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result
  const margin = WIN_MARGIN_STYLES[output.winMargin]

  return (
    <div className="space-y-6">
      {/* Winner banner */}
      <div className={cn('rounded-xl border p-5', margin.bg)}>
        <div className="mb-1 flex items-center gap-2">
          <span className={cn('text-xs font-semibold uppercase tracking-wider', margin.text)}>{margin.label}</span>
        </div>
        {output.winnerName ? (
          <h2 className="text-xl font-bold text-white">{output.winnerName}</h2>
        ) : (
          <h2 className="text-xl font-bold text-white">Too Close to Call</h2>
        )}
        <p className="mt-2 text-sm text-zinc-300">{output.verdict}</p>
      </div>

      {/* Side-by-side player cards */}
      <div className={cn('grid gap-4', output.players.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-2')}>
        {output.players.map((player) => {
          const isWinner = player.playerId === output.winnerId
          const trend = TREND_BADGE[player.trend] ?? TREND_BADGE.unknown

          return (
            <div
              key={player.playerId}
              className={cn(
                'relative rounded-xl border p-4 space-y-3 transition',
                isWinner
                  ? 'border-indigo-500/40 bg-indigo-500/5 ring-1 ring-indigo-500/20'
                  : 'border-white/10 bg-zinc-900',
              )}
            >
              {isWinner && (
                <div className="absolute -top-2 right-3 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  WINNER
                </div>
              )}

              {/* Header */}
              <div>
                <p className="text-base font-bold text-white">{player.playerName}</p>
                <p className="text-xs text-zinc-400">
                  {player.position}{player.team ? ` — ${player.team}` : ''}
                  {player.injuryStatus && <span className="ml-1.5 text-yellow-500">({player.injuryStatus})</span>}
                </p>
              </div>

              {/* Value stats */}
              <div className="grid grid-cols-2 gap-2">
                {player.dynastyPositionRank != null && (
                  <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-zinc-500">Dynasty Rank</p>
                    <p className="text-sm font-bold text-white">{player.position}#{player.dynastyPositionRank}</p>
                  </div>
                )}
                {player.dynastyRank != null && (
                  <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-zinc-500">Overall</p>
                    <p className="text-sm font-bold text-white">#{player.dynastyRank}</p>
                  </div>
                )}
                {player.dynastyValue != null && (
                  <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-center">
                    <p className="text-[10px] text-zinc-500">KTC Value</p>
                    <p className="text-sm font-bold text-white">{player.dynastyValue.toLocaleString()}</p>
                  </div>
                )}
                <div className="rounded-lg bg-zinc-800 px-2 py-1.5 text-center">
                  <p className="text-[10px] text-zinc-500">Trend</p>
                  <p className={cn('text-xs font-semibold', trend.cls.split(' ')[0])}>{trend.label}</p>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs leading-relaxed text-zinc-400">{player.summary}</p>

              {/* Pros / Cons */}
              {(player.pros.length > 0 || player.cons.length > 0) && (
                <div className="space-y-1.5">
                  {player.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-[10px] font-bold text-emerald-500">+</span>
                      <span className="text-xs text-zinc-300">{pro}</span>
                    </div>
                  ))}
                  {player.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-[10px] font-bold text-rose-500">−</span>
                      <span className="text-xs text-zinc-300">{con}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Key insights */}
      {output.keyInsights.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">Key Factors</h3>
          <ul className="space-y-2">
            {output.keyInsights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-xs font-bold text-zinc-300">
                  {i + 1}
                </span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendation */}
      {output.recommendation && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Recommendation</p>
          <p className="mt-1 text-sm text-zinc-200">{output.recommendation}</p>
        </div>
      )}

      {/* Rating */}
      {onRate && (
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-zinc-400">
          <span>Was this helpful?</span>
          <button
            onClick={() => onRate('up')}
            className={cn('rounded-lg border px-3 py-2.5 transition hover:border-emerald-500/50 hover:text-emerald-400', result.rating === 'up' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10')}
          >
            👍 Yes
          </button>
          <button
            onClick={() => onRate('down')}
            className={cn('rounded-lg border px-3 py-2.5 transition hover:border-indigo-500/50 hover:text-indigo-400', result.rating === 'down' ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-white/10')}
          >
            👎 No
          </button>
        </div>
      )}
    </div>
  )
}
