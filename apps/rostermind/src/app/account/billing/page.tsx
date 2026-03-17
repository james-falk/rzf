'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'

interface UsageData {
  tier: string
  runCredits: number
  monthlyRunsUsed: number
}

export default function BillingPage() {
  const { getToken } = useAuth()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loadingUsage, setLoadingUsage] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function initBillingPage() {
      const token = await getToken()
      if (!token) { setLoadingUsage(false); return }

      // If returning from a successful Stripe checkout, verify the session first
      // so the DB upgrade is applied immediately (before the async webhook fires).
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get('session_id')
      const isSuccess = params.get('success') === 'true'

      if (isSuccess && sessionId) {
        try {
          const verified = await api.verifyCheckout(token, sessionId)
          // Use the verified tier directly — no need to re-fetch
          setUsage({ tier: verified.tier, runCredits: verified.runCredits, monthlyRunsUsed: 0 })
          setLoadingUsage(false)
          return
        } catch {
          // Verification failed — fall through to normal usage fetch
        }
      }

      try {
        const data = await api.getUsage(token)
        setUsage({ tier: data.tier, runCredits: data.runCredits, monthlyRunsUsed: data.monthlyRunsUsed })
      } catch {
        // silently fail — fall back to showing free state
      } finally {
        setLoadingUsage(false)
      }
    }
    void initBillingPage()
  }, [getToken])

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const origin = window.location.origin
      // Stripe replaces {CHECKOUT_SESSION_ID} with the real session ID on redirect
      const { url } = await api.createCheckoutSession(
        token,
        `${origin}/account/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
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

  const [justUpgraded, setJustUpgraded] = useState(false)
  const [canceled, setCanceled] = useState(false)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    setJustUpgraded(p.get('success') === 'true')
    setCanceled(p.get('canceled') === 'true')
  }, [])

  const isPaid = usage?.tier === 'paid'
  const runsUsed = usage?.monthlyRunsUsed ?? 0
  const runsLeft = usage?.runCredits ?? 0
  const creditsLow = isPaid && runsLeft <= 5

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
        {loadingUsage ? (
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-800" />
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-800" />
          </div>
        ) : isPaid ? (
          <>
            <div className="mb-6">
              <p className="mb-1 text-sm text-zinc-400">Current Plan</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-white">Pro</p>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Active
                </span>
              </div>
              <p className="text-sm text-zinc-500">$20 / month</p>
            </div>

            <div className="mb-6 rounded-lg border border-white/10 bg-zinc-800 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Monthly Usage</h3>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-zinc-400">Agent runs this month</span>
                <span className={runsLeft <= 5 ? 'font-semibold text-orange-400' : 'text-white'}>
                  {runsUsed} / 50
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-700">
                <div
                  className={`h-2 rounded-full transition-all ${runsLeft <= 5 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min((runsUsed / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-500">{runsLeft} runs remaining — resets on your billing date</p>
            </div>

            {creditsLow && (
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <p className="mb-1 text-sm font-medium text-zinc-300">Running low on runs?</p>
                <p className="mb-3 text-xs text-zinc-500">Credit top-ups are coming soon — you'll be able to purchase extra runs without waiting for your billing cycle.</p>
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-white/10 py-2 text-sm text-zinc-500"
                >
                  Credit Refill — Coming Soon
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6">
              <p className="mb-1 text-sm text-zinc-400">Current Plan</p>
              <p className="text-2xl font-bold text-white">Free</p>
              <p className="text-sm text-zinc-500">2 lifetime analyses included</p>
            </div>

            <div className="mb-6 rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-5">
              <h3 className="mb-1 text-base font-semibold text-white">Upgrade to Pro</h3>
              <p className="mb-3 text-sm text-zinc-400">50 agent runs per month + all agents including trade analysis and player scout</p>
              <p className="mb-4 text-3xl font-bold text-white">
                $20<span className="text-base font-normal text-zinc-400">/month</span>
              </p>
              {error && (
                <p className="mb-3 text-sm text-indigo-400">{error}</p>
              )}
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redirecting to checkout...
                  </span>
                ) : 'Upgrade to Pro →'}
              </button>
            </div>
          </>
        )}

        <p className="text-center text-sm text-zinc-500">
          Need help? Contact{' '}
          <a href="mailto:support@redzonefantasy.com" className="text-indigo-400 hover:text-indigo-300">
            support@redzonefantasy.com
          </a>
        </p>
      </div>
    </div>
  )
}
