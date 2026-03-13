'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

interface ProGateProps {
  children: React.ReactNode
  /** Content shown in blur/CTA preview when user is not pro */
  preview?: React.ReactNode
}

export function ProGate({ children, preview }: ProGateProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const [loading, setLoading] = useState(false)

  // TODO: replace with real tier check from Clerk publicMetadata.directoryTier
  // For now, treat all signed-in users as free (stub)
  const isPro = false

  if (!isLoaded) return null

  if (isPro) return <>{children}</>

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          successUrl: `${window.location.href}?upgraded=1`,
          cancelUrl: window.location.href,
        }),
      })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) window.location.href = data.url
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Blurred preview */}
      {preview && (
        <div className="pointer-events-none select-none blur-sm">
          {preview}
        </div>
      )}

      {/* Paywall overlay */}
      <div
        className={`${preview ? 'absolute inset-0' : ''} flex items-center justify-center`}
        style={preview ? { background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.9) 40%, rgb(10,10,10) 100%)' } : {}}
      >
        <div
          className="mx-auto max-w-md rounded-2xl border p-8 text-center"
          style={{ borderColor: 'rgba(220,38,38,0.3)', background: 'rgba(10,10,10,0.95)' }}
        >
          <div className="mb-3 text-3xl">🔒</div>
          <h3 className="text-lg font-bold text-white">Pro Feature</h3>
          <p className="mt-2 text-sm" style={{ color: 'rgb(163,163,163)' }}>
            Upgrade to Red Zone Fantasy Pro to unlock full player details, complete content history, and AI-powered scouting reports.
          </p>
          <div className="mt-4 text-2xl font-bold text-white">
            $9<span className="text-base font-normal" style={{ color: 'rgb(115,115,115)' }}>/month</span>
          </div>
          {isSignedIn ? (
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="mt-5 w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'rgb(220,38,38)' }}
            >
              {loading ? 'Redirecting…' : 'Upgrade to Pro →'}
            </button>
          ) : (
            <a
              href="/sign-in"
              className="mt-5 block w-full rounded-lg py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{ background: 'rgb(220,38,38)' }}
            >
              Sign in to upgrade →
            </a>
          )}
          <p className="mt-3 text-xs" style={{ color: 'rgb(82,82,91)' }}>
            Cancel anytime · Secure payment via Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
