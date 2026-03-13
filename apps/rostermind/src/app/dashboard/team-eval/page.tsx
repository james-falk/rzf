'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'
import { TeamEvalResults } from '@/components/TeamEvalResults'
import type { AgentRunResult } from '@/components/AgentResults'
import type { TeamEvalOutput } from '@rzf/shared/types'

interface League {
  league_id: string
  name: string
  season: string
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
    if (!selectedLeague) return

    setRunning(true)
    setRunError('')
    setResult(null)
    setUpgradePrompt(false)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      const { agentRunId } = await api.runTeamEval(token, selectedLeague)
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
          <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-400">
            {leaguesError}{' '}
            <a href="/account/sleeper" className="underline">Connect Sleeper</a>
          </div>
        ) : leagues.length === 0 ? (
          <div className="text-sm text-zinc-400">
            No leagues found.{' '}
            <a href="/account/sleeper" className="text-indigo-400 hover:text-indigo-300">
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
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-4 py-2.5 text-white outline-none focus:border-indigo-500"
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
              disabled={running || !selectedLeague}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 sm:whitespace-nowrap"
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
      {runError.length > 0 && (
        <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4 text-sm text-indigo-400">
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
                className="h-2 w-2 animate-bounce rounded-full bg-indigo-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result != null && result.status === 'done' && result.output != null && (
        <TeamEvalResults result={{ ...result, output: result.output as TeamEvalOutput }} onRate={handleRate} />
      )}

      {/* Failed state */}
      {result?.status === 'failed' && (
        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-6 text-sm text-indigo-400">
          Analysis failed: {result.errorMessage ?? 'Unknown error'}
        </div>
      )}
    </div>
  )
}

