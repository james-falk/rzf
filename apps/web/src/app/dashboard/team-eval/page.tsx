'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'
import { cn, gradeColor, formatRelativeTime } from '@/lib/utils'
import type { TeamEvalOutput } from '@rzf/shared/types'

interface League {
  league_id: string
  name: string
  season: string
}

interface AgentRunResult {
  id: string
  status: 'queued' | 'running' | 'done' | 'failed'
  output: TeamEvalOutput | null
  tokensUsed: number | null
  durationMs: number | null
  rating: 'up' | 'down' | null
  errorMessage: string | null
  createdAt: string
}

export default function TeamEvalPage() {
  const { getToken } = useAuth()
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [leaguesLoading, setLeaguesLoading] = useState(true)
  const [leaguesError, setLeaguesError] = useState('')

  const [runId, setRunId] = useState<string | null>(null)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [upgradePrompt, setUpgradePrompt] = useState(false)
  const [sleeperUserId, setSleeperUserId] = useState('')

  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load leagues on mount
  useEffect(() => {
    async function loadLeagues() {
      try {
        const token = await getToken()
        if (!token) return

        const data = await api.getLeagues(token)
        const leagueList = data.leagues as League[]
        setLeagues(leagueList)
        if (leagueList.length > 0) {
          setSelectedLeague(leagueList[0]!.league_id)
        }

        // Get the user's Sleeper ID from their profile
        const profile = await fetch('/api/sleeper-profile').then((r) => r.json()).catch(() => null)
        if (profile?.sleeperId) setSleeperUserId(profile.sleeperId)
      } catch {
        setLeaguesError('Could not load leagues. Make sure your Sleeper account is connected.')
      } finally {
        setLeaguesLoading(false)
      }
    }
    loadLeagues()
  }, [getToken])

  // Poll for run result
  useEffect(() => {
    if (!runId) return

    pollInterval.current = setInterval(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const run = await api.getAgentRun(token, runId)
        setResult(run)

        if (run.status === 'done' || run.status === 'failed') {
          clearInterval(pollInterval.current!)
          setRunning(false)
        }
      } catch {
        clearInterval(pollInterval.current!)
        setRunning(false)
      }
    }, 2000)

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current)
    }
  }, [runId, getToken])

  async function handleRun() {
    if (!selectedLeague || !sleeperUserId) return

    setRunning(true)
    setRunError('')
    setResult(null)
    setUpgradePrompt(false)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const { agentRunId } = await api.runTeamEval(token, sleeperUserId, selectedLeague)
      setRunId(agentRunId)
    } catch (err) {
      setRunning(false)
      if (err instanceof ApiError && err.isPaymentRequired) {
        setUpgradePrompt(true)
      } else {
        setRunError(err instanceof Error ? err.message : 'Failed to start analysis')
      }
    }
  }

  async function handleRate(rating: 'up' | 'down') {
    if (!result?.id) return
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, result.id, rating)
      setResult((prev) => (prev ? { ...prev, rating } : null))
    } catch {
      // non-critical
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Team Evaluation</h1>
        <p className="mt-1 text-zinc-400">AI analysis of your fantasy roster</p>
      </div>

      {/* League selector */}
      <div className="mb-6 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Select League</h2>

        {leaguesLoading ? (
          <div className="text-sm text-zinc-400">Loading your leagues...</div>
        ) : leaguesError ? (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {leaguesError}{' '}
            <a href="/account/sleeper" className="underline">Connect Sleeper</a>
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No leagues found.{' '}
            <a href="/account/sleeper" className="text-red-400 hover:text-red-300">
              Connect your Sleeper account
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">League</label>
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-4 py-2.5 text-white outline-none focus:border-red-500"
              >
                {leagues.map((l) => (
                  <option key={l.league_id} value={l.league_id}>
                    {l.name} ({l.season})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleRun}
              disabled={running || !selectedLeague || !sleeperUserId}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50 sm:whitespace-nowrap"
            >
              {running ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        )}
      </div>

      {/* Upgrade prompt */}
      {upgradePrompt && (
        <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
          <h3 className="mb-2 text-lg font-semibold text-yellow-300">Free analyses used</h3>
          <p className="mb-4 text-sm text-yellow-200/70">
            You&apos;ve used your 2 free analyses. Upgrade to Pro for 50 runs/month.
          </p>
          <a
            href="/account/billing"
            className="inline-block rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-yellow-400"
          >
            Upgrade to Pro — $20/mo
          </a>
        </div>
      )}

      {/* Run error */}
      {runError && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          {runError}
        </div>
      )}

      {/* Loading state */}
      {running && !result && (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-10 text-center">
          <div className="mb-3 text-4xl">🤖</div>
          <p className="text-lg font-medium text-white">Analyzing your roster...</p>
          <p className="mt-1 text-sm text-zinc-400">Checking injuries, depth charts, and rankings</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-red-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result?.status === 'done' && result.output && (
        <TeamEvalResults result={{ ...result, output: result.output }} onRate={handleRate} />
      )}

      {/* Failed state */}
      {result?.status === 'failed' && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-400">
          Analysis failed: {result.errorMessage ?? 'Unknown error'}
        </div>
      )}
    </div>
  )
}

function TeamEvalResults({
  result,
  onRate,
}: {
  result: AgentRunResult & { output: TeamEvalOutput }
  onRate: (r: 'up' | 'down') => void
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
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="mb-3 text-base font-semibold text-red-300">Weaknesses</h3>
          <ul className="space-y-2">
            {output.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="mt-0.5 shrink-0 text-red-400">!</span>
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-xs font-bold text-red-400">
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
      <div className="flex items-center justify-end gap-3 text-sm text-zinc-400">
        <span>Was this analysis helpful?</span>
        <button
          onClick={() => onRate('up')}
          className={cn(
            'rounded-lg border px-3 py-1.5 transition hover:border-emerald-500/50 hover:text-emerald-400',
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
            'rounded-lg border px-3 py-1.5 transition hover:border-red-500/50 hover:text-red-400',
            result.rating === 'down'
              ? 'border-red-500/50 bg-red-500/10 text-red-400'
              : 'border-white/10',
          )}
        >
          👎 No
        </button>
      </div>
    </div>
  )
}
