'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { InjuryWatchOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

const SEVERITY_STYLES = {
  high: { badge: 'bg-red-500/20 text-red-400 border-red-500/30', bar: 'bg-red-500', icon: '⚠' },
  medium: { badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', bar: 'bg-yellow-500', icon: '!' },
  low: { badge: 'bg-zinc-700 text-zinc-400 border-zinc-600', bar: 'bg-zinc-500', icon: 'i' },
}

export function InjuryWatchResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: InjuryWatchOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result
  const total = output.riskyStarters + output.healthyStarters

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Roster Health</p>
            <div className="mt-1 flex items-end gap-2">
              <span className={cn('text-4xl font-black', output.riskyStarters > 2 ? 'text-red-400' : output.riskyStarters > 0 ? 'text-yellow-400' : 'text-emerald-400')}>
                {output.riskyStarters > 0 ? `${output.riskyStarters} at risk` : 'All clear'}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>{output.healthyStarters} healthy</p>
            <p>{output.riskyStarters} risky</p>
            <p>{formatRelativeTime(result.createdAt)}</p>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-xs text-zinc-500">
              <span>Health score</span>
              <span>{total > 0 ? Math.round((output.healthyStarters / total) * 100) : 100}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${total > 0 ? (output.healthyStarters / total) * 100 : 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {output.alerts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Injury Alerts</h3>
          {output.alerts.map((alert) => {
            const styles = SEVERITY_STYLES[alert.severity]
            return (
              <div key={alert.playerId} className={cn('rounded-xl border p-4', styles.badge)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold border', styles.badge)}>
                      {styles.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{alert.playerName}</p>
                      <p className="text-xs text-zinc-400">{alert.position} — {alert.team ?? 'Unknown'}</p>
                    </div>
                  </div>
                  <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize', styles.badge)}>
                    {alert.severity} risk
                  </span>
                </div>
                {alert.injuryStatus && (
                  <p className="mt-2 text-xs text-zinc-400">
                    Status: <span className="text-white">{alert.injuryStatus}</span>
                  </p>
                )}
                <p className="mt-2 text-sm">{alert.summary}</p>
                <p className="mt-1 text-sm font-medium text-white">{alert.recommendation}</p>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
          <p className="text-lg font-semibold text-emerald-300">No injury concerns</p>
          <p className="mt-1 text-sm text-zinc-400">Your starters are all healthy. Good to go!</p>
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
            className={cn('rounded-lg border px-3 py-1.5 transition hover:border-red-500/50 hover:text-red-400', result.rating === 'down' ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10')}
          >
            👎 No
          </button>
        </div>
      )}
    </div>
  )
}
