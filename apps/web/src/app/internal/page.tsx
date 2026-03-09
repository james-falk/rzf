'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

interface Overview {
  users: { total: number; today: number; week: number; free: number; paid: number }
  runs: { total: number; today: number; failed: number }
  analytics: { totalEvents: number }
}

export default function InternalOverviewPage() {
  const [data, setData] = useState<Overview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const secret = localStorage.getItem('admin_secret') ?? ''
      try {
        const overview = await api.getInternalOverview(secret)
        setData(overview as Overview)
      } catch {
        setError('Access denied or API unavailable. Check your admin secret.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="text-sm text-zinc-400">Loading...</div>

  if (error) return <AdminSecretForm onSet={() => window.location.reload()} error={error} />

  if (!data) return null

  const stats = [
    { label: 'Total Users', value: data.users.total },
    { label: 'New Today', value: data.users.today },
    { label: 'New This Week', value: data.users.week },
    { label: 'Free Users', value: data.users.free },
    { label: 'Paid Users', value: data.users.paid, highlight: true },
    { label: 'Runs Today', value: data.runs.today },
    { label: 'Total Runs', value: data.runs.total },
    { label: 'Failed Runs', value: data.runs.failed, alert: data.runs.failed > 0 },
    { label: 'Total Events', value: data.analytics.totalEvents },
  ]

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold text-white">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border bg-zinc-900 p-5 ${
              s.alert
                ? 'border-red-500/40'
                : s.highlight
                  ? 'border-emerald-500/30'
                  : 'border-white/10'
            }`}
          >
            <p className="mb-1 text-xs text-zinc-400">{s.label}</p>
            <p
              className={`text-3xl font-bold ${
                s.alert ? 'text-red-400' : s.highlight ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminSecretForm({ onSet, error }: { onSet: () => void; error: string }) {
  const [secret, setSecret] = useState('')

  function handleSet() {
    localStorage.setItem('admin_secret', secret)
    onSet()
  }

  return (
    <div className="max-w-sm">
      <h1 className="mb-4 text-2xl font-bold text-white">Admin Access</h1>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      <div className="flex gap-2">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret"
          className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-500"
          onKeyDown={(e) => e.key === 'Enter' && handleSet()}
        />
        <button
          onClick={handleSet}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
        >
          Access
        </button>
      </div>
    </div>
  )
}
