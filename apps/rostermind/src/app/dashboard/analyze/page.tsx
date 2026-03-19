'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { AgentResults } from '@/components/AgentResults'
import type { AgentRunResult } from '@/components/AgentResults'
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
  | { id: string; role: 'assistant'; type: 'compare-select' }
  | { id: string; role: 'assistant'; type: 'loading'; agentType: string }
  | { id: string; role: 'assistant'; type: 'result'; result: AgentRunResult; runId: string }
  | { id: string; role: 'assistant'; type: 'error'; content: string }
  | { id: string; role: 'assistant'; type: 'context-prompt'; agentType: string; question: string }
  | { id: string; role: 'assistant'; type: 'intent-confirm'; question: string; onYes: () => void; onNo: () => void }
  | { id: string; role: 'user'; type: 'user'; content: string }

const QUICK_ACTIONS = [
  { type: 'team_eval',      label: 'Team Analysis',    icon: '📊', desc: 'Full roster grade & insights' },
  { type: 'injury_watch',   label: 'Injury Report',    icon: '🏥', desc: 'Injury risk scan for your starters' },
  { type: 'waiver',         label: 'Waiver Wire',      icon: '🔄', desc: 'Best adds & drops this week' },
  { type: 'lineup',         label: 'Start / Sit',      icon: '📋', desc: 'Optimized lineup decisions' },
  { type: 'trade_analysis', label: 'Trade Advice',     icon: '💱', desc: 'Accept or reject trade offers' },
  { type: 'player_scout',   label: 'Player Scout',     icon: '🔍', desc: 'Deep-dive on any player' },
  { type: 'player_compare', label: 'Player Comparison',icon: '⚖️', desc: 'Side-by-side comparison of 2–3 players' },
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
  player_compare: [
    'Fetching trade values from all markets...',
    'Pulling news and context for each player...',
    'Analyzing trends and usage...',
    'Building side-by-side comparison...',
  ],
}

const DEFAULT_LOADING_MESSAGES = ['Processing your request...', 'Running AI analysis...', 'Almost done...']

let _id = 0
const mid = () => `m${++_id}`
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

function getContextQuestion(agentType: string): string {
  switch (agentType) {
    case 'team_eval':      return 'Any specific areas to focus on? (e.g., trade targets, playoff schedule, win-now vs rebuild)'
    case 'injury_watch':   return "Anything specific to flag? (e.g., a player's return timeline, handcuff options)"
    case 'waiver':         return 'Any target positions or specific players you have in mind?'
    case 'lineup':         return 'Any start/sit decisions you\'re on the fence about?'
    case 'trade_analysis': return 'Any context on this trade? (e.g., dynasty vs redraft, win-now mode)'
    case 'player_scout':   return "What's your main focus? (e.g., 'Should I start him?', 'What's his dynasty value?')"
    case 'player_compare': return 'Any specific angle to focus on? (e.g., dynasty value, redraft, start/sit decision)'
    default:               return 'Any specific focus for this analysis? (optional)'
  }
}

function getAgentIntro(agentType: string): string {
  switch (agentType) {
    case 'team_eval':      return "Team evaluation — I'll grade every position and give you specific, actionable insights."
    case 'injury_watch':   return "Injury report — I'll scan your starters for health risks and give you handcuff recommendations."
    case 'waiver':         return "Waiver wire — I'll find the best available pickups tailored to your roster's weak spots."
    case 'lineup':         return "Lineup optimizer — I'll set the best possible lineup for this week based on matchups and injuries."
    case 'trade_analysis': return "Trade advisor — build the trade below and I'll give you an accept, decline, or counter verdict."
    case 'player_scout':   return "Player scout — search for any player and I'll give you a deep-dive scouting report."
    case 'player_compare': return "Player comparison — search and select 2–3 players and I'll give you a full side-by-side breakdown."
    default:               return "Which league should I analyze?"
  }
}

const CONTEXT_ACK: Record<string, string> = {
  team_eval:      "Got it — I'll factor that into your team evaluation.",
  injury_watch:   "Noted — I'll flag that specifically in the injury report.",
  waiver:         "Understood — I'll prioritize that in the waiver recommendations.",
  lineup:         "Good to know — I'll focus on that in the lineup breakdown.",
  trade_analysis: "Got it — I'll keep that context in mind for the trade analysis.",
  player_scout:   "Perfect — I'll focus the scouting report around that.",
  player_compare: "Got it — I'll weight that angle in the comparison.",
}

