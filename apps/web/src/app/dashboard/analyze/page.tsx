'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import { TeamEvalResults } from '@/components/TeamEvalResults'
import type { AgentRunResult } from '@/components/TeamEvalResults'
import type { TeamEvalOutput } from '@rzf/shared/types'
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
  | { id: string; role: 'assistant'; type: 'league-select'; leagues: League[] }
  | { id: string; role: 'assistant'; type: 'loading' }
  | { id: string; role: 'assistant'; type: 'result'; result: AgentRunResult }
  | { id: string; role: 'assistant'; type: 'error'; content: string }
  | { id: string; role: 'user'; type: 'user'; content: string }

const QUICK_ACTIONS = [
  { type: 'team_eval', label: 'Team Analysis', icon: '📊', available: true, desc: 'Full roster grade & insights' },
  { type: 'waiver_wire', label: 'Waiver Wire', icon: '🔄', available: false, desc: 'Best adds & drops' },
  { type: 'trade_analysis', label: 'Trade Advice', icon: '💱', available: false, desc: 'Accept or reject offers' },
  { type: 'start_sit', label: 'Start / Sit', icon: '📋', available: false, desc: 'Weekly lineup decisions' },
]

const LOADING_MESSAGES = [
  'Pulling your roster from Sleeper...',
  'Checking injury reports and depth charts...',
  'Analyzing position strengths...',
  'Running AI evaluation...',
  'Finalizing your personalized report...',
]

