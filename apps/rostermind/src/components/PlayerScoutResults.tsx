'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { PlayerScoutOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

const TREND_STYLES = {
  rising: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: '↑' },
  falling: { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30', icon: '↓' },
  stable: { text: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: '→' },
  unknown: { text: 'text-zinc-400', bg: 'bg-zinc-800 border-zinc-700', icon: '?' },
}

export function PlayerScoutResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: PlayerScoutOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result
  const trend = TREND_STYLES[output.trend]

  return (
    <div className="space-y-6">
      {/* Player header */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold text-white">{output.playerName}</p>
            <p className="mt-0.5 text-sm text-zinc-400">
              {output.position}
              {output.team ? ` — ${output.team}` : ''}
              {output.injuryStatus ? (
                <span className="ml-2 text-yellow-400">⚠ {output.injuryStatus}</span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={cn('rounded-full border px-3 py-1 text-sm font-semibold capitalize', trend.bg, trend.text)}>
              {trend.icon} {output.trend}
            </span>
            <p className="text-xs text-zinc-500">{formatRelativeTime(result.createdAt)}</p>
          </div>
        </div>

        {/* Value stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {output.rankOverall != null && (
            <div className="rounded-lg bg-zinc-800 p-3 text-center">
              <p className="text-xs text-zinc-400">Overall Rank</p>
              <p className="text-xl font-bold text-white">#{output.rankOverall}</p>
            </div>
          )}
          {output.rankPosition != null && (
            <div className="rounded-lg bg-zinc-800 p-3 text-center">
              <p className="text-xs text-zinc-400">Position Rank</p>
              <p className="text-xl font-bold text-white">#{output.rankPosition}</p>
            </div>
          )}
          {output.dynasty1qbValue != null && (
            <div className="rounded-lg bg-zinc-800 p-3 text-center">
              <p className="text-xs text-zinc-400">Dynasty Value</p>
              <p className="text-xl font-bold text-white">{output.dynasty1qbValue}</p>
            </div>
          )}
          {output.redraftValue != null && (
            <div className="rounded-lg bg-zinc-800 p-3 text-center">
              <p className="text-xs text-zinc-400">Redraft Value</p>
              <p className="text-xl font-bold text-white">{output.redraftValue}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent news */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-400">Recent News</h3>
          {output.recentTradesCount > 0 && (
            <p className="text-xs text-zinc-500">{output.recentTradesCount} recent trades in the community</p>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-zinc-200">{output.recentNewsSummary}</p>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <h3 className="mb-2 text-sm font-semibold text-white">Fantasy Outlook</h3>
        <p className="text-sm leading-relaxed text-zinc-300">{output.summary}</p>
      </div>

      {/* Key insights */}
      {output.keyInsights.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
          <h3 className="mb-3 text-base font-semibold text-white">Key Insights</h3>
          <ul className="space-y-2.5">
            {output.keyInsights.map((insight, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  {i + 1}
                </span>
                {insight}
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
