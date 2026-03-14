'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { AgentResults } from '@/components/AgentResults'
import type { AgentRunResult } from '@/components/AgentResults'
import { FollowUpThread } from '@/components/FollowUpThread'
import { cn } from '@/lib/utils'

// ── Types ─────────────────────────────────────────────────────────────────────

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
  injuryStatus?: string | null
}

type ChatMessage =
  | { id: string; role: 'assistant'; type: 'text'; content: string }
  | { id: string; role: 'assistant'; type: 'typing' }
  | { id: string; role: 'assistant'; type: 'chips' }
  | { id: string; role: 'assistant'; type: 'league-select'; leagues: League[]; agentType: string }
  | { id: string; role: 'assistant'; type: 'trade-select' }
  | { id: string; role: 'assistant'; type: 'scout-select' }
  | { id: string; role: 'assistant'; type: 'loading'; agentType: string }
  | { id: string; role: 'assistant'; type: 'result'; result: AgentRunResult; runId: string }
  | { id: string; role: 'assistant'; type: 'error'; content: string }
  | { id: string; role: 'user'; type: 'user'; content: string }

const QUICK_ACTIONS = [
  { type: 'team_eval',      label: 'Team Analysis', icon: '📊', desc: 'Full roster grade & insights' },
  { type: 'injury_watch',   label: 'Injury Report', icon: '🏥', desc: 'Injury risk scan for your starters' },
  { type: 'waiver',         label: 'Waiver Wire',   icon: '🔄', desc: 'Best adds & drops this week' },
  { type: 'lineup',         label: 'Start / Sit',   icon: '📋', desc: 'Optimized lineup decisions' },
  { type: 'trade_analysis', label: 'Trade Advice',  icon: '💱', desc: 'Accept or reject trade offers' },
  { type: 'player_scout',   label: 'Player Scout',  icon: '🔍', desc: 'Deep-dive on any player' },
]

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K']

const AGENT_LOADING_MESSAGES: Record<string, string[]> = {
  team_eval: [
    'Pulling your roster from Sleeper...',
    'Checking injury reports and depth charts...',
    'Analyzing position strengths...',
    'Running AI evaluation...',
    'Finalizing your personalized report...',
  ],
  injury_watch: [
    'Fetching your starters...',
    'Scanning injury reports...',
    'Assessing severity levels...',
    'Building your health report...',
  ],
  waiver: [
    'Loading your roster needs...',
    'Scanning trending free agents...',
    'Matching pickups to your gaps...',
    'Ranking recommendations...',
  ],
  lineup: [
    'Loading your roster...',
    'Checking this week\'s matchups...',
    'Analyzing injury status...',
    'Optimizing your lineup...',
  ],
  trade_analysis: [
    'Fetching trade values...',
    'Analyzing player outlooks...',
    'Weighing both sides of the deal...',
    'Generating your verdict...',
  ],
  player_scout: [
    'Pulling player stats and news...',
    'Analyzing trends and usage...',
    'Checking trade value data...',
    'Building your scouting report...',
  ],
}

const DEFAULT_LOADING_MESSAGES = ['Processing your request...', 'Running AI analysis...', 'Almost done...']

