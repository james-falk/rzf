'use client'

import { cn, formatRelativeTime } from '@/lib/utils'
import type { TradeAnalysisOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

const VERDICT_STYLES = {
  accept: { text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Accept Trade' },
  decline: { text: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/30', label: 'Decline Trade' },
  counter: { text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', label: 'Counter Offer' },
}

export function TradeAnalysisResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: TradeAnalysisOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result
  const verdict = VERDICT_STYLES[output.verdict]

  // valueScore: -100 to +100. Map to 0-100 for bar display.
  const barPercent = Math.min(100, Math.max(0, (output.valueScore + 100) / 2))
  const isPositive = output.valueScore >= 0

  return (
    <div className="space-y-6">
      {/* Verdict + value score */}
      <div className={cn('rounded-xl border p-6', verdict.bg)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-400">Recommendation</p>
            <p className={cn('text-3xl font-black', verdict.text)}>{verdict.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Value Score</p>
            <p className={cn('text-3xl font-black', isPositive ? 'text-emerald-400' : 'text-indigo-400')}>
              {output.valueScore > 0 ? '+' : ''}{output.valueScore}
            </p>
          </div>
        </div>

        {/* Value bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={cn('h-full rounded-full transition-all', isPositive ? 'bg-emerald-500' : 'bg-indigo-500')}
              style={{ width: `${barPercent}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
            <span>Heavily against you</span>
            <span>Even</span>
            <span>Heavily in your favor</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm leading-relaxed text-zinc-200">{output.summary}</p>
          <p className="shrink-0 text-xs text-zinc-500">{formatRelativeTime(result.createdAt)}</p>
        </div>
      </div>

      {/* Player breakdowns */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-indigo-300">You Give</h3>
          <div className="space-y-3">
            {output.givingAnalysis.map((p) => (
              <div key={p.playerId}>
                <div className="flex items-baseline gap-2">
                  <p className="font-medium text-white">{p.playerName}</p>
                  <p className="text-xs text-zinc-400">{p.position}{p.team ? ` — ${p.team}` : ''}</p>
                </div>
                {p.tradeValue != null && (
                  <p className="text-xs text-zinc-500">Dynasty value: {p.tradeValue}</p>
                )}
                <p className="mt-1 text-sm text-zinc-300">{p.analysis}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <h3 className="mb-3 text-sm font-semibold text-emerald-300">You Receive</h3>
          <div className="space-y-3">
            {output.receivingAnalysis.map((p) => (
              <div key={p.playerId}>
                <div className="flex items-baseline gap-2">
                  <p className="font-medium text-white">{p.playerName}</p>
                  <p className="text-xs text-zinc-400">{p.position}{p.team ? ` — ${p.team}` : ''}</p>
                </div>
                {p.tradeValue != null && (
                  <p className="text-xs text-zinc-500">Dynasty value: {p.tradeValue}</p>
                )}
                <p className="mt-1 text-sm text-zinc-300">{p.analysis}</p>
              </div>
            ))}
          </div>
        </div>
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
