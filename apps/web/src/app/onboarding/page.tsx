'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'

export default function OnboardingPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    setError('')

    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')

      await api.connectSleeper(token, username.trim())
      router.push('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to connect Sleeper account. Check your username and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold text-red-500">RZF</span>
          <p className="mt-2 text-zinc-400">Connect your Sleeper account to get started</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
          <h1 className="mb-2 text-2xl font-bold text-white">Connect Sleeper</h1>
          <p className="mb-6 text-sm text-zinc-400">
            Enter your Sleeper username. We use the public API — no password needed.
          </p>

          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Sleeper Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. fantasy_legend99"
                className="w-full rounded-lg border border-white/10 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500"
                disabled={loading}
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Connect Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-500">
            Don&apos;t have a Sleeper account?{' '}
            <a
              href="https://sleeper.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300"
            >
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
