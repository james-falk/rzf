'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { TradeAnalysisResults } from '@/components/TradeAnalysisResults'
import type { AgentRunResult } from '@/components/AgentResults'
import type { TradeAnalysisOutput } from '@rzf/shared/types'
import { cn } from '@/lib/utils'

interface League {
  league_id: string
  name: string
  season: string
}

interface PlayerSearch {
  player_id: string
  full_name: string
  position: string
  team: string | null
}

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K']

export default function TradePage() {
  const { getToken } = useAuth()

  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [givingPlayers, setGivingPlayers] = useState<PlayerSearch[]>([])
  const [receivingPlayers, setReceivingPlayers] = useState<PlayerSearch[]>([])
  const [activeSelector, setActiveSelector] = useState<'giving' | 'receiving' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [posFilter, setPosFilter] = useState('All')
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [runId, setRunId] = useState<string | null>(null)
  const [result, setResult] = useState<AgentRunResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    getToken().then(async (token) => {
      if (!token) return
      try {
        const data = await api.getLeagues(token)
        const list = data.leagues as League[]
        setLeagues(list)
        if (list.length === 1) setSelectedLeague(list[0]!.league_id)
      } catch { /* silent */ }
    })
  }, [getToken])

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

  function addPlayer(player: PlayerSearch, side: 'giving' | 'receiving') {
    if (side === 'giving') {
      if (givingPlayers.find((p) => p.player_id === player.player_id)) return
      if (givingPlayers.length >= 5) return
      setGivingPlayers((prev) => [...prev, player])
    } else {
      if (receivingPlayers.find((p) => p.player_id === player.player_id)) return
      if (receivingPlayers.length >= 5) return
      setReceivingPlayers((prev) => [...prev, player])
    }
    setSearchQuery('')
    setSearchResults([])
    setActiveSelector(null)
  }

  function removePlayer(playerId: string, side: 'giving' | 'receiving') {
    if (side === 'giving') setGivingPlayers((prev) => prev.filter((p) => p.player_id !== playerId))
    else setReceivingPlayers((prev) => prev.filter((p) => p.player_id !== playerId))
  }

  async function handleSubmit() {
    if (!selectedLeague || givingPlayers.length === 0 || receivingPlayers.length === 0) return
    setPhase('running')
    setErrorMsg('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runAgent(token, 'trade_analysis', {
        leagueId: selectedLeague,
        giving: givingPlayers.map((p) => p.player_id),
        receiving: receivingPlayers.map((p) => p.player_id),
      })
      setRunId(agentRunId)
      // Poll
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
              setErrorMsg(run.errorMessage ?? 'Analysis failed')
              setPhase('error')
            }
          }
        } catch { clearInterval(interval) }
      }, 2000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to start analysis')
      setPhase('error')
    }
  }

  function handleReset() {
    setPhase('idle')
    setResult(null)
    setRunId(null)
    setErrorMsg('')
    setGivingPlayers([])
    setReceivingPlayers([])
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
          <h1 className="text-2xl font-bold text-white">Trade Analysis</h1>
          <button onClick={handleReset} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-white">
            Analyze Another Trade
          </button>
        </div>
        <TradeAnalysisResults
          result={result as AgentRunResult & { output: TradeAnalysisOutput }}
          onRate={handleRate}
        />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Trade Advisor</h1>
        <p className="mt-1 text-sm text-zinc-400">Select the players on each side of the trade to get an AI-powered accept/reject verdict.</p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        {/* League selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">League</label>
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50"
          >
            {leagues.length > 1 && <option value="" disabled>Select a league...</option>}
            {leagues.map((l) => (
              <option key={l.league_id} value={l.league_id}>{l.name} ({l.season})</option>
            ))}
            {leagues.length === 0 && <option value="" disabled>Loading leagues...</option>}
          </select>
        </div>

        {/* Player pickers */}
        <div className="grid gap-4 md:grid-cols-2">
          <PlayerSidePanel
            label="You Give"
            players={givingPlayers}
            onRemove={(id) => removePlayer(id, 'giving')}
            onAdd={() => { setActiveSelector('giving'); setSearchQuery(''); setSearchResults([]) }}
            isActive={activeSelector === 'giving'}
            accentClass="border-red-500/20 bg-red-500/5"
            labelClass="text-red-300"
          />
          <PlayerSidePanel
            label="You Receive"
            players={receivingPlayers}
            onRemove={(id) => removePlayer(id, 'receiving')}
            onAdd={() => { setActiveSelector('receiving'); setSearchQuery(''); setSearchResults([]) }}
            isActive={activeSelector === 'receiving'}
            accentClass="border-emerald-500/20 bg-emerald-500/5"
            labelClass="text-emerald-300"
          />
        </div>

        {/* Player search panel */}
        {activeSelector && (
          <div className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-white">
                Add player to <span className={activeSelector === 'giving' ? 'text-red-400' : 'text-emerald-400'}>{activeSelector === 'giving' ? 'Give' : 'Receive'}</span>
              </p>
              <button onClick={() => setActiveSelector(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
            </div>
            <div className="flex gap-2">
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search player name..."
                className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
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
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
              {searching && <p className="px-2 py-3 text-xs text-zinc-500">Searching...</p>}
              {!searching && searchResults.map((p) => (
                <button
                  key={p.player_id}
                  onClick={() => addPlayer(p, activeSelector)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-white/5"
                >
                  <span className="text-xs font-bold text-zinc-500 w-8">{p.position}</span>
                  <span className="text-sm text-white">{p.full_name}</span>
                  {p.team && <span className="text-xs text-zinc-500">{p.team}</span>}
                </button>
              ))}
              {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <p className="px-2 py-3 text-xs text-zinc-500">No players found</p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedLeague || givingPlayers.length === 0 || receivingPlayers.length === 0 || phase === 'running'}
          className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === 'running' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Analyzing trade...
            </span>
          ) : 'Analyze This Trade →'}
        </button>
      </div>
    </div>
  )
}

function PlayerSidePanel({
  label,
  players,
  onRemove,
  onAdd,
  isActive,
  accentClass,
  labelClass,
}: {
  label: string
  players: PlayerSearch[]
  onRemove: (id: string) => void
  onAdd: () => void
  isActive: boolean
  accentClass: string
  labelClass: string
}) {
  return (
    <div className={cn('rounded-xl border p-4', accentClass, isActive && 'ring-1 ring-white/20')}>
      <p className={cn('mb-3 text-sm font-semibold', labelClass)}>{label}</p>
      <div className="space-y-2">
        {players.map((p) => (
          <div key={p.player_id} className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-white">{p.full_name}</p>
              <p className="text-xs text-zinc-400">{p.position}{p.team ? ` — ${p.team}` : ''}</p>
            </div>
            <button onClick={() => onRemove(p.player_id)} className="text-xs text-zinc-500 hover:text-red-400">✕</button>
          </div>
        ))}
        {players.length < 5 && (
          <button
            onClick={onAdd}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2 text-xs text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
          >
            + Add player
          </button>
        )}
        {players.length === 0 && (
          <p className="text-xs text-zinc-600">At least 1 player required</p>
        )}
      </div>
    </div>
  )
}
