'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { WaiverOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

export function WaiverResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: WaiverOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-zinc-400">Waiver Strategy</p>
            <p className="mt-1 text-sm leading-relaxed text-zinc-200">{output.summary}</p>
          </div>
          <p className="shrink-0 text-xs text-zinc-500">{formatRelativeTime(result.createdAt)}</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-white">Top Pickups</h3>
        {output.recommendations.map((rec, i) => (
          <div key={rec.playerId} className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <div className="flex items-start gap-4">
              {/* Rank + score */}
              <div className="flex flex-col items-center">
                <span className="text-lg font-black text-zinc-400">#{i + 1}</span>
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
                  {rec.pickupScore}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-semibold text-white">{rec.playerName}</p>
                  <p className="text-xs text-zinc-400">{rec.position}{rec.team ? ` — ${rec.team}` : ''}</p>
                </div>

                {/* Score bar */}
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 to-red-400"
                      style={{ width: `${rec.pickupScore}%` }}
                    />
                  </div>
                </div>

                <p className="mt-2 text-sm text-zinc-300">{rec.reason}</p>

                {rec.dropSuggestion && (
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Drop suggestion: <span className="text-zinc-400">{rec.dropSuggestion}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

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
            className={cn('rounded-lg border px-3 py-1.5 transition hover:border-red-500/50 hover:text-red-400', result.rating === 'down' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10')}
          >
            👎 No
          </button>
        </div>
      )}
    </div>
  )
}
