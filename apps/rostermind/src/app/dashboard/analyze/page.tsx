'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
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

type ChatMessage =
  | { id: string; role: 'assistant'; type: 'text'; content: string }
  | { id: string; role: 'assistant'; type: 'typing' }
  | { id: string; role: 'assistant'; type: 'chips' }
  | { id: string; role: 'assistant'; type: 'league-select'; leagues: League[]; agentType: string }
  | { id: string; role: 'assistant'; type: 'loading'; agentType: string }
  | { id: string; role: 'assistant'; type: 'result'; result: AgentRunResult; runId: string }
  | { id: string; role: 'assistant'; type: 'error'; content: string }
  | { id: string; role: 'user'; type: 'user'; content: string }

// Inline agents — handled within the chat UI (only need leagueId)
const INLINE_AGENTS = ['team_eval', 'injury_watch', 'waiver', 'lineup']

const QUICK_ACTIONS = [
  { type: 'team_eval', label: 'Team Analysis', icon: '📊', inline: true, desc: 'Full roster grade & insights' },
  { type: 'injury_watch', label: 'Injury Watch', icon: '🏥', inline: true, desc: 'Injury risk scan for your starters' },
  { type: 'waiver', label: 'Waiver Wire', icon: '🔄', inline: true, desc: 'Best adds & drops this week' },
  { type: 'lineup', label: 'Start / Sit', icon: '📋', inline: true, desc: 'Optimized lineup decisions' },
  { type: 'trade_analysis', label: 'Trade Advice', icon: '💱', inline: false, href: '/dashboard/trade', desc: 'Accept or reject trade offers' },
  { type: 'player_scout', label: 'Player Scout', icon: '🔍', inline: false, href: '/dashboard/scout', desc: 'Deep-dive on any player' },
]

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
}

const DEFAULT_LOADING_MESSAGES = [
  'Processing your request...',
  'Running AI analysis...',
  'Almost done...',
]

let _id = 0
const mid = () => `m${++_id}`
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()))
  const [textInput, setTextInput] = useState('')
  const [phase, setPhase] = useState<'idle' | 'league-select' | 'running' | 'done'>('idle')
  const [pendingAgentType, setPendingAgentType] = useState('team_eval')
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0)
  const [runId, setRunId] = useState<string | null>(null)

  const push = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg])
  }, [])

  const showTypingThen = useCallback(async (fn: () => void, ms = 800) => {
    const typingId = mid()
    setMessages((prev) => [...prev, { id: typingId, role: 'assistant', type: 'typing' }])
    await delay(ms)
    setMessages((prev) => prev.filter((m) => m.id !== typingId))
    fn()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        if (list.length === 1) setSelectedLeague(list[0]!.league_id)
      } catch { /* silent */ }
    })
  }, []) // intentional one-time init

  const handleYearChange = useCallback(async (year: string) => {
    setSelectedYear(year)
    setSelectedLeague('')
    try {
      const token = await getToken()
      if (!token) return
      const data = await api.getLeagues(token, year)
      const list = data.leagues as League[]
      setLeagues(list)
      if (list.length === 1) setSelectedLeague(list[0]!.league_id)
    } catch { /* silent */ }
  }, [getToken])

  // Loading message cycle
  useEffect(() => {
    if (phase !== 'running') return
    const msgs = AGENT_LOADING_MESSAGES[pendingAgentType] ?? DEFAULT_LOADING_MESSAGES
    setLoadingMsgIdx(0)
    loadingRef.current = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % msgs.length), 2500)
    return () => { if (loadingRef.current) clearInterval(loadingRef.current) }
  }, [phase, pendingAgentType])

  // Poll for result
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
            const msg = run.errorMessage ?? 'Unknown error'
            push({ id: mid(), role: 'assistant', type: 'error', content: `${msg}\n\nRun ID: ${run.id}` })
          }
        }
      } catch { clearInterval(pollRef.current!) }
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [runId, phase, getToken, push])

  const startRunning = useCallback(async (agentType: string, leagueId: string) => {
    setPhase('running')
    setPendingAgentType(agentType)
    push({ id: mid(), role: 'assistant', type: 'loading', agentType })
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runAgent(token, agentType, { leagueId })
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

    // Dedicated-page agents → navigate instead of inline
    if (!action.inline && action.href) {
      router.push(action.href)
      return
    }

    push({ id: mid(), role: 'user', type: 'user', content: action.label })
    setPendingAgentType(action.type)
    setPhase('league-select')
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'text', content: getAgentIntro(action.type) })
    })
    await delay(300)
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: action.type })
    }, 500)
  }, [phase, leagues, push, showTypingThen, router])

  const handleRun = useCallback(async () => {
    if (!selectedLeague) return
    const league = leagues.find((l) => l.league_id === selectedLeague)
    const action = QUICK_ACTIONS.find((a) => a.type === pendingAgentType)
    push({ id: mid(), role: 'user', type: 'user', content: `Run ${action?.label ?? 'analysis'} for ${league?.name ?? 'my team'}` })
    await startRunning(pendingAgentType, selectedLeague)
  }, [selectedLeague, leagues, pendingAgentType, push, startRunning])

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
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? "I can run a team analysis, injury watch, waiver recommendations, or lineup optimization. Click one of the options below!" })
          if (phase === 'idle') push({ id: mid(), role: 'assistant', type: 'chips' })
        } else if ((intent as { redirectUrl?: string }).redirectUrl) {
          // Complex agents need their dedicated page
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? `Let me take you to the ${intent.agentMeta.label} page.` })
          await delay(1200)
          router.push((intent as { redirectUrl?: string }).redirectUrl!)
        } else if (intent.missingParams.includes('leagueId')) {
          setPendingAgentType(intent.agentType)
          setPhase('league-select')
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? 'Which league should I analyze?' })
          push({ id: mid(), role: 'assistant', type: 'league-select', leagues, agentType: intent.agentType })
        } else if (intent.readyToRun && intent.gatheredParams['leagueId']) {
          await startRunning(intent.agentType, intent.gatheredParams['leagueId'])
        }
      } catch {
        push({ id: mid(), role: 'assistant', type: 'error', content: 'Something went wrong. Please try again.' })
      }
    }, 1000)
  }, [textInput, getToken, selectedLeague, leagues, phase, push, showTypingThen, startRunning, router])

  const handleRate = useCallback(async (rating: 'up' | 'down') => {
    if (!runId) return
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, runId, rating)
    } catch { /* non-critical */ }
  }, [runId, getToken])

  const loadingMessages = AGENT_LOADING_MESSAGES[pendingAgentType] ?? DEFAULT_LOADING_MESSAGES

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
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
          <div className="ml-auto flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-zinc-500">Online</span>
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
            onRun={handleRun}
            onRate={handleRate}
            onQuickAction={handleQuickAction}
            loadingMsg={loadingMessages[loadingMsgIdx] ?? loadingMessages[0]!}
            phase={phase}
            getToken={getToken}
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
              className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
            />
            <button
              type="submit"
              disabled={!textInput.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white transition hover:bg-red-500 disabled:opacity-40"
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

function getAgentIntro(agentType: string): string {
  switch (agentType) {
    case 'team_eval': return "Team evaluation — I'll grade every position and give you specific, actionable insights."
    case 'injury_watch': return "Injury watch — I'll scan your starters for health risks and give you handcuff recommendations."
    case 'waiver': return "Waiver wire — I'll find the best available pickups tailored to your roster's weak spots."
    case 'lineup': return "Lineup optimizer — I'll set the best possible lineup for this week based on matchups and injuries."
    default: return "Which league should I analyze?"
  }
}

// ── Message Bubble ─────────────────────────────────────────────────────────────

const YEAR_OPTIONS = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2].map(String)

