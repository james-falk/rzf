'use client'

import { useState } from 'react'
import { MessageSquarePlus, X, Send } from 'lucide-react'

export function FeedbackWidget() {
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
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium shadow-xl transition"
        style={{ background: 'rgb(26,26,26)', border: '1px solid rgb(48,48,48)', color: 'rgb(163,163,163)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgb(80,80,80)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgb(163,163,163)'; e.currentTarget.style.borderColor = 'rgb(48,48,48)' }}
      >
        <MessageSquarePlus size={14} />
        Feedback
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-6">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm" style={{ animation: 'slideUp 0.2s ease-out' }}>
            <div className="rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'rgb(14,14,14)', border: '1px solid rgb(38,38,38)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgb(38,38,38)' }}>
                <div>
                  <p className="text-sm font-semibold text-white">Share Feedback</p>
                  <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>What would you like to see improved?</p>
                </div>
                <button onClick={() => setOpen(false)} style={{ color: 'rgb(115,115,115)' }} className="hover:text-white transition">
                  <X size={16} />
                </button>
              </div>

              {submitted ? (
                <div className="px-5 py-8 text-center">
                  <p className="text-2xl mb-2">✓</p>
                  <p className="text-sm font-medium text-white">Thanks for your feedback!</p>
                  <p className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>We read every submission.</p>
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
                    className="w-full resize-none rounded-xl px-4 py-3 text-sm text-white outline-none transition"
                    style={{
                      background: 'rgb(26,26,26)',
                      border: '1px solid rgb(48,48,48)',
                      color: 'white',
                    }}
                  />
                  <p className="text-right text-[10px]" style={{ color: 'rgb(80,80,80)' }}>{message.length}/2000</p>

                  <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ border: '1px dashed rgb(48,48,48)' }}>
                    <span className="text-xs" style={{ color: 'rgb(80,80,80)' }}>📎 Attach screenshot — coming soon</span>
                  </div>

                  {error && <p className="text-xs" style={{ color: 'rgb(220,38,38)' }}>{error}</p>}

                  <button
                    type="submit"
                    disabled={!message.trim() || submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: 'rgb(220,38,38)' }}
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

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  )
}