let _id = 0
const mid = () => `m${++_id}`
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const { getToken } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const loadingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [leagues, setLeagues] = useState<League[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [focusNote, setFocusNote] = useState('')
  const [textInput, setTextInput] = useState('')
  const [phase, setPhase] = useState<'idle' | 'league-select' | 'running' | 'done'>('idle')
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

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initial greeting + load leagues
  useEffect(() => {
    const init = async () => {
      await delay(300)
      push({ id: mid(), role: 'assistant', type: 'text', content: "Hey! I'm your RZF assistant. What would you like to know about your fantasy teams?" })
      await delay(700)
      push({ id: mid(), role: 'assistant', type: 'chips' })
    }
    init()

    getToken().then(async (token) => {
      if (!token) return
      try {
        const data = await api.getLeagues(token)
        const list = data.leagues as League[]
        setLeagues(list)
        if (list.length === 1) setSelectedLeague(list[0]!.league_id)
      } catch { /* silent */ }
    })
  }, []) // intentional one-time init — getToken is stable, leagues loaded via separate state

  // Loading message cycle
  useEffect(() => {
    if (phase !== 'running') return
    loadingRef.current = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length), 2500)
    return () => { if (loadingRef.current) clearInterval(loadingRef.current) }
  }, [phase])

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
            push({ id: mid(), role: 'assistant', type: 'result', result: run })
          } else {
            const msg = run.errorMessage ?? 'Unknown error'
            console.error(`[rzf-ui] Agent run failed — runId=${run.id} error=${msg}`)
            push({ id: mid(), role: 'assistant', type: 'error', content: `${msg}\n\nRun ID: ${run.id}` })
          }
        }
      } catch { clearInterval(pollRef.current!) }
    }, 2000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [runId, phase, getToken, push])

  const startRunning = useCallback(async (leagueId: string, note?: string) => {
    setPhase('running')
    push({ id: mid(), role: 'assistant', type: 'loading' })
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { agentRunId } = await api.runTeamEval(token, leagueId, note || undefined)
      setRunId(agentRunId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start analysis.'
      console.error(`[rzf-ui] Failed to enqueue run — leagueId=${leagueId} error=${msg}`)
      setPhase('done')
      setMessages((prev) => prev.filter((m) => m.type !== 'loading'))
      push({ id: mid(), role: 'assistant', type: 'error', content: msg })
    }
  }, [getToken, push])

  const handleQuickAction = useCallback(async (type: string) => {
    if (type !== 'team_eval' || phase !== 'idle') return
    push({ id: mid(), role: 'user', type: 'user', content: 'Team Analysis' })
    setPhase('league-select')
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'text', content: "Team evaluation — I'll grade every position and give you specific, actionable insights." })
    })
    await delay(300)
    await showTypingThen(() => {
      push({ id: mid(), role: 'assistant', type: 'league-select', leagues })
    }, 500)
  }, [phase, leagues, push, showTypingThen])

  const handleRun = useCallback(async () => {
    if (!selectedLeague) return
    const league = leagues.find((l) => l.league_id === selectedLeague)
    push({ id: mid(), role: 'user', type: 'user', content: `Analyze ${league?.name ?? 'my team'}${focusNote ? ` — "${focusNote}"` : ''}` })
    await startRunning(selectedLeague, focusNote)
  }, [selectedLeague, leagues, focusNote, push, startRunning])

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
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? "I can run a full team analysis for you. Click the button below!" })
          if (phase === 'idle') push({ id: mid(), role: 'assistant', type: 'chips' })
        } else if (intent.missingParams.includes('leagueId')) {
          setPhase('league-select')
          push({ id: mid(), role: 'assistant', type: 'text', content: intent.clarifyingQuestion ?? 'Which league should I analyze?' })
          push({ id: mid(), role: 'assistant', type: 'league-select', leagues })
        } else {
          await startRunning(intent.gatheredParams['leagueId']!)
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

  return (
    <div className="flex h-screen flex-col bg-zinc-950">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/20 ring-1 ring-red-500/40">
            <span className="text-sm font-bold text-red-400">RZF</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RZF Assistant</p>
            <p className="text-xs text-zinc-500">AI-powered fantasy analysis</p>
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
              onLeagueChange={setSelectedLeague}
              focusNote={focusNote}
              onFocusChange={setFocusNote}
              onRun={handleRun}
              onRate={handleRate}
              onQuickAction={handleQuickAction}
              loadingMsg={LOADING_MESSAGES[loadingMsgIdx]!}
              phase={phase}
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

// ── Message Bubble ─────────────────────────────────────────────────────────────

function MessageBubble({
  msg,
  leagues: _leagues,
  selectedLeague,
  onLeagueChange,
  focusNote,
  onFocusChange,
  onRun,
  onRate,
  onQuickAction,
  loadingMsg,
  phase,
}: {
  msg: ChatMessage
  leagues: League[]
  selectedLeague: string
  onLeagueChange: (id: string) => void
  focusNote: string
  onFocusChange: (v: string) => void
  onRun: () => void
  onRate: (r: 'up' | 'down') => void
  onQuickAction: (type: string) => void
  loadingMsg: string
  phase: string
}) {
  const isUser = msg.role === 'user'

  return (
    <div className={cn('flex animate-in fade-in slide-in-from-bottom-2 duration-300', isUser ? 'justify-end' : 'justify-start gap-2.5')}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/20 ring-1 ring-red-500/30">
          <span className="text-[10px] font-bold text-red-400">R</span>
        </div>
      )}

      <div className={cn(isUser ? 'max-w-[70%]' : 'min-w-0 flex-1 max-w-[85%]')}>

        {/* User bubble */}
        {isUser && (
          <div className="rounded-2xl rounded-tr-sm bg-zinc-800 px-4 py-2.5 text-sm text-white ring-1 ring-white/10">
            {'content' in msg ? msg.content : ''}
          </div>
        )}

        {/* Typing */}
        {msg.role === 'assistant' && msg.type === 'typing' && (
          <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}

        {/* Text */}
        {msg.role === 'assistant' && msg.type === 'text' && (
          <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-zinc-900 px-4 py-3 text-sm leading-relaxed text-zinc-200">
            {msg.content}
          </div>
        )}

        {/* Error */}
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
                onClick={() => onQuickAction(action.type)}
                disabled={!action.available || phase !== 'idle'}
                className={cn(
                  'relative flex flex-col gap-1 rounded-xl border p-3 text-left transition',
                  action.available && phase === 'idle'
                    ? 'border-white/10 bg-zinc-900 hover:border-red-500/40 hover:bg-red-500/5 cursor-pointer'
                    : 'border-white/5 bg-zinc-900/50 cursor-not-allowed opacity-50',
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{action.icon}</span>
                  {!action.available && (
                    <span className="rounded-full bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
                      Soon
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
            {msg.leagues.length === 0 ? (
              <p className="text-sm text-zinc-400">
                No leagues found.{' '}
                <a href="/account/sleeper" className="text-red-400 underline">Connect Sleeper →</a>
              </p>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedLeague}
                  onChange={(e) => onLeagueChange(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/50"
                >
                  {msg.leagues.length > 1 && <option value="" disabled>Select a league...</option>}
                  {msg.leagues.map((l) => (
                    <option key={l.league_id} value={l.league_id}>
                      {l.name} ({l.season})
                    </option>
                  ))}
                </select>

                <div>
                  <p className="mb-1.5 text-[11px] text-zinc-500">Optional: anything specific to focus on?</p>
                  <input
                    type="text"
                    value={focusNote}
                    onChange={(e) => onFocusChange(e.target.value)}
                    placeholder='e.g. "check my RB depth" or "I want to trade my TE"'
                    maxLength={200}
                    className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
                  />
                </div>

                <button
                  onClick={onRun}
                  disabled={!selectedLeague || phase === 'running'}
                  className="w-full rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Analyze my team →
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
        {msg.role === 'assistant' && msg.type === 'result' && msg.result.output && (
          <TeamEvalResults
            result={msg.result as AgentRunResult & { output: TeamEvalOutput }}
            onRate={onRate}
          />
        )}
      </div>
    </div>
  )
}
