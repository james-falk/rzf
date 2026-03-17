'use client'

import { cn, gradeColor, formatRelativeTime } from '@/lib/utils'
import type { TeamEvalOutput } from '@rzf/shared/types'
import type { AgentRunResult } from './AgentResults'

export type { AgentRunResult }

export function TeamEvalResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: TeamEvalOutput }
  onRate?: (r: 'up' | 'down') => void
}) {
  const { output } = result

  return (
    <div className="space-y-6">
      {/* Overall grade */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-400">Overall Grade</p>
            <p className={cn('text-6xl font-black', gradeColor(output.overallGrade))}>
              {output.overallGrade}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>{result.tokensUsed} tokens</p>
            <p>{result.durationMs ? `${(result.durationMs / 1000).toFixed(1)}s` : ''}</p>
            <p>{formatRelativeTime(result.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Position grades */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Position Grades</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(output.positionGrades).map(([pos, grade]) => (
            <div key={pos} className="rounded-lg bg-zinc-800 p-3 text-center">
              <p className="text-xs text-zinc-400">{pos}</p>
              <p className={cn('text-2xl font-bold', gradeColor(grade))}>{grade}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6">
          <h3 className="mb-3 text-base font-semibold text-emerald-300">Strengths</h3>
          <ul className="space-y-2">
            {output.strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 shrink-0 text-emerald-400">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <h3 className="mb-3 text-base font-semibold text-indigo-300">Weaknesses</h3>
          <ul className="space-y-2">
            {output.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 shrink-0 text-indigo-400">!</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Insights */}
      <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Key Insights</h3>
        <ol className="space-y-3">
          {output.keyInsights.map((insight, i) => (
            <li key={i} className="flex gap-3 text-sm text-zinc-300">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                {i + 1}
              </span>
              {insight}
            </li>
          ))}
        </ol>
      </div>

      {/* Content Links */}
      {output.contentLinks.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h3 className="mb-4 text-base font-semibold text-white">Learn More</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {output.contentLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 rounded-lg border border-white/10 p-3 transition hover:border-white/20 hover:bg-white/5"
              >
                <span className="mt-0.5 shrink-0 text-lg">
                  {link.type === 'youtube' ? '▶' : link.type === 'fantasypros' ? '📊' : '📄'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{link.playerName}</p>
                  <p className="truncate text-xs text-zinc-400">{link.title}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Rating */}
      {onRate && (
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-zinc-400">
          <span>Was this analysis helpful?</span>
          <button
            onClick={() => onRate('up')}
            className={cn(
              'rounded-lg border px-3 py-2.5 transition hover:border-emerald-500/50 hover:text-emerald-400',
              result.rating === 'up'
                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                : 'border-white/10',
            )}
          >
            👍 Yes
          </button>
          <button
            onClick={() => onRate('down')}
            className={cn(
              'rounded-lg border px-3 py-2.5 transition hover:border-indigo-500/50 hover:text-indigo-400',
              result.rating === 'down'
                ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-400'
                : 'border-white/10',
            )}
          >
            👎 No
          </button>
        </div>
      )}
    </div>
  )
}