let _id = 0
const mid = () => `m${++_id}`
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getAgentIntro(agentType: string): string {
  switch (agentType) {
    case 'team_eval':      return "Team evaluation — I'll grade every position and give you specific, actionable insights."
    case 'injury_watch':   return "Injury report — I'll scan your starters for health risks and give you handcuff recommendations."
    case 'waiver':         return "Waiver wire — I'll find the best available pickups tailored to your roster's weak spots."
    case 'lineup':         return "Lineup optimizer — I'll set the best possible lineup for this week based on matchups and injuries."
    case 'trade_analysis': return "Trade advisor — build the trade below and I'll give you an accept, decline, or counter verdict."
    case 'player_scout':   return "Player scout — search for any player and I'll give you a deep-dive scouting report."
    default:               return "Which league should I analyze?"
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { getToken } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [textInput, setTextInput] = useState('')
  const [phase, setPhase] = useState<'idle' | 'league-select' | 'trade-select' | 'scout-select' | 'running' | 'done'>('idle')
  const [pendingAgentType, setPendingAgentType] = useState('team_eval')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [runId, setRunId] = useState<string | null>(null)

  // Trade state
  const [givingPlayers, setGivingPlayers] = useState<PlayerSearch[]>([])
  const [receivingPlayers, setReceivingPlayers] = useState<PlayerSearch[]>([])
  const [tradeLeague, setTradeLeague] = useState('')
  const [tradeActiveSelector, setTradeActiveSelector] = useState<'giving' | 'receiving' | null>(null)

  // Scout state
  const [scoutPlayer, setScoutPlayer] = useState<PlayerSearch | null>(null)
  const [scoutContext, setScoutContext] = useState('')
  const [scoutQuery, setScoutQuery] = useState('')
  const [scoutShowResults, setScoutShowResults] = useState(false)

  // Shared player search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [posFilter, setPosFilter] = useState('All')

  const push = useCallback((msg: ChatMessage) => setMessages((prev) => [...prev, msg]), [])

  const showTypingThen = useCallback(async (fn: () => void, ms = 800) => {
    const typingId = mid()
    setMessages((prev) => [...prev, { id: typingId, role: 'assistant', type: 'typing' }])
    await delay(ms)
    setMessages((prev) => prev.filter((m) => m.id !== typingId))
    fn()
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    const init = async () => {
      await delay(300)
      push({ id: mid(), role: 'assistant', type: 'text', content: "Hey! I'm RosterMind AI. What would you like to know about your fantasy teams?" })
      await delay(700)
      push({ id: mid(), role: 'assistant', type: 'chips' })
    }
    init()
    getToken().then(async (token) => {
      if (!token) return
      try {
        const data = await api.getLeagues(token, String(new Date().getFullYear()))
        const list = data.leagues as League[]
        setLeagues(list)
        if (list.length === 1) {
          setSelectedLeague(list[0]!.league_id)
          setTradeLeague(list[0]!.league_id)
        }
      } catch { /* silent */ }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- intentional one-time init

  const handleYearChange = useCallback(async (year: string) => {
    setSelectedYear(year)
    setSelectedLeague('')
    try {
      const token = await getToken()
      if (!token) return
      const data = await api.getLeagues(token, year)
      const list = data.leagues as League[]
      setLeagues(list)
      if (list.length === 1) {
        setSelectedLeague(list[0]!.league_id)
        setTradeLeague(list[0]!.league_id)
      }
    } catch { /* silent */ }
  }, [getToken])

  useEffect(() => {
    if (phase !== 'running') return
    const msgs = AGENT_LOADING_MESSAGES[pendingAgentType] ?? DEFAULT_LOADING_MESSAGES
    setLoadingMsgIdx(0)
    loadingRef.current = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % msgs.length), 2500)
    return () => { if (loadingRef.current) clearInterval(loadingRef.current) }
  }, [phase, pendingAgentType])

  useEffect(() => {
    if (!runId || phase !== 'running') return
    pollRef.current = setInterval(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const run = await api.getAgentRun(token, runId)
        if (run.status === 'done' || run.status === 'failed') {
          clearInterval(pollRef.current!)
          setPhase('done')
          setMessages((prev) => prev.filter((m) => m.type !== 'loading'))
          if (run.status === 'done' && run.output) {
            push({ id: mid(), role: 'assistant', type: 'result', result: run as AgentRunResult, runId })
          } else {
            push({ id: mid(), role: 'assistant', type: 'error', content: `${run.errorMessage ?? 'Unknown error'}\n\nRun ID: ${run.id}` })
          }
        }
      } catch { clearInterval(pollRef.current!) }
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [runId, phase, getToken, push])

  // Shared player search debounce (used for trade + scout)
  useEffect(() => {
    const q = tradeActiveSelector ? searchQuery : scoutQuery
    if (!q.trim() || q.length < 2) { setSearchResults([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.searchPlayers(token, q, posFilter !== 'All' ? posFilter : undefined)
        setSearchResults(data.players ?? [])
      } catch { setSearchResults([]) }
      finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [searchQuery, scoutQuery, posFilter, tradeActiveSelector, getToken])

  const startRunning = useCallback(async (agentType: string, input: Record<string, unknown>) => {
    setPhase('running')
    setPendingAgentType(agentType)
    push({ id: mid(), role: 'assistant', type: 'loading', agentType })
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runAgent(token, agentType, input)
      setRunId(agentRunId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start analysis.'
      setPhase('done')
      setMessages((prev) => prev.filter((m) => m.type !== 'loading'))
      push({ id: mid(), role: 'assistant', type: 'error', content: msg })
    }
  }, [getToken, push])

  const handleQuickAction = useCallback(async (action: typeof QUICK_ACTIONS[number]) => {
    if (phase !== 'idle') return
    push({ id: mid(), role: 'user', type: 'user', content: action.label })
    setPendingAgentType(action.type)

    if (action.type === 'trade_analysis') {
      setPhase('trade-select')
      setGivingPlayers([])
      setReceivingPlayers([])
      setTradeActiveSelector(null)
      setSearchQuery('')
      setSearchResults([])
      await showTypingThen(() => {
        push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro(action.type) })
      })
      await delay(300)
      await showTypingThen(() => {
        push({ id: mid(), role: 'assistant', type: 'trade-select' })
      }, 500)
      return
    }

    if (action.type === 'player_scout') {
      setPhase('scout-select')
      setScoutPlayer(null)
      setScoutQuery('')
      setScoutContext('')
      setSearchResults([])
      await showTypingThen(() => {
        push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro(action.type) })
      })
      await delay(300)
      await showTypingThen(() => {
        push({ id: mid(), role: 'assistant', type: 'scout-select' })
      }, 500)
      return
    }

    setPhase('league-select')
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro(action.type) })
    })
    await delay(300)
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: action.type })
    }, 500)
  }, [phase, leagues, push, showTypingThen])

  const handleLeagueRun = useCallback(async () => {
    if (!selectedLeague) return
    const league = leagues.find((l) => l.league_id === selectedLeague)
    const action = QUICK_ACTIONS.find((a) => a.type === pendingAgentType)
    push({ id: mid(), role: 'user', type: 'user', content: `Run ${action?.label ?? 'analysis'} for ${league?.name ?? 'my team'}` })
    await startRunning(pendingAgentType, { leagueId: selectedLeague })
  }, [selectedLeague, leagues, pendingAgentType, push, startRunning])

  const handleTradeRun = useCallback(async () => {
    if (!tradeLeague || givingPlayers.length === 0 || receivingPlayers.length === 0) return
    const giveNames = givingPlayers.map((p) => p.full_name).join(', ')
    const receiveNames = receivingPlayers.map((p) => p.full_name).join(', ')
    push({ id: mid(), role: 'user', type: 'user', content: `Analyze trade: give ${giveNames} — receive ${receiveNames}` })
    await startRunning('trade_analysis', {
      leagueId: tradeLeague,
      giving: givingPlayers.map((p) => p.player_id),
      receiving: receivingPlayers.map((p) => p.player_id),
    })
  }, [tradeLeague, givingPlayers, receivingPlayers, push, startRunning])

  const handleScoutRun = useCallback(async () => {
    if (!scoutPlayer) return
    push({ id: mid(), role: 'user', type: 'user', content: `Scout ${scoutPlayer.full_name}${scoutContext.trim() ? ` — ${scoutContext.trim()}` : ''}` })
    await startRunning('player_scout', {
      playerId: scoutPlayer.player_id,
      ...(scoutContext.trim() ? { context: scoutContext.trim() } : {}),
    })
  }, [scoutPlayer, scoutContext, push, startRunning])

  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = textInput.trim()
    if (!msg) return
    setTextInput('')
    push({ id: mid(), role: 'user', type: 'user', content: msg })

    await showTypingThen(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const intent = await api.callIntent(token, msg, selectedLeague ? { leagueId: selectedLeague } : undefined)

        if (!intent.agentType || !intent.agentMeta?.available) {
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? "I can run a team analysis, injury report, waiver recommendations, lineup optimization, trade analysis, or player scouting. Click one of the options below!" })
          if (phase === 'idle') push({ id: mid(), role: 'assistant', type: 'chips' })
        } else if (intent.agentType === 'trade_analysis') {
          setPhase('trade-select')
          setPendingAgentType('trade_analysis')
          setGivingPlayers([])
          setReceivingPlayers([])
          push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro('trade_analysis') })
          push({ id: mid(), role: 'assistant', type: 'trade-select' })
        } else if (intent.agentType === 'player_scout') {
          setPhase('scout-select')
          setPendingAgentType('player_scout')
          setScoutPlayer(null)
          setScoutQuery('')
          push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro('player_scout') })
          push({ id: mid(), role: 'assistant', type: 'scout-select' })
        } else if (intent.missingParams.includes('leagueId')) {
          setPendingAgentType(intent.agentType)
          setPhase('league-select')
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? 'Which league should I analyze?' })
          push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: intent.agentType })
        } else if (intent.readyToRun && intent.gatheredParams['leagueId']) {
          await startRunning(intent.agentType, { leagueId: intent.gatheredParams['leagueId'] })
        }
      } catch {
        push({ id: mid(), role: 'assistant', type: 'error', content: 'Something went wrong. Please try again.' })
      }
    }, 1000)
  }, [textInput, getToken, selectedLeague, leagues, phase, push, showTypingThen, startRunning])

  const handleRate = useCallback(async (rating: 'up' | 'down') => {
    if (!runId) return
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, runId, rating)
    } catch { /* non-critical */ }
  }, [runId, getToken])

  const loadingMessages = AGENT_LOADING_MESSAGES[pendingAgentType] ?? DEFAULT_LOADING_MESSAGES

  const handleReset = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (loadingRef.current) { clearInterval(loadingRef.current); loadingRef.current = null }
    setMessages([])
    setPhase('idle')
    setRunId(null)
    setPendingAgentType('team_eval')
    setTextInput('')
    setGivingPlayers([])
    setReceivingPlayers([])
    setTradeLeague('')
    setTradeActiveSelector(null)
    setScoutPlayer(null)
    setScoutQuery('')
    setScoutContext('')
    setScoutShowResults(false)
    setSearchQuery('')
    setSearchResults([])
  }, [])

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="relative border-b border-white/10 px-6 py-4 overflow-hidden">
        <div className="pointer-events-none absolute -top-6 left-1/2 h-24 w-64 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-indigo-500/40" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
              <circle cx="5" cy="8" r="1.5" fill="#60a5fa" />
              <circle cx="19" cy="8" r="1.5" fill="#22d3ee" />
              <circle cx="5" cy="16" r="1.5" fill="#818cf8" />
              <circle cx="19" cy="16" r="1.5" fill="#a78bfa" />
              <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RosterMind AI</p>
            <p className="text-xs text-zinc-500">Neural fantasy analysis</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {phase !== 'idle' && (
              <button
                onClick={handleReset}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-indigo-500/40 hover:text-white"
              >
                + New Chat
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs text-zinc-500">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              leagues={leagues}
              selectedLeague={selectedLeague}
              selectedYear={selectedYear}
              onLeagueChange={setSelectedLeague}
              onYearChange={handleYearChange}
              onRun={handleLeagueRun}
              onRate={handleRate}
              onQuickAction={handleQuickAction}
              loadingMsg={loadingMessages[loadingMsgIdx] ?? loadingMessages[0]!}
              phase={phase}
              getToken={getToken}
              // Trade props
              givingPlayers={givingPlayers}
              receivingPlayers={receivingPlayers}
              tradeLeague={tradeLeague}
              tradeLeagues={leagues}
              tradeActiveSelector={tradeActiveSelector}
              searchQuery={searchQuery}
              searchResults={searchResults}
              searching={searching}
              posFilter={posFilter}
              onTradeLeagueChange={setTradeLeague}
              onTradeActiveSelectorChange={(s) => { setTradeActiveSelector(s); setSearchQuery(''); setSearchResults([]) }}
              onTradeSearchChange={setSearchQuery}
              onPosFilterChange={setPosFilter}
              onTradeAddPlayer={(p, side) => {
                if (side === 'giving') {
                  if (givingPlayers.find((x) => x.player_id === p.player_id) || givingPlayers.length >= 5) return
                  setGivingPlayers((prev) => [...prev, p])
                } else {
                  if (receivingPlayers.find((x) => x.player_id === p.player_id) || receivingPlayers.length >= 5) return
                  setReceivingPlayers((prev) => [...prev, p])
                }
                setSearchQuery('')
                setSearchResults([])
                setTradeActiveSelector(null)
              }}
              onTradeRemovePlayer={(id, side) => {
                if (side === 'giving') setGivingPlayers((prev) => prev.filter((p) => p.player_id !== id))
                else setReceivingPlayers((prev) => prev.filter((p) => p.player_id !== id))
              }}
              onTradeRun={handleTradeRun}
              // Scout props
              scoutPlayer={scoutPlayer}
              scoutQuery={scoutQuery}
              scoutContext={scoutContext}
              scoutShowResults={scoutShowResults}
              scoutSearchResults={searchResults}
              scoutSearching={searching}
              scoutPosFilter={posFilter}
              onScoutQueryChange={(q) => { setScoutQuery(q); setScoutShowResults(true); setScoutPlayer(null) }}
              onScoutFocus={() => setScoutShowResults(true)}
              onScoutSelectPlayer={(p) => { setScoutPlayer(p); setScoutQuery(p.full_name); setSearchResults([]); setScoutShowResults(false) }}
              onScoutClearPlayer={() => { setScoutPlayer(null); setScoutQuery('') }}
              onScoutContextChange={setScoutContext}
              onScoutPosFilterChange={setPosFilter}
              onScoutRun={handleScoutRun}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Text input */}
      {phase !== 'running' && (
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4 md:px-6">
          <form onSubmit={handleTextSubmit} className="mx-auto flex max-w-2xl items-center gap-3">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={phase === 'done' ? 'Run another analysis...' : 'Ask me about your team...'}
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

const YEAR_OPTIONS = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(String)

interface PlayerSearch {
  player_id: string
  full_name: string
  position: string
  team: string | null
  injuryStatus?: string | null
}

function MessageBubble({
  msg, leagues, selectedLeague, selectedYear, onLeagueChange, onYearChange, onRun, onRate, onQuickAction,
  loadingMsg, phase, getToken,
  givingPlayers, receivingPlayers, tradeLeague, tradeLeagues, tradeActiveSelector,
  searchQuery, searchResults, searching, posFilter,
  onTradeLeagueChange, onTradeActiveSelectorChange, onTradeSearchChange, onPosFilterChange,
  onTradeAddPlayer, onTradeRemovePlayer, onTradeRun,
  scoutPlayer, scoutQuery, scoutContext, scoutShowResults, scoutSearchResults, scoutSearching, scoutPosFilter,
  onScoutQueryChange, onScoutFocus, onScoutSelectPlayer, onScoutClearPlayer, onScoutContextChange,
  onScoutPosFilterChange, onScoutRun,
}: {
  msg: ChatMessage
  leagues: League[]
  selectedLeague: string
  selectedYear: string
  onLeagueChange: (id: string) => void
  onYearChange: (year: string) => void
  onRun: () => void
  onRate: (r: 'up' | 'down') => void
  onQuickAction: (action: typeof QUICK_ACTIONS[number]) => void
  loadingMsg: string
  phase: string
  getToken: () => Promise<string | null>
  givingPlayers: PlayerSearch[]
  receivingPlayers: PlayerSearch[]
  tradeLeague: string
  tradeLeagues: League[]
  tradeActiveSelector: 'giving' | 'receiving' | null
  searchQuery: string
  searchResults: PlayerSearch[]
  searching: boolean
  posFilter: string
  onTradeLeagueChange: (id: string) => void
  onTradeActiveSelectorChange: (s: 'giving' | 'receiving' | null) => void
  onTradeSearchChange: (q: string) => void
  onPosFilterChange: (p: string) => void
  onTradeAddPlayer: (p: PlayerSearch, side: 'giving' | 'receiving') => void
  onTradeRemovePlayer: (id: string, side: 'giving' | 'receiving') => void
  onTradeRun: () => void
  scoutPlayer: PlayerSearch | null
  scoutQuery: string
  scoutContext: string
  scoutShowResults: boolean
  scoutSearchResults: PlayerSearch[]
  scoutSearching: boolean
  scoutPosFilter: string
  onScoutQueryChange: (q: string) => void
  onScoutFocus: () => void
  onScoutSelectPlayer: (p: PlayerSearch) => void
  onScoutClearPlayer: () => void
  onScoutContextChange: (v: string) => void
  onScoutPosFilterChange: (p: string) => void
  onScoutRun: () => void
}) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex animate-in fade-in slide-in-from-bottom-2 duration-300', isUser ? 'justify-end' : 'justify-start gap-2.5')}>
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-indigo-500/30" style={{ background: 'rgba(99,102,241,0.15)' }}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none">
            <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
            <circle cx="5" cy="8" r="1.5" fill="#818cf8" />
            <circle cx="19" cy="8" r="1.5" fill="#818cf8" />
            <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.7" />
            <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.7" />
          </svg>
        </div>
      )}

      <div className={cn(isUser ? 'max-w-[70%]' : 'min-w-0 flex-1 max-w-[85%]')}>

        {isUser && (
          <div className="rounded-2xl rounded-tr-sm bg-zinc-800 px-4 py-2.5 text-sm text-white ring-1 ring-white/10">
            {'content' in msg ? msg.content : ''}
          </div>
        )}

        {msg.role === 'assistant' && msg.type === 'typing' && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {msg.role === 'assistant' && msg.type === 'text' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-200">
            {msg.content}
          </div>
        )}

        {msg.role === 'assistant' && msg.type === 'error' && (
          <div className="rounded-2xl rounded-tl-sm border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-sm font-medium text-red-400">Something went wrong</p>
            <p className="mt-1 font-mono text-xs text-red-300/80">{msg.content}</p>
          </div>
        )}

        {/* Quick action chips */}
        {msg.role === 'assistant' && msg.type === 'chips' && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.type}
                onClick={() => onQuickAction(action)}
                disabled={phase !== 'idle'}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-3 text-left transition',
                  phase === 'idle'
                    ? 'border-white/10 bg-zinc-900 hover:border-indigo-500/40 hover:bg-indigo-500/5 cursor-pointer'
                    : 'border-white/5 bg-zinc-900/50 cursor-not-allowed opacity-50',
                )}
              >
                <span className="text-lg">{action.icon}</span>
                <p className="text-xs font-semibold text-white">{action.label}</p>
                <p className="text-[11px] text-zinc-500">{action.desc}</p>
              </button>
            ))}
          </div>
        )}

        {/* League selector */}
        {msg.role === 'assistant' && msg.type === 'league-select' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-zinc-500">Season</span>
              {YEAR_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => onYearChange(y)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${selectedYear === y ? 'bg-indigo-600 text-white' : 'border border-white/10 text-zinc-400 hover:text-white'}`}
                >
                  {y}
                </button>
              ))}
            </div>
            {leagues.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No leagues found for {selectedYear}.{' '}
                <a href="/account/sleeper" className="text-indigo-400 underline">Check Sleeper Account →</a>
              </p>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedLeague}
                  onChange={(e) => onLeagueChange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500/50"
                >
                  {leagues.length > 1 && <option value="" disabled>Select a league...</option>}
                  {leagues.map((l) => (
                    <option key={l.league_id} value={l.league_id}>{l.name} ({l.season})</option>
                  ))}
                </select>
                <button
                  onClick={onRun}
                  disabled={!selectedLeague || phase === 'running'}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Run {QUICK_ACTIONS.find((a) => a.type === msg.agentType)?.label ?? 'Analysis'} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Trade selector */}
        {msg.role === 'assistant' && msg.type === 'trade-select' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 p-4 space-y-4">
            {/* League */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">League</label>
              <select
                value={tradeLeague}
                onChange={(e) => onTradeLeagueChange(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
              >
                {tradeLeagues.length > 1 && <option value="" disabled>Select a league...</option>}
                {tradeLeagues.map((l) => (
                  <option key={l.league_id} value={l.league_id}>{l.name} ({l.season})</option>
                ))}
                {tradeLeagues.length === 0 && <option value="" disabled>Loading...</option>}
              </select>
            </div>

            {/* Player panels */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Give side */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
                <p className="mb-2 text-xs font-semibold text-indigo-300">You Give</p>
                <div className="space-y-1.5">
                  {givingPlayers.map((p) => (
                    <div key={p.player_id} className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-2.5 py-1.5">
                      <div>
                        <p className="text-xs font-medium text-white">{p.full_name}</p>
                        <p className="text-[10px] text-zinc-400">{p.position}{p.team ? ` — ${p.team}` : ''}</p>
                      </div>
                      <button onClick={() => onTradeRemovePlayer(p.player_id, 'giving')} className="text-xs text-zinc-500 hover:text-indigo-400">✕</button>
                    </div>
                  ))}
                  {givingPlayers.length < 5 && (
                    <button
                      onClick={() => onTradeActiveSelectorChange('giving')}
                      className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                    >
                      + Add player
                    </button>
                  )}
                </div>
              </div>

              {/* Receive side */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <p className="mb-2 text-xs font-semibold text-emerald-300">You Receive</p>
                <div className="space-y-1.5">
                  {receivingPlayers.map((p) => (
                    <div key={p.player_id} className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-2.5 py-1.5">
                      <div>
                        <p className="text-xs font-medium text-white">{p.full_name}</p>
                        <p className="text-[10px] text-zinc-400">{p.position}{p.team ? ` — ${p.team}` : ''}</p>
                      </div>
                      <button onClick={() => onTradeRemovePlayer(p.player_id, 'receiving')} className="text-xs text-zinc-500 hover:text-emerald-400">✕</button>
                    </div>
                  ))}
                  {receivingPlayers.length < 5 && (
                    <button
                      onClick={() => onTradeActiveSelectorChange('receiving')}
                      className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-2.5 py-1.5 text-xs text-zinc-500 hover:border-white/20 hover:text-zinc-300"
                    >
                      + Add player
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Search panel */}
            {tradeActiveSelector && (
              <div className="rounded-xl border border-white/10 bg-zinc-800 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-medium text-white">
                    Add to <span className={tradeActiveSelector === 'giving' ? 'text-indigo-400' : 'text-emerald-400'}>{tradeActiveSelector === 'giving' ? 'Give' : 'Receive'}</span>
                  </p>
                  <button onClick={() => onTradeActiveSelectorChange(null)} className="text-xs text-zinc-500 hover:text-white">Cancel</button>
                </div>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => onTradeSearchChange(e.target.value)}
                    placeholder="Search player..."
                    className="flex-1 rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                  />
                  <div className="flex gap-1">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => onPosFilterChange(pos)}
                        className={cn('rounded px-1.5 py-1 text-[10px] font-medium transition', posFilter === pos ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white')}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-2 max-h-36 overflow-y-auto space-y-0.5">
                  {searching && <p className="px-2 py-2 text-xs text-zinc-500">Searching...</p>}
                  {!searching && searchResults.map((p) => (
                    <button
                      key={p.player_id}
                      onClick={() => onTradeAddPlayer(p, tradeActiveSelector)}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5"
                    >
                      <span className="w-7 text-[10px] font-bold text-zinc-500">{p.position}</span>
                      <span className="text-xs text-white">{p.full_name}</span>
                      {p.team && <span className="text-[10px] text-zinc-500">{p.team}</span>}
                    </button>
                  ))}
                  {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
                    <p className="px-2 py-2 text-xs text-zinc-500">No players found</p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onTradeRun}
              disabled={!tradeLeague || givingPlayers.length === 0 || receivingPlayers.length === 0 || phase === 'running'}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Analyze This Trade →
            </button>
            {(givingPlayers.length === 0 || receivingPlayers.length === 0) && (
              <p className="text-center text-xs text-zinc-600">
                Add at least one player to each side to continue
              </p>
            )}
          </div>
        )}

        {/* Scout selector */}
        {msg.role === 'assistant' && msg.type === 'scout-select' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 p-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Player</label>
              <div className="relative">
                <div className="flex gap-2">
                  <input
                    value={scoutQuery}
                    onChange={(e) => onScoutQueryChange(e.target.value)}
                    onFocus={onScoutFocus}
                    placeholder="Search player name..."
                    className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                  />
                  <div className="flex gap-1">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => onScoutPosFilterChange(pos)}
                        className={cn('rounded px-1.5 py-1 text-[10px] font-medium transition', scoutPosFilter === pos ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white')}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>
                </div>
                {scoutShowResults && scoutSearchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                    <div className="max-h-48 overflow-y-auto py-1">
                      {scoutSearching && <p className="px-4 py-2 text-xs text-zinc-500">Searching...</p>}
                      {scoutSearchResults.map((p) => (
                        <button
                          key={p.player_id}
                          onClick={() => onScoutSelectPlayer(p)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5"
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
              {scoutPlayer && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <span className="text-xs font-bold text-emerald-400">{scoutPlayer.position}</span>
                  <span className="text-sm text-white">{scoutPlayer.full_name}</span>
                  {scoutPlayer.team && <span className="text-xs text-zinc-400">{scoutPlayer.team}</span>}
                  {scoutPlayer.injuryStatus && <span className="text-xs text-yellow-400">⚠ {scoutPlayer.injuryStatus}</span>}
                  <button onClick={onScoutClearPlayer} className="ml-auto text-xs text-zinc-500 hover:text-indigo-400">✕</button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Context <span className="text-zinc-600">(optional)</span>
              </label>
              <textarea
                value={scoutContext}
                onChange={(e) => onScoutContextChange(e.target.value)}
                placeholder={`e.g. "Should I trade for him in dynasty?" or "He just got hurt — what's his outlook?"`}
                rows={2}
                maxLength={300}
                className="w-full resize-none rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
              />
              <p className="mt-1 text-right text-[10px] text-zinc-600">{scoutContext.length}/300</p>
            </div>

            <button
              onClick={onScoutRun}
              disabled={!scoutPlayer || phase === 'running'}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Generate Scouting Report →
            </button>
            {!scoutPlayer && (
              <p className="text-center text-xs text-zinc-600">
                Search for and select a player above to continue
              </p>
            )}
          </div>
        )}

        {/* Loading */}
        {msg.role === 'assistant' && msg.type === 'loading' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-4">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs font-medium text-indigo-400">Analyzing</span>
            </div>
            <p className="text-sm text-zinc-400">{loadingMsg}</p>
          </div>
        )}

        {/* Result */}
        {msg.role === 'assistant' && msg.type === 'result' && msg.result.output != null && (
          <>
            <AgentResults result={msg.result} onRate={onRate} />
            <FollowUpThread runId={msg.runId} getToken={getToken} />
          </>
        )}
      </div>
    </div>
  )
}
