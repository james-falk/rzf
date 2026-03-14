'use client'

import { useState } from 'react'

interface SleeperProfile {
  sleeperId: string
  username: string
  avatarUrl: string | null
}

export function SleeperConnect({ initial }: { initial: SleeperProfile | null }) {
  const [profile, setProfile] = useState<SleeperProfile | null>(initial)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConnect = async () => {
    if (!username.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sleeper-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })
      const data = await res.json() as { sleeperId?: string; username?: string; avatarUrl?: string; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to connect Sleeper account.')
        return
      }
      setProfile({ sleeperId: data.sleeperId!, username: data.username!, avatarUrl: data.avatarUrl ?? null })
      setUsername('')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    setLoading(true)
    try {
      await fetch('/api/sleeper-profile', { method: 'DELETE' })
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  if (profile) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.username} className="h-10 w-10 rounded-full" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ background: 'rgba(94,234,212,0.15)', color: 'rgb(94,234,212)' }}
            >
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-white">{profile.username}</p>
            <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>Sleeper ID: {profile.sleeperId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'rgb(134,239,172)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Connected
          </span>
          <button
            onClick={handleDisconnect}
            disabled={loading}
            className="rounded-lg border px-3 py-1.5 text-xs text-red-400 transition-colors hover:border-red-800/50 hover:bg-red-900/20 disabled:opacity-50"
            style={{ borderColor: 'rgb(38,38,38)' }}
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          placeholder="Your Sleeper username"
          className="flex-1 rounded-lg border px-3 py-2 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-teal-500"
          style={{ background: 'rgb(26,26,26)', borderColor: 'rgb(38,38,38)' }}
        />
        <button
          onClick={handleConnect}
          disabled={loading || !username.trim()}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: 'rgb(20,184,166)' }}
        >
          {loading ? 'Connecting…' : 'Connect'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
      <p className="mt-2 text-xs" style={{ color: 'rgb(115,115,115)' }}>
        Enter your Sleeper username exactly as it appears in the app.
      </p>
    </div>
  )
}
