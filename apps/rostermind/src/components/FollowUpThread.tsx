'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

let _seq = 0
const fid = () => `f${++_seq}`

export function FollowUpThread({
  runId,
  getToken,
}: {
  runId: string
  getToken: () => Promise<string | null>
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { id: fid(), role: 'user', content: msg }])
    setLoading(true)
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const { reply } = await api.followUpAgentRun(token, runId, msg)
      setMessages((prev) => [...prev, { id: fid(), role: 'assistant', content: reply }])
    } catch {
      setMessages((prev) => [...prev, { id: fid(), role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900/60">
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-xs font-semibold text-zinc-400">Follow-up Questions</p>
        <p className="text-[11px] text-zinc-600">Ask a question about this report — no credits used</p>
      </div>

      {messages.length > 0 && (
        <div className="space-y-3 px-4 py-3">
          {messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start gap-2')}>
              {msg.role === 'assistant' && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 ring-1 ring-indigo-500/30">
                  <span className="text-[9px] font-bold text-indigo-400">R</span>
                </div>
              )}
              <div className={cn(
                'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                msg.role === 'user'
                  ? 'rounded-tr-sm bg-zinc-800 text-white ring-1 ring-white/10'
                  : 'rounded-tl-sm border border-white/10 text-zinc-200',
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 ring-1 ring-indigo-500/30">
                <span className="text-[9px] font-bold text-indigo-400">R</span>
              </div>
              <div className="flex items-center gap-1 rounded-xl rounded-tl-sm border border-white/10 px-3 py-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          disabled={loading}
          className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-40"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </form>
    </div>
  )
}