function MessageBubble({
  msg,
  leagues,
  selectedLeague,
  selectedYear,
  onLeagueChange,
  onYearChange,
  onRun,
  onRate,
  onQuickAction,
  loadingMsg,
  phase,
  getToken,
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
}) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex animate-in fade-in slide-in-from-bottom-2 duration-300', isUser ? 'justify-end' : 'justify-start gap-2.5')}>
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/20 ring-1 ring-red-500/30">
          <span className="text-[10px] font-bold text-red-400">R</span>
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

        {/* Quick action chips — 2×2 inline + 2 link-out */}
        {msg.role === 'assistant' && msg.type === 'chips' && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.type}
                onClick={() => onQuickAction(action)}
                disabled={phase !== 'idle'}
                className={cn(
                  'relative flex flex-col gap-1 rounded-xl border p-3 text-left transition',
                  phase === 'idle'
                    ? 'border-white/10 bg-zinc-900 hover:border-red-500/40 hover:bg-red-500/5 cursor-pointer'
                    : 'border-white/5 bg-zinc-900/50 cursor-not-allowed opacity-50',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{action.icon}</span>
                  {!action.inline && (
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                      →
                    </span>
                  )}
                </div>
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
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                    selectedYear === y
                      ? 'bg-red-600 text-white'
                      : 'border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
            {leagues.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No leagues found for {selectedYear}.{' '}
                <a href="/account/sleeper" className="text-red-400 underline">Check Sleeper Account →</a>
              </p>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedLeague}
                  onChange={(e) => onLeagueChange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50"
                >
                  {leagues.length > 1 && <option value="" disabled>Select a league...</option>}
                  {leagues.map((l) => (
                    <option key={l.league_id} value={l.league_id}>
                      {l.name} ({l.season})
                    </option>
                  ))}
                </select>

                <button
                  onClick={onRun}
                  disabled={!selectedLeague || phase === 'running'}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Run {QUICK_ACTIONS.find((a) => a.type === msg.agentType)?.label ?? 'Analysis'} →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {msg.role === 'assistant' && msg.type === 'loading' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-4">
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-red-500" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs font-medium text-red-400">Analyzing</span>
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

// suppress unused variable warning — INLINE_AGENTS used for reference/documentation
void INLINE_AGENTS
