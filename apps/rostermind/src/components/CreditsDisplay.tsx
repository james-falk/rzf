'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'
import Link from 'next/link'

export function CreditsDisplay() {
  const { getToken } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [tier, setTier] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.getUsage(token)
        if (!cancelled) {
          setCredits(data.runCredits)
          setTier(data.tier)
        }
      } catch { /* silent */ }
    }
    void load()
    return () => { cancelled = true }
  }, [getToken])

  if (credits === null) return null

  const low = credits <= 5
  const empty = credits === 0

  return (
    <Link
      href="/account/billing"
      className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-900 px-3 py-2 transition hover:border-white/10"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
          {tier === 'paid' ? 'Pro Plan' : 'Free Plan'}
        </p>
        <p className={`mt-0.5 text-xs font-medium ${empty ? 'text-red-400' : low ? 'text-amber-400' : 'text-zinc-300'}`}>
          {empty ? 'No runs left' : `${credits} run${credits === 1 ? '' : 's'} left`}
        </p>
      </div>
      {(low || empty) && (
        <span className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide bg-indigo-500/20 text-indigo-300">
          {tier === 'paid' ? 'Refill' : 'Upgrade'}
        </span>
      )}
    </Link>
  )
}
