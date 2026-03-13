'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'

export default function BillingPage() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const origin = window.location.origin
      const { url } = await api.createCheckoutSession(
        token,
        `${origin}/account/billing?success=true`,
        `${origin}/account/billing?canceled=true`,
      )
      if (url) window.location.href = url
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError('Payments are not yet configured. Contact support@redzonefantasy.com to upgrade.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to start checkout')
      }
    } finally {
      setLoading(false)
    }
  }

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const justUpgraded = searchParams?.get('success') === 'true'
  const canceled = searchParams?.get('canceled') === 'true'

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Billing</h1>
      <p className="mb-8 text-zinc-400">Manage your subscription</p>

      {justUpgraded && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
          🎉 You're now on Pro! Your 50 monthly credits are ready to use.
        </div>
      )}

      {canceled && (
        <div className="mb-6 rounded-xl border border-zinc-700 bg-zinc-900 p-4 text-sm text-zinc-400">
          Checkout canceled — you can upgrade anytime.
        </div>
      )}

      <div className="max-w-lg rounded-xl border border-white/10 bg-zinc-900 p-8">
        <div className="mb-6">
          <p className="mb-1 text-sm text-zinc-400">Current Plan</p>
          <p className="text-2xl font-bold text-white">Free</p>
          <p className="text-sm text-zinc-500">2 lifetime analyses included</p>
        </div>

        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-5">
          <h3 className="mb-1 text-base font-semibold text-white">Upgrade to Pro</h3>
          <p className="mb-3 text-sm text-zinc-400">50 agent runs per month + all agents including trade analysis and player scout</p>
          <p className="mb-4 text-3xl font-bold text-white">
            $20<span className="text-base font-normal text-zinc-400">/month</span>
          </p>
          {error && (
            <p className="mb-3 text-sm text-red-400">{error}</p>
          )}
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Redirecting to checkout...
              </span>
            ) : 'Upgrade to Pro →'}
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Need help? Contact{' '}
          <a href="mailto:support@redzonefantasy.com" className="text-red-400 hover:text-red-300">
            support@redzonefantasy.com
          </a>
        </p>
      </div>
    </div>
  )
}