const MANAGER_PATTERNS = [
  'what can you do', 'what do you do', 'how do you work', 'what are you', 'who are you',
  'help me', 'where do i start', 'what should i do', 'how can you help', 'what do you offer',
  'what features', 'what can you help', 'tell me about yourself',
]
function isManagerQuery(msg: string): boolean {
  const lower = msg.toLowerCase().trim()
  if (lower.length < 3) return false
  return MANAGER_PATTERNS.some((p) => lower.includes(p))
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
  const [phase, setPhase] = useState<'idle' | 'context-prompting' | 'league-select' | 'trade-select' | 'scout-select' | 'compare-select' | 'running' | 'follow-up'>('idle')
  const [pendingAgentType, setPendingAgentType] = useState('team_eval')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [runId, setRunId] = useState<string | null>(null)
  const [followUpRunId, setFollowUpRunId] = useState<string | null>(null)
  const [credits, setCredits] = useState<number | null>(null)
  const [focusNote, setFocusNote] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [resultCount, setResultCount] = useState(0)
  const [summarizing, setSummarizing] = useState(false)

  // Trade state
  const [givingPlayers, setGivingPlayers] = useState<PlayerSearch[]>([])
  const [receivingPlayers, setReceivingPlayers] = useState<PlayerSearch[]>([])
  const [tradeLeague, setTradeLeague] = useState('')
  const [tradeActiveSelector, setTradeActiveSelector] = useState<'giving' | 'receiving' | null>(null)
  const [myRoster, setMyRoster] = useState<PlayerSearch[]>([])
  const [rosterLoading, setRosterLoading] = useState(false)
  const [playerPickMode, setPlayerPickMode] = useState<'search' | 'myteam'>('search')

  // Compare state
  const [comparePlayers, setComparePlayers] = useState<PlayerSearch[]>([])

  // Scout state
  const [scoutPlayer, setScoutPlayer] = useState<PlayerSearch | null>(null)
  const [scoutQuery, setScoutQuery] = useState('')
  const [scoutShowResults, setScoutShowResults] = useState(false)

  // Shared player search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerSearch[]>([])
  const [searching, setSearching] = useState(false)
  const [posFilter, setPosFilter] = useState('All')

  const ensureSession = useCallback(async (token: string): Promise<string> => {
    if (sessionId) return sessionId
    try {
      const { sessionId: newId } = await api.createSession(token)
      setSessionId(newId)
      return newId
    } catch { return '' }
  }, [sessionId])

  const persistMessage = useCallback(async (
    token: string,
    sid: string,
    role: 'user' | 'assistant',
    type: string,
    content: string,
    agentRunId?: string,
  ) => {
    if (!sid) return
    api.addSessionMessage(token, sid, { role, type, content, agentRunId }).catch(() => {})
  }, [])

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
      push({ id: mid(), role: 'assistant', type: 'text', content: "Hey! I'm RosterMind — your AI fantasy football manager. I can run trade analysis, set your lineup, find waiver wire pickups, scout players, monitor injuries, and do a full team evaluation. What are you working on?" })
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
      try {
        const usage = await api.getUsage(token)
        setCredits(usage.runCredits)
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
          setMessages((prev) => prev.filter((m) => m.type !== 'loading'))
          if (run.status === 'done' && run.output) {
            push({ id: mid(), role: 'assistant', type: 'result', result: run as AgentRunResult, runId })
            setCredits((prev) => (prev !== null ? Math.max(0, prev - 1) : prev))
            setResultCount((prev) => prev + 1)
            const token = await getToken()
            if (token) {
              const sid = await ensureSession(token)
              persistMessage(token, sid, 'assistant', 'result', JSON.stringify({ agentType: run.agentType }), run.id)
            }
            setFollowUpRunId(runId)
            setPhase('follow-up')
          } else {
            setPhase('idle')
            push({ id: mid(), role: 'assistant', type: 'error', content: `${run.errorMessage ?? 'Unknown error'}\n\nRun ID: ${run.id}` })
          }
        }
      } catch { clearInterval(pollRef.current!) }
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [runId, phase, getToken, push])

  // Fetch the user's own roster when trade league changes
  useEffect(() => {
    if (!tradeLeague) { setMyRoster([]); return }
    setRosterLoading(true)
    getToken().then(async (token) => {
      if (!token) return
      try {
        const data = await api.getRoster(token, tradeLeague)
        setMyRoster(data.players)
      } catch { setMyRoster([]) }
      finally { setRosterLoading(false) }
    })
  }, [tradeLeague, getToken])

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
    if (credits !== null && credits <= 0) {
      push({ id: mid(), role: 'assistant', type: 'error', content: "You're out of credits. Upgrade your plan to run more analyses." })
      return
    }
    setPhase('running')
    setPendingAgentType(agentType)
    push({ id: mid(), role: 'assistant', type: 'loading', agentType })
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runAgent(token, agentType, input, sessionId)
      setRunId(agentRunId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start analysis.'
      setPhase('idle')
      setMessages((prev) => prev.filter((m) => m.type !== 'loading'))
      push({ id: mid(), role: 'assistant', type: 'error', content: msg })
    }
  }, [getToken, push, sessionId, credits])

  const handleQuickAction = useCallback(async (action: typeof QUICK_ACTIONS[number]) => {
    if (phase === 'running') return
    push({ id: mid(), role: 'user', type: 'user', content: action.label })
    setPendingAgentType(action.type)
    setFocusNote('')

    if (action.type === 'trade_analysis') {
      setGivingPlayers([])
      setReceivingPlayers([])
      setTradeActiveSelector(null)
      setSearchQuery('')
      setSearchResults([])
    }
    if (action.type === 'player_scout') {
      setScoutPlayer(null)
      setScoutQuery('')
      setSearchResults([])
    }
    if (action.type === 'player_compare') {
      setComparePlayers([])
      setSearchQuery('')
      setSearchResults([])
    }

    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro(action.type) })
    })
    await delay(300)
    // Enter context-prompting phase before showing the selector
    setPhase('context-prompting')
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'context-prompt', agentType: action.type, question: getContextQuestion(action.type) })
    }, 500)
  }, [phase, push, showTypingThen])

  const handleLeagueRun = useCallback(async () => {
    if (!selectedLeague) return
    const league = leagues.find((l) => l.league_id === selectedLeague)
    const action = QUICK_ACTIONS.find((a) => a.type === pendingAgentType)
    push({ id: mid(), role: 'user', type: 'user', content: `Run ${action?.label ?? 'analysis'} for ${league?.name ?? 'my team'}` })
    await startRunning(pendingAgentType, { leagueId: selectedLeague, ...(focusNote.trim() ? { focusNote: focusNote.trim() } : {}) })
  }, [selectedLeague, leagues, pendingAgentType, focusNote, push, startRunning])

  const handleTradeRun = useCallback(async () => {
    if (!tradeLeague || givingPlayers.length === 0 || receivingPlayers.length === 0) return
    const giveNames = givingPlayers.map((p) => p.full_name).join(', ')
    const receiveNames = receivingPlayers.map((p) => p.full_name).join(', ')
    push({ id: mid(), role: 'user', type: 'user', content: `Analyze trade: give ${giveNames} — receive ${receiveNames}` })
    await startRunning('trade_analysis', {
      leagueId: tradeLeague,
      giving: givingPlayers.map((p) => p.player_id),
      receiving: receivingPlayers.map((p) => p.player_id),
      ...(focusNote.trim() ? { focusNote: focusNote.trim() } : {}),
    })
  }, [tradeLeague, givingPlayers, receivingPlayers, focusNote, push, startRunning])

  const handleScoutRun = useCallback(async () => {
    if (!scoutPlayer) return
    push({ id: mid(), role: 'user', type: 'user', content: `Scout ${scoutPlayer.full_name}${focusNote.trim() ? ` — ${focusNote.trim()}` : ''}` })
    await startRunning('player_scout', {
      playerId: scoutPlayer.player_id,
      ...(focusNote.trim() ? { focusNote: focusNote.trim() } : {}),
    })
  }, [scoutPlayer, focusNote, push, startRunning])

  const handleCompareRun = useCallback(async () => {
    if (comparePlayers.length < 2) return
    const names = comparePlayers.map((p) => p.full_name).join(' vs ')
    push({ id: mid(), role: 'user', type: 'user', content: `Compare ${names}${focusNote.trim() ? ` — ${focusNote.trim()}` : ''}` })
    await startRunning('player_compare', {
      playerIds: comparePlayers.map((p) => p.player_id),
      ...(focusNote.trim() ? { focusNote: focusNote.trim() } : {}),
    })
  }, [comparePlayers, focusNote, push, startRunning])

  const handleTextSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const msg = textInput.trim()
    setTextInput('')

    // ── Follow-up phase: route to the completed run's follow-up endpoint ───────
    if (phase === 'follow-up' && followUpRunId) {
      if (!msg) return
      push({ id: mid(), role: 'user', type: 'user', content: msg })
      await showTypingThen(async () => {
        try {
          const token = await getToken()
          if (!token) return
          const { reply, suggestedAgent } = await api.followUpAgentRun(token, followUpRunId, msg)
          push({ id: mid(), role: 'assistant', type: 'text', content: reply })
          if (suggestedAgent) {
            push({ id: mid(), role: 'assistant', type: 'text', content: `Want a deeper answer? I can run a full **${suggestedAgent.label}** — just say the word.` })
          }
        } catch {
          push({ id: mid(), role: 'assistant', type: 'error', content: 'Something went wrong. Please try again.' })
        }
      }, 800)
      return
    }

    // ── Context-prompting phase: capture focusNote then show selector ──────────
    if (phase === 'context-prompting') {
      setFocusNote(msg)
      if (msg) {
        push({ id: mid(), role: 'user', type: 'user', content: msg })
        const token = await getToken()
        if (token) {
          const sid = await ensureSession(token)
          persistMessage(token, sid, 'user', 'user', msg)
        }
        const ack = CONTEXT_ACK[pendingAgentType] ?? 'Got it — I\'ll factor that in.'
        await showTypingThen(() => {
          push({ id: mid(), role: 'assistant', type: 'text', content: ack })
        }, 500)
      }
      await showTypingThen(() => {
        if (pendingAgentType === 'trade_analysis') {
          setPhase('trade-select')
          push({ id: mid(), role: 'assistant', type: 'trade-select' })
        } else if (pendingAgentType === 'player_scout') {
          setPhase('scout-select')
          push({ id: mid(), role: 'assistant', type: 'scout-select' })
        } else if (pendingAgentType === 'player_compare') {
          setPhase('compare-select')
          push({ id: mid(), role: 'assistant', type: 'compare-select' })
        } else {
          setPhase('league-select')
          push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: pendingAgentType })
        }
      }, msg ? 400 : 600)
      return
    }

    if (!msg) return
    push({ id: mid(), role: 'user', type: 'user', content: msg })
    const token = await getToken()
    if (token) {
      const sid = await ensureSession(token)
      persistMessage(token, sid, 'user', 'user', msg)
    }

    // ── Manager query: conversational/meta questions ───────────────────────────
    if (isManagerQuery(msg)) {
      await showTypingThen(() => {
        push({ id: mid(), role: 'assistant', type: 'text', content: "I can help with trade analysis, lineup decisions, waiver wire pickups, player scouting, injury monitoring, and full team evaluations. Pick one of the options below, or just describe what you're trying to figure out and I'll route you to the right tool." })
        push({ id: mid(), role: 'assistant', type: 'chips' })
      }, 800)
      return
    }

    await showTypingThen(async () => {
      try {
        const token = await getToken()
        if (!token) return
        const intent = await api.callIntent(token, msg, selectedLeague ? { leagueId: selectedLeague } : undefined)

        // Intent clarification: player disambiguation
        if (intent.needsClarification && intent.clarifyingQuestion && intent.extractedPlayers?.length) {
          const playerToConfirm = intent.extractedPlayers.find((p) => p.confidence > 0 && p.confidence < 0.8)
          if (playerToConfirm) {
            const confirmId = mid()
            push({
              id: confirmId,
              role: 'assistant',
              type: 'intent-confirm',
              question: intent.clarifyingQuestion,
              onYes: () => {
                setMessages((prev) => prev.filter((m) => m.id !== confirmId))
                if (intent.agentType === 'player_scout' && playerToConfirm.playerId) {
                  setScoutPlayer({
                    player_id: playerToConfirm.playerId,
                    full_name: playerToConfirm.name,
                    position: '',
                    team: null,
                  })
                  setScoutQuery(playerToConfirm.name)
                }
                setPhase(intent.agentType === 'player_scout' ? 'scout-select'
                  : intent.agentType === 'trade_analysis' ? 'trade-select'
                  : 'league-select')
                if (intent.agentType !== 'player_scout' && intent.agentType !== 'trade_analysis') {
                  push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: intent.agentType! })
                } else {
                  push({ id: mid(), role: 'assistant', type: intent.agentType === 'player_scout' ? 'scout-select' : 'trade-select' })
                }
              },
              onNo: () => {
                setMessages((prev) => prev.filter((m) => m.id !== confirmId))
                push({ id: mid(), role: 'assistant', type: 'text', content: "No problem! You can search for the player manually below." })
              },
            })
            return
          }
        }

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
        } else if (intent.agentType === 'player_compare') {
          // Multi-player comparison — auto-run when all player IDs are gathered
          const playerIds = intent.gatheredParams['playerIds']?.split(',').filter(Boolean) ?? []
          if (playerIds.length >= 2) {
            push({ id: mid(), role: 'assistant', type: 'text', content: `Comparing ${intent.extractedPlayers?.map((p) => p.name).join(' vs ') ?? 'the selected players'}...` })
            await startRunning('player_compare', {
              playerIds,
              ...(intent.extractedFocusNote ? { focusNote: intent.extractedFocusNote } : {}),
            })
          } else {
            push({ id: mid(), role: 'assistant', type: 'text', content: "I'd love to compare players for you! Please name 2–4 players you'd like to compare." })
          }
        } else if (intent.agentType === 'player_scout') {
          setScoutPlayer(null)
          setScoutQuery('')
          const highConfPlayer = intent.extractedPlayers?.find((p) => p.confidence >= 0.8 && p.playerId)
          if (highConfPlayer) {
            // Auto-run if we have a high-confidence player match
            const focusNote = intent.extractedFocusNote ?? undefined
            push({ id: mid(), role: 'assistant', type: 'text', content: `Scouting ${highConfPlayer.name}${focusNote ? ` with focus on ${focusNote}` : ''}...` })
            await startRunning('player_scout', {
              playerId: highConfPlayer.playerId!,
              ...(focusNote ? { focusNote } : {}),
            })
          } else {
            setPendingAgentType('player_scout')
            setPhase('scout-select')
            push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro('player_scout') })
            push({ id: mid(), role: 'assistant', type: 'scout-select' })
          }
        } else if (intent.missingParams.includes('leagueId')) {
          setPendingAgentType(intent.agentType)
          setPhase('league-select')
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? 'Which league should I analyze?' })
          push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: intent.agentType })
        } else if (intent.readyToRun && intent.gatheredParams['leagueId']) {
          await startRunning(intent.agentType, { leagueId: intent.gatheredParams['leagueId'], ...(intent.extractedFocusNote ? { focusNote: intent.extractedFocusNote } : {}) })
        }
      } catch {
        push({ id: mid(), role: 'assistant', type: 'error', content: 'Something went wrong. Please try again.' })
      }
    }, 1000)
  }, [textInput, getToken, selectedLeague, leagues, phase, followUpRunId, pendingAgentType, push, showTypingThen, startRunning, ensureSession, persistMessage])

  const handleRate = useCallback(async (rateRunId: string, rating: 'up' | 'down') => {
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, rateRunId, rating)
    } catch { /* non-critical */ }
  }, [getToken])

  const handleSummarize = useCallback(async () => {
    if (!sessionId || summarizing) return
    const token = await getToken()
    if (!token) return
    setSummarizing(true)
    try {
      const { summary } = await api.getSessionSummary(token, sessionId)
      push({ id: mid(), role: 'assistant', type: 'text', content: `Session Summary: ${summary}` })
    } catch {
      push({ id: mid(), role: 'assistant', type: 'error', content: 'Failed to generate summary.' })
    } finally {
      setSummarizing(false)
    }
  }, [sessionId, summarizing, getToken, push])

  const loadingMessages = AGENT_LOADING_MESSAGES[pendingAgentType] ?? DEFAULT_LOADING_MESSAGES

  const handleFollowUpNew = useCallback(() => {
    setFollowUpRunId(null)
    setPhase('idle')
    push({ id: mid(), role: 'assistant', type: 'chips' })
  }, [push])

  const handleReset = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (loadingRef.current) { clearInterval(loadingRef.current); loadingRef.current = null }
    setMessages([])
    setPhase('idle')
    setRunId(null)
    setFollowUpRunId(null)
    setPendingAgentType('team_eval')
    setTextInput('')
    setFocusNote('')
    setSessionId(null)
    setResultCount(0)
    setGivingPlayers([])
    setReceivingPlayers([])
    setTradeLeague('')
    setTradeActiveSelector(null)
    setScoutPlayer(null)
    setScoutQuery('')
    setScoutShowResults(false)
    setComparePlayers([])
    setSearchQuery('')
    setSearchResults([])
  }, [])

  return (
    <div className="flex flex-1 min-h-0 flex-col bg-zinc-950">
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
            {credits !== null && (
              <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${credits === 0 ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-zinc-900'}`}>
                <svg viewBox="0 0 12 12" className={`h-3 w-3 shrink-0 ${credits === 0 ? 'text-red-400' : 'text-indigo-400'}`} fill="currentColor">
                  <path d="M6 1a5 5 0 100 10A5 5 0 006 1zm.5 7.5h-1v-3h1v3zm0-4h-1v-1h1v1z"/>
                </svg>
                <span className={`text-xs font-medium ${credits === 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                  {credits}<span className="hidden sm:inline"> {credits === 1 ? 'credit' : 'credits'}</span>
                </span>
              </div>
            )}
            {resultCount >= 2 && sessionId && (
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-400 transition hover:bg-indigo-500/10 disabled:opacity-40"
              >
                {summarizing ? 'Summarizing…' : 'Summarize'}
              </button>
            )}
            {messages.length > 0 && (
              <button
                onClick={handleReset}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-indigo-500/40 hover:text-white"
              >
                + New Chat
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5">
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
              credits={credits}
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
              myRoster={myRoster}
              rosterLoading={rosterLoading}
              playerPickMode={playerPickMode}
              onPlayerPickModeChange={setPlayerPickMode}
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
              scoutShowResults={scoutShowResults}
              scoutSearchResults={searchResults}
              scoutSearching={searching}
              scoutPosFilter={posFilter}
              onScoutQueryChange={(q) => { setScoutQuery(q); setScoutShowResults(true); setScoutPlayer(null) }}
              onScoutFocus={() => setScoutShowResults(true)}
              onScoutSelectPlayer={(p) => { setScoutPlayer(p); setScoutQuery(p.full_name); setSearchResults([]); setScoutShowResults(false) }}
              onScoutClearPlayer={() => { setScoutPlayer(null); setScoutQuery('') }}
              onScoutPosFilterChange={setPosFilter}
              onScoutRun={handleScoutRun}
              // Compare props
              comparePlayers={comparePlayers}
              onCompareAddPlayer={(p) => {
                if (comparePlayers.length < 3 && !comparePlayers.find((c) => c.player_id === p.player_id)) {
                  setComparePlayers((prev) => [...prev, p])
                }
                setSearchQuery('')
                setSearchResults([])
              }}
              onCompareRemovePlayer={(id) => setComparePlayers((prev) => prev.filter((p) => p.player_id !== id))}
              onCompareRun={handleCompareRun}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Text input */}
      {phase !== 'running' && (
        <div className="border-t border-white/10 bg-zinc-950 px-4 py-4 md:px-6">
          {phase === 'follow-up' && (
            <div className="mx-auto mb-2 flex max-w-2xl items-center justify-between">
              <span className="text-xs text-zinc-500">Following up on this report — ask anything</span>
              <button
                type="button"
                onClick={handleFollowUpNew}
                className="text-xs text-indigo-400 transition hover:text-indigo-300"
              >
                New topic →
              </button>
            </div>
          )}
          <form onSubmit={handleTextSubmit} className="mx-auto flex max-w-2xl items-center gap-3">
            <input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                phase === 'follow-up' ? 'Ask a follow-up question…' :
                phase === 'context-prompting' ? 'Type your focus, or press Enter to skip…' :
                phase === 'compare-select' ? 'Search for a player to add to comparison…' :
                'Ask me about your team...'
              }
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
  msg, leagues, selectedLeague, selectedYear, onLeagueChange, onYearChange, onRun, credits, onRate, onQuickAction,
  loadingMsg, phase, getToken,
  givingPlayers, receivingPlayers, tradeLeague, tradeLeagues, tradeActiveSelector,
  myRoster, rosterLoading, playerPickMode, onPlayerPickModeChange,
  searchQuery, searchResults, searching, posFilter,
  onTradeLeagueChange, onTradeActiveSelectorChange, onTradeSearchChange, onPosFilterChange,
  onTradeAddPlayer, onTradeRemovePlayer, onTradeRun,
  scoutPlayer, scoutQuery, scoutShowResults, scoutSearchResults, scoutSearching, scoutPosFilter,
  onScoutQueryChange, onScoutFocus, onScoutSelectPlayer, onScoutClearPlayer,
  onScoutPosFilterChange, onScoutRun,
  comparePlayers, onCompareAddPlayer, onCompareRemovePlayer, onCompareRun,
}: {
  msg: ChatMessage
  leagues: League[]
  selectedLeague: string
  selectedYear: string
  onLeagueChange: (id: string) => void
  onYearChange: (year: string) => void
  onRun: () => void
  credits: number | null
  onRate: (runId: string, r: 'up' | 'down') => void
  onQuickAction: (action: typeof QUICK_ACTIONS[number]) => void
  loadingMsg: string
  phase: string
  getToken: () => Promise<string | null>
  givingPlayers: PlayerSearch[]
  receivingPlayers: PlayerSearch[]
  tradeLeague: string
  tradeLeagues: League[]
  tradeActiveSelector: 'giving' | 'receiving' | null
  myRoster: PlayerSearch[]
  rosterLoading: boolean
  playerPickMode: 'search' | 'myteam'
  onPlayerPickModeChange: (mode: 'search' | 'myteam') => void
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
  scoutShowResults: boolean
  scoutSearchResults: PlayerSearch[]
  scoutSearching: boolean
  scoutPosFilter: string
  onScoutQueryChange: (q: string) => void
  onScoutFocus: () => void
  onScoutSelectPlayer: (p: PlayerSearch) => void
  onScoutClearPlayer: () => void
  onScoutPosFilterChange: (p: string) => void
  onScoutRun: () => void
  comparePlayers: PlayerSearch[]
  onCompareAddPlayer: (p: PlayerSearch) => void
  onCompareRemovePlayer: (id: string) => void
  onCompareRun: () => void
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

        {/* Context prompt */}
        {msg.role === 'assistant' && msg.type === 'context-prompt' && (
          <div className="rounded-2xl rounded-tl-sm border border-indigo-500/20 bg-indigo-500/5 px-4 py-3 space-y-2">
            <p className="text-sm text-zinc-200">{msg.question}</p>
            <p className="text-xs text-zinc-500">Type your focus in the chat below, or press Enter to skip.</p>
          </div>
        )}

        {/* Intent confirm (player disambiguation) */}
        {msg.role === 'assistant' && msg.type === 'intent-confirm' && (
          <div className="rounded-2xl rounded-tl-sm border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-3">
            <p className="text-sm text-zinc-200">{msg.question}</p>
            <div className="flex gap-2">
              <button
                onClick={msg.onYes}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
              >
                Yes
              </button>
              <button
                onClick={msg.onNo}
                className="rounded-lg border border-white/10 px-4 py-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
              >
                No, search manually
              </button>
            </div>
          </div>
        )}

        {/* Quick action chips */}
        {msg.role === 'assistant' && msg.type === 'chips' && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.type}
                onClick={() => onQuickAction(action)}
                disabled={phase === 'running'}
                className={cn(
                  'flex flex-col gap-1 rounded-xl border p-3 text-left transition',
                  phase !== 'running'
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
                  disabled={!selectedLeague || phase === 'running' || credits === 0}
                  className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {credits === 0 ? 'No Credits Remaining' : `Run ${QUICK_ACTIONS.find((a) => a.type === msg.agentType)?.label ?? 'Analysis'} — uses 1 credit →`}
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
                      <button onClick={() => onTradeRemovePlayer(p.player_id, 'giving')} className="flex h-8 w-8 items-center justify-center text-xs text-zinc-500 hover:text-indigo-400">✕</button>
                    </div>
                  ))}
                  {givingPlayers.length < 5 && (
                    <button
                      onClick={() => onTradeActiveSelectorChange('giving')}
                      className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-2.5 py-2.5 text-xs text-zinc-500 hover:border-white/20 hover:text-zinc-300"
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
                      <button onClick={() => onTradeRemovePlayer(p.player_id, 'receiving')} className="flex h-8 w-8 items-center justify-center text-xs text-zinc-500 hover:text-emerald-400">✕</button>
                    </div>
                  ))}
                  {receivingPlayers.length < 5 && (
                    <button
                      onClick={() => onTradeActiveSelectorChange('receiving')}
                      className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-white/10 px-2.5 py-2.5 text-xs text-zinc-500 hover:border-white/20 hover:text-zinc-300"
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

                {/* My Team / Search toggle */}
                {tradeLeague && (
                  <div className="mb-2 flex rounded-lg border border-white/10 bg-zinc-900 p-0.5">
                    <button
                      onClick={() => onPlayerPickModeChange('search')}
                      className={cn('flex-1 rounded-md py-1 text-xs font-medium transition', playerPickMode === 'search' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white')}
                    >
                      Search
                    </button>
                    <button
                      onClick={() => onPlayerPickModeChange('myteam')}
                      className={cn('flex-1 rounded-md py-1 text-xs font-medium transition', playerPickMode === 'myteam' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white')}
                    >
                      My Team
                    </button>
                  </div>
                )}

                {/* Position filter (shared) */}
                <div className="mb-2 flex flex-wrap gap-1">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onPosFilterChange(pos)}
                      className={cn('rounded px-2 py-1 text-xs font-medium transition', posFilter === pos ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white')}
                    >
                      {pos}
                    </button>
                  ))}
                </div>

                {/* Search input (search mode only) */}
                {playerPickMode === 'search' && (
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => onTradeSearchChange(e.target.value)}
                    placeholder="Search player name..."
                    className="mb-2 w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                  />
                )}

                <div className="max-h-40 overflow-y-auto space-y-0.5">
                  {/* Search mode results */}
                  {playerPickMode === 'search' && (
                    <>
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
                    </>
                  )}

                  {/* My Team mode results */}
                  {playerPickMode === 'myteam' && (
                    <>
                      {rosterLoading && <p className="px-2 py-2 text-xs text-zinc-500">Loading your roster...</p>}
                      {!rosterLoading && myRoster
                        .filter((p) => posFilter === 'All' || p.position === posFilter)
                        .map((p) => (
                          <button
                            key={p.player_id}
                            onClick={() => onTradeAddPlayer(p, tradeActiveSelector)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5"
                          >
                            <span className="w-7 text-[10px] font-bold text-zinc-500">{p.position}</span>
                            <span className="text-xs text-white">{p.full_name}</span>
                            {p.team && <span className="text-[10px] text-zinc-500">{p.team}</span>}
                            {p.injuryStatus && <span className="text-[10px] text-yellow-500">{p.injuryStatus}</span>}
                          </button>
                        ))}
                      {!rosterLoading && myRoster.filter((p) => posFilter === 'All' || p.position === posFilter).length === 0 && (
                        <p className="px-2 py-2 text-xs text-zinc-500">No players found on your roster</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={onTradeRun}
              disabled={!tradeLeague || givingPlayers.length === 0 || receivingPlayers.length === 0 || phase === 'running' || credits === 0}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {credits === 0 ? 'No Credits Remaining' : 'Analyze This Trade — uses 1 credit →'}
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
                  <div className="flex flex-wrap gap-1">
                    {POSITIONS.map((pos) => (
                      <button
                        key={pos}
                        onClick={() => onScoutPosFilterChange(pos)}
                        className={cn('rounded px-2 py-1.5 text-xs font-medium transition min-h-[32px]', scoutPosFilter === pos ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white')}
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

            <button
              onClick={onScoutRun}
              disabled={!scoutPlayer || phase === 'running' || credits === 0}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {credits === 0 ? 'No Credits Remaining' : 'Generate Scouting Report — uses 1 credit →'}
            </button>
            {!scoutPlayer && (
              <p className="text-center text-xs text-zinc-600">
                Search for and select a player above to continue
              </p>
            )}
          </div>
        )}

        {/* Compare select */}
        {msg.role === 'assistant' && msg.type === 'compare-select' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 p-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Select players to compare (2–3)</label>
              {comparePlayers.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-2">
                  {comparePlayers.map((p) => (
                    <div key={p.player_id} className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1.5 text-sm">
                      <span className="text-xs font-bold text-emerald-400">{p.position}</span>
                      <span className="text-white">{p.full_name}</span>
                      {p.team && <span className="text-xs text-zinc-400">{p.team}</span>}
                      <button onClick={() => onCompareRemovePlayer(p.player_id)} className="ml-1 text-zinc-500 hover:text-indigo-400 text-xs">✕</button>
                    </div>
                  ))}
                </div>
              )}
              {comparePlayers.length < 3 && (
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      value={searchQuery}
                      onChange={(e) => onTradeSearchChange(e.target.value)}
                      placeholder="Search player name..."
                      className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                    />
                    <div className="flex flex-wrap gap-1">
                      {POSITIONS.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => onPosFilterChange(pos)}
                          className={cn('rounded px-2 py-1.5 text-xs font-medium transition min-h-[32px]', posFilter === pos ? 'bg-indigo-600 text-white' : 'bg-zinc-700 text-zinc-400 hover:text-white')}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                  {searching && <p className="mt-1 text-xs text-zinc-500">Searching...</p>}
                  {searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                      <div className="max-h-48 overflow-y-auto py-1">
                        {searchResults.map((p) => (
                          <button
                            key={p.player_id}
                            onClick={() => onCompareAddPlayer(p)}
                            disabled={!!comparePlayers.find((c) => c.player_id === p.player_id)}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-white/5 disabled:opacity-40"
                          >
                            <span className="w-8 text-xs font-bold text-zinc-500">{p.position}</span>
                            <span className="flex-1 text-sm text-white">{p.full_name}</span>
                            {p.team && <span className="text-xs text-zinc-500">{p.team}</span>}
                            {p.injuryStatus && <span className="text-xs text-yellow-500">⚠</span>}
                            {comparePlayers.find((c) => c.player_id === p.player_id) && <span className="text-xs text-emerald-500">Added</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={onCompareRun}
              disabled={comparePlayers.length < 2 || phase === 'running' || credits === 0}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {credits === 0 ? 'No Credits Remaining' : comparePlayers.length >= 2 ? `Compare ${comparePlayers.map((p) => p.full_name).join(' vs ')} — uses 1 credit →` : `Select ${2 - comparePlayers.length} more player${2 - comparePlayers.length > 1 ? 's' : ''} to continue`}
            </button>
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
          <AgentResults result={msg.result} onRate={(r) => onRate(msg.runId, r)} />
        )}
      </div>
    </div>
  )
}
