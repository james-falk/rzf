'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { API_BASE_URL } from '@/lib/client-env'
import { MessageSquarePlus, X, Send } from 'lucide-react'

const API_BASE = API_BASE_URL.replace(/\/$/, '')

export function FeedbackWidget() {
  const { getToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          app: 'rostermind',
          message: message.trim(),
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
      setMessage('')
      setTimeout(() => { setSubmitted(false); setOpen(false) }, 2500)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-400 shadow-xl transition hover:border-indigo-500/40 hover:text-white"
      >
        <MessageSquarePlus size={14} />
        Feedback
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-200">
            <div className="rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">Share Feedback</p>
                  <p className="text-xs text-zinc-500">What would you like to see improved?</p>
                </div>
                <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white transition">
                  <X size={16} />
                </button>
              </div>

              {submitted ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">✓</p>
                  <p className="text-sm font-medium text-white">Thanks for your feedback!</p>
                  <p className="mt-1 text-xs text-zinc-500">We read every submission.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe a feature request, improvement, or anything you'd like to see..."
                    rows={4}
                    maxLength={2000}
                    autoFocus
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <p className="text-right text-[10px] text-zinc-600">{message.length}/2000</p>

                  {/* Coming soon: screenshot */}
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2">
                    <span className="text-xs text-zinc-600">📎 Attach screenshot — coming soon</span>
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={!message.trim() || submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={14} />
                    {submitting ? 'Sending...' : 'Send Feedback'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
