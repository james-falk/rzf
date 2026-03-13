import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-zinc-400">Welcome to RosterMind AI</p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/team-eval"
          className="group rounded-xl border border-white/10 bg-zinc-900 p-6 transition hover:border-indigo-500/50 hover:bg-indigo-500/5"
        >
          <div className="mb-4 text-4xl">📊</div>
          <h2 className="mb-1 text-lg font-semibold text-white">Team Evaluation</h2>
          <p className="text-sm text-zinc-400">
            Get an AI-powered grade and analysis of your roster
          </p>
          <div className="mt-4 text-sm font-medium text-indigo-400 group-hover:text-indigo-300">
            Run analysis →
          </div>
        </Link>

        <Link
          href="/account/sleeper"
          className="group rounded-xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20"
        >
          <div className="mb-4 text-4xl">🔗</div>
          <h2 className="mb-1 text-lg font-semibold text-white">Sleeper Account</h2>
          <p className="text-sm text-zinc-400">
            Connect or update your Sleeper username and leagues
          </p>
          <div className="mt-4 text-sm font-medium text-zinc-400 group-hover:text-white">
            Manage →
          </div>
        </Link>

        <Link
          href="/account/preferences"
          className="group rounded-xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20"
        >
          <div className="mb-4 text-4xl">⚙️</div>
          <h2 className="mb-1 text-lg font-semibold text-white">Preferences</h2>
          <p className="text-sm text-zinc-400">
            Customize how your reports are generated
          </p>
          <div className="mt-4 text-sm font-medium text-zinc-400 group-hover:text-white">
            Customize →
          </div>
        </Link>
      </div>
    </div>
  )
}
