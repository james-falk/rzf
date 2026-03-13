'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { PlayerScoutResults } from '@/components/PlayerScoutResults'
import type { AgentRunResult } from '@/components/AgentResults'
import type { PlayerScoutOutput } from '@rzf/shared/types'
import { cn } from '@/lib/utils'

interface PlayerSearch {
  player_id: string
  full_name: string
  position: string
  team: string | null
  injuryStatus: string | null
}

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K']

export default function ScoutPage() {
  const { getToken } = useAuth()

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSearch | null>(null)
  const [context, setContext] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [posFilter, setPosFilter] = useState('All')
  const [showResults, setShowResults] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [runId, setRunId] = useState<string | null>(null)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const searchPlayers = useCallback(async (q: string, pos: string) => {
    if (!q.trim() || q.length < 2) { setSearchResults([]); return }
    setSearching(true)
    try {
      const token = await getToken()
      if (!token) return
      const data = await api.searchPlayers(token, q, pos !== 'All' ? pos : undefined)
      setSearchResults(data.players ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [getToken])

  useEffect(() => {
    const t = setTimeout(() => searchPlayers(searchQuery, posFilter), 300)
    return () => clearTimeout(t)
  }, [searchQuery, posFilter, searchPlayers])

  function selectPlayer(player: PlayerSearch) {
    setSelectedPlayer(player)
    setSearchQuery(player.full_name)
    setSearchResults([])
    setShowResults(false)
  }

  async function handleSubmit() {
    if (!selectedPlayer) return
    setPhase('running')
    setErrorMsg('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runAgent(token, 'player_scout', {
        playerId: selectedPlayer.player_id,
        ...(context.trim() ? { context: context.trim() } : {}),
      })
      setRunId(agentRunId)
      const interval = setInterval(async () => {
        try {
          const t = await getToken()
          if (!t) return
          const run = await api.getAgentRun(t, agentRunId)
          if (run.status === 'done' || run.status === 'failed') {
            clearInterval(interval)
            if (run.status === 'done' && run.output) {
              setResult(run as AgentRunResult)
              setPhase('done')
            } else {
              setErrorMsg(run.errorMessage ?? 'Scout failed')
              setPhase('error')
            }
          }
        } catch { clearInterval(interval) }
      }, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start scout')
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('idle')
    setResult(null)
    setRunId(null)
    setErrorMsg('')
    setSelectedPlayer(null)
    setSearchQuery('')
    setContext('')
  }

  async function handleRate(rating: 'up' | 'down') {
    if (!runId) return
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, runId, rating)
      if (result) setResult({ ...result, rating })
    } catch { /* non-critical */ }
  }

  if (phase === 'done' && result) {
    return (
      <div className="p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Player Scout</h1>
          <button onClick={handleReset} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-white">
            Scout Another Player
          </button>
        </div>
        <PlayerScoutResults
          result={result as AgentRunResult & { output: PlayerScoutOutput }}
          onRate={handleRate}
        />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Player Scout</h1>
        <p className="mt-1 text-sm text-zinc-400">Search any player to get a deep-dive scouting report — trend analysis, trade value, recent news, and key insights.</p>
      </div>

      <div className="mx-auto max-w-xl space-y-6">
        {/* Player search */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">Player</label>
          <div className="relative">
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); setSelectedPlayer(null) }}
                onFocus={() => setShowResults(true)}
                placeholder="Search player name..."
                className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
              />
              <div className="flex gap-1">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosFilter(pos)}
                    className={cn('rounded px-2 py-1 text-xs font-medium transition', posFilter === pos ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white')}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                <div className="max-h-60 overflow-y-auto py-1">
                  {searching && <p className="px-4 py-2 text-xs text-zinc-500">Searching...</p>}
                  {searchResults.map((p) => (
                    <button
                      key={p.player_id}
                      onClick={() => selectPlayer(p)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5"
                    >
                      <span className="w-8 text-xs font-bold text-zinc-500">{p.position}</span>
                      <span className="flex-1 text-sm text-white">{p.full_name}</span>
                      {p.team && <span className="text-xs text-zinc-500">{p.team}</span>}
                      {p.injuryStatus && <span className="text-xs text-yellow-500">⚠</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {selectedPlayer && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <span className="text-xs font-bold text-emerald-400">{selectedPlayer.position}</span>
              <span className="text-sm text-white">{selectedPlayer.full_name}</span>
              {selectedPlayer.team && <span className="text-xs text-zinc-400">{selectedPlayer.team}</span>}
              {selectedPlayer.injuryStatus && <span className="text-xs text-yellow-400">⚠ {selectedPlayer.injuryStatus}</span>}
              <button onClick={() => { setSelectedPlayer(null); setSearchQuery('') }} className="ml-auto text-xs text-zinc-500 hover:text-red-400">✕</button>
            </div>
          )}
        </div>

        {/* Optional context */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Context <span className="text-zinc-500">(optional)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. &quot;Should I trade for him in a dynasty league?&quot; or &quot;He just got hurt — what's his outlook?&quot;"
            rows={3}
            maxLength={300}
            className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
          />
          <p className="mt-1 text-right text-xs text-zinc-600">{context.length}/300</p>
        </div>

        {/* Error */}
        {phase === 'error' && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedPlayer || phase === 'running'}
          className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === 'running' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Scouting player...
            </span>
          ) : 'Generate Scouting Report →'}
        </button>
      </div>
    </div>
  )
}
