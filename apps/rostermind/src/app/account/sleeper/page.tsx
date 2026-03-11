'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'

interface League {
  league_id: string
  name: string
  season: string
  total_rosters: number
}

export default function SleeperAccountPage() {
  const { getToken } = useAuth()
  const [leagues, setLeagues] = useState<League[]>([])
  const [hasAccount, setHasAccount] = useState(false)
  const [loading, setLoading] = useState(true)

  const [username, setUsername] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState('')
  const [connectSuccess, setConnectSuccess] = useState(false)

  useEffect(() => {
    async function loadLeagues() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.getLeagues(token)
        setLeagues(data.leagues as League[])
        setHasAccount(true)
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          setHasAccount(false)
        }
      } finally {
        setLoading(false)
      }
    }
    loadLeagues()
  }, [getToken])

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setConnecting(true)
    setConnectError('')
    setConnectSuccess(false)

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      await api.connectSleeper(token, username.trim())

      // Reload leagues
      const data = await api.getLeagues(token)
      setLeagues(data.leagues as League[])
      setHasAccount(true)
      setConnectSuccess(true)
      setUsername('')
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Sleeper Account</h1>
      <p className="mb-8 text-zinc-400">Connect your Sleeper account to run analyses</p>

      {/* Connect form */}
      <div className="mb-8 rounded-xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="mb-4 text-base font-semibold text-white">
          {hasAccount ? 'Update Sleeper Username' : 'Connect Sleeper Account'}
        </h2>
        <form onSubmit={handleConnect} className="flex gap-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Sleeper username"
            className="flex-1 rounded-lg border border-white/10 bg-zinc-800 px-4 py-2.5 text-white placeholder-zinc-500 outline-none focus:border-red-500"
            disabled={connecting}
          />
          <button
            type="submit"
            disabled={connecting || !username.trim()}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : hasAccount ? 'Update' : 'Connect'}
          </button>
        </form>
        {connectError && (
          <p className="mt-3 text-sm text-red-400">{connectError}</p>
        )}
        {connectSuccess && (
          <p className="mt-3 text-sm text-emerald-400">Account connected successfully!</p>
        )}
      </div>

      {/* Leagues */}
      {loading ? (
        <div className="text-sm text-zinc-400">Loading...</div>
      ) : hasAccount && leagues.length > 0 ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-semibold text-white">Your Leagues ({leagues.length})</h2>
          </div>
          <div className="divide-y divide-white/5">
            {leagues.map((l) => (
              <div key={l.league_id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{l.name}</p>
                  <p className="text-xs text-zinc-500">{l.total_rosters} teams • {l.season}</p>
                </div>
                <a
                  href="/dashboard/team-eval"
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Analyze →
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : !hasAccount ? (
        <div className="text-sm text-zinc-400">Connect your account above to see your leagues.</div>
      ) : null}
    </div>
  )
}
