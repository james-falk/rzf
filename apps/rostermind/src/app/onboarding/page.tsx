'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { api, ApiError } from '@/lib/api'

type Step = 'welcome' | 'sleeper'

const platforms = [
  {
    id: 'sleeper',
    name: 'Sleeper',
    description: 'Connect via your public username — no password needed.',
    available: true,
    logo: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z" />
      </svg>
    ),
  },
  {
    id: 'espn',
    name: 'ESPN Fantasy',
    description: 'ESPN league sync — coming soon.',
    available: false,
    logo: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M3 5h18v2H3V5zm0 6h18v2H3v-2zm0 6h18v2H3v-2z" />
      </svg>
    ),
  },
  {
    id: 'yahoo',
    name: 'Yahoo Fantasy',
    description: 'Yahoo league sync — coming soon.',
    available: false,
    logo: (
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6H9v-2h2V7h2v2h2v2h-2v6z" />
      </svg>
    ),
  },
]

export default function OnboardingPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
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
        setError('Failed to connect. Check your username and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (step === 'sleeper') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="text-3xl font-bold" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RosterMind AI</span>
            <p className="mt-2 text-zinc-400">Connect your Sleeper account</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900 p-8">
            <button
              onClick={() => { setStep('welcome'); setError('') }}
              className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-4xl font-bold" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>RosterMind AI</span>
          <h1 className="mt-4 text-2xl font-bold text-white">Welcome to RosterMind AI</h1>
          <p className="mt-2 text-zinc-400">
            Connect a fantasy platform to unlock AI-powered analysis for your leagues.
          </p>
        </div>

        {/* Platform cards */}
        <div className="space-y-3">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={[
                'flex items-center gap-4 rounded-xl border p-5 transition',
                platform.available
                  ? 'cursor-pointer border-white/10 bg-zinc-900 hover:border-red-500/50 hover:bg-red-500/5'
                  : 'cursor-not-allowed border-white/5 bg-zinc-900/50 opacity-50',
              ].join(' ')}
              onClick={() => platform.available && setStep('sleeper')}
              role={platform.available ? 'button' : undefined}
              tabIndex={platform.available ? 0 : undefined}
              onKeyDown={(e) => {
                if (platform.available && (e.key === 'Enter' || e.key === ' ')) setStep('sleeper')
              }}
            >
              <div className={platform.available ? 'text-red-400' : 'text-zinc-600'}>
                {platform.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{platform.name}</span>
                  {!platform.available && (
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-zinc-400">{platform.description}</p>
              </div>
              {platform.available && (
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-zinc-500 stroke-2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Skip */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            Skip for now — I&apos;ll connect later
          </button>
        </div>
      </div>
    </div>
  )
}
