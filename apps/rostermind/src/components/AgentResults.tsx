'use client'

import type {
  TeamEvalOutput,
  InjuryWatchOutput,
  WaiverOutput,
  LineupOutput,
  TradeAnalysisOutput,
  PlayerScoutOutput,
} from '@rzf/shared/types'
import { TeamEvalResults } from './TeamEvalResults'
import { InjuryWatchResults } from './InjuryWatchResults'
import { WaiverResults } from './WaiverResults'
import { LineupResults } from './LineupResults'
import { TradeAnalysisResults } from './TradeAnalysisResults'
import { PlayerScoutResults } from './PlayerScoutResults'

export interface AgentRunResult {
  id: string
  agentType: string
  status: 'queued' | 'running' | 'done' | 'failed'
  output: unknown
  tokensUsed: number | null
  durationMs: number | null
  rating: 'up' | 'down' | null
  errorMessage: string | null
  confidenceScore?: number | null
  createdAt: string
}

function ConfidenceBadge({ score }: { score?: number | null }) {
  if (score == null) return null

  const label = score >= 80 ? 'High Confidence' : score >= 50 ? 'Moderate Confidence' : 'Limited Data'
  const dotClass = score >= 80
    ? 'bg-emerald-500'
    : score >= 50
      ? 'bg-yellow-500'
      : 'bg-zinc-500'
  const textClass = score >= 80
    ? 'text-emerald-400'
    : score >= 50
      ? 'text-yellow-400'
      : 'text-zinc-400'
  const borderClass = score >= 80
    ? 'border-emerald-500/20 bg-emerald-500/5'
    : score >= 50
      ? 'border-yellow-500/20 bg-yellow-500/5'
      : 'border-white/10 bg-zinc-900'

  return (
    <div className={`mb-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 ${borderClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      <span className={`text-xs font-medium ${textClass}`}>{label}</span>
      <span className="text-xs text-zinc-600">{score}/100</span>
    </div>
  )
}

export const AGENT_LABELS: Record<string, string> = {
  team_eval: 'Team Evaluation Report',
  injury_watch: 'Injury Report',
  waiver: 'Waiver Wire Recommendations',
  lineup: 'Lineup Optimizer',
  trade_analysis: 'Trade Analysis',
  player_scout: 'Player Scouting Report',
}

export function AgentResults({
  result,
  onRate,
}: {
  result: AgentRunResult
  onRate?: (r: 'up' | 'down') => void
}) {
  if (!result.output) return null

  return (
    <div>
      <ConfidenceBadge score={result.confidenceScore} />
      {(() => {
        switch (result.agentType) {
          case 'team_eval':
            return (
              <TeamEvalResults
                result={result as AgentRunResult & { output: TeamEvalOutput }}
                onRate={onRate}
              />
            )
          case 'injury_watch':
            return (
              <InjuryWatchResults
                result={result as AgentRunResult & { output: InjuryWatchOutput }}
                onRate={onRate}
              />
            )
          case 'waiver':
            return (
              <WaiverResults
                result={result as AgentRunResult & { output: WaiverOutput }}
                onRate={onRate}
              />
            )
          case 'lineup':
            return (
              <LineupResults
                result={result as AgentRunResult & { output: LineupOutput }}
                onRate={onRate}
              />
            )
          case 'trade_analysis':
            return (
              <TradeAnalysisResults
                result={result as AgentRunResult & { output: TradeAnalysisOutput }}
                onRate={onRate}
              />
            )
          case 'player_scout':
            return (
              <PlayerScoutResults
                result={result as AgentRunResult & { output: PlayerScoutOutput }}
                onRate={onRate}
              />
            )
          default:
            return (
              <div className="rounded-xl border border-white/10 bg-zinc-900 p-6 text-sm text-zinc-400">
                <p className="font-medium text-white">Agent report complete</p>
                <pre className="mt-3 overflow-auto rounded bg-zinc-800 p-3 text-xs text-zinc-300">
                  {JSON.stringify(result.output, null, 2)}
                </pre>
              </div>
            )
        }
      })()}
    </div>
  )
}
