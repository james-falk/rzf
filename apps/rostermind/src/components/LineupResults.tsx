'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { LineupOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

const CONFIDENCE_STYLES = {
  high: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  low: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
}

export function LineupResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: LineupOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Recommended Lineup</p>
            <p className="mt-0.5 text-xl font-bold text-white">{output.recommendedLineup.length} starters set</p>
          </div>
          <p className="text-xs text-zinc-500">{formatRelativeTime(result.createdAt)}</p>
        </div>
      </div>

      {/* Starting lineup */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-white">Starting Lineup</h3>
        {output.recommendedLineup.map((slot) => (
          <div key={`${slot.slot}-${slot.playerId}`} className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 shrink-0 text-center">
                <p className="text-xs font-bold text-zinc-500">{slot.slot}</p>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-white">{slot.playerName}</p>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize', CONFIDENCE_STYLES[slot.confidence])}>
                    {slot.confidence}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {slot.position}{slot.team ? ` — ${slot.team}` : ''}
                  {slot.opponent ? ` vs ${slot.opponent}` : ''}
                </p>
                <p className="mt-1 text-sm text-zinc-300">{slot.reason}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benched */}
      {output.benchedPlayers.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-semibold text-zinc-400">Benched</h3>
          {output.benchedPlayers.map((player) => (
            <div key={player.playerId} className="flex items-start gap-3 rounded-lg border border-white/5 bg-zinc-900/50 px-4 py-3">
              <span className="mt-0.5 text-zinc-500">—</span>
              <div>
                <p className="text-sm font-medium text-zinc-300">{player.playerName}</p>
                <p className="text-xs text-zinc-500">{player.reason}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key matchups */}
      {output.keyMatchups.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-blue-300">Key Matchups This Week</h3>
          <ul className="space-y-2">
            {output.keyMatchups.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-blue-400">→</span>
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {output.warnings.length > 0 && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-yellow-300">Watch Out</h3>
          <ul className="space-y-2">
            {output.warnings.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="text-yellow-400">!</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rating */}
      {onRate && (
        <div className="flex items-center justify-end gap-3 text-sm text-zinc-400">
          <span>Was this helpful?</span>
          <button
            onClick={() => onRate('up')}
            className={cn('rounded-lg border px-3 py-1.5 transition hover:border-emerald-500/50 hover:text-emerald-400', result.rating === 'up' ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10')}
          >
            👍 Yes
          </button>
          <button
            onClick={() => onRate('down')}
            className={cn('rounded-lg border px-3 py-1.5 transition hover:border-indigo-500/50 hover:text-indigo-400', result.rating === 'down' ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400' : 'border-white/10')}
          >
            👎 No
          </button>
        </div>
      )}
    </div>
  )
}
