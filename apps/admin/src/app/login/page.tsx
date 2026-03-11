'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [secret, setSecret] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!secret.trim()) return
    setLoading(true)
    setError('')

    try {
      const apiBase = (process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:3001').replace(/\/$/, '')
      const res = await fetch(`${apiBase}/internal/overview`, {
        headers: { 'x-admin-secret': secret.trim() },
      })
      if (!res.ok) {
        setError('Invalid admin secret.')
        setLoading(false)
        return
      }
      localStorage.setItem('rzf_admin_secret', secret.trim())
      router.push('/')
    } catch {
      setError('Could not reach API.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-red-500">Red Zone Fantasy</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Admin Access</h1>
          <p className="mt-1 text-sm text-zinc-400">Enter your admin secret to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            autoFocus
            className="w-full rounded-lg border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full rounded-lg bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  )
}
