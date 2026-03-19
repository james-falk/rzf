import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const CAPABILITIES = [
  { label: 'Trade Analysis', icon: '⚖️' },
  { label: 'Lineup Help', icon: '📋' },
  { label: 'Player Scout', icon: '🔍' },
  { label: 'Waiver Wire', icon: '📡' },
  { label: 'Injury Watch', icon: '🩺' },
  { label: 'Player Compare', icon: '⚡' },
]

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      {/* Logo mark */}
      <div
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ring-1 ring-indigo-500/40"
        style={{ background: 'rgba(99,102,241,0.12)' }}
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none">
          <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
          <circle cx="5" cy="8" r="1.5" fill="#60a5fa" />
          <circle cx="19" cy="8" r="1.5" fill="#22d3ee" />
          <circle cx="5" cy="16" r="1.5" fill="#818cf8" />
          <circle cx="19" cy="16" r="1.5" fill="#a78bfa" />
          <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="12" y1="12" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.8" />
          <line x1="12" y1="12" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.8" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-white">Welcome to RosterMind</h1>
      <p className="mt-2 text-base text-zinc-400">Your AI fantasy football manager.</p>
      <p className="mt-1 text-sm text-zinc-500">
        Ask anything about trades, lineup decisions, waiver pickups, and more.
      </p>

      <Link
        href="/dashboard/analyze"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 active:scale-[0.98]"
      >
        Open Chat
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8h12M8 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>

      <div className="mt-10 grid grid-cols-3 gap-3 max-w-xs">
        {CAPABILITIES.map(({ label, icon }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-xl border border-white/5 bg-zinc-900/50 px-2 py-3"
          >
            <span className="mb-1 text-xl">{icon}</span>
            <p className="text-[11px] leading-tight text-zinc-500">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
