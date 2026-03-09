import Link from 'next/link'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-500">RZF</span>
            <span className="text-xl font-semibold text-white">Red Zone Fantasy</span>
          </div>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white transition hover:border-white/40 hover:bg-white/5">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500">
                  Get Started Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          AI Fantasy Analysis — Now Live
        </div>

        <h1 className="mb-6 max-w-3xl text-5xl font-bold tracking-tight text-white md:text-6xl">
          NFL RedZone{' '}
          <span className="text-red-500">for fantasy</span>
        </h1>

        <p className="mb-10 max-w-2xl text-lg text-zinc-400">
          Get instant AI analysis of your fantasy roster. Find your strengths, weaknesses, and
          actionable moves — powered by real-time NFL data.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500">
                Analyze My Team Free
              </button>
            </SignUpButton>
            <p className="text-sm text-zinc-500">2 free analyses included • No credit card</p>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-red-500"
            >
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            What you get
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-400">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Simple pricing</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-8">
              <h3 className="mb-1 text-xl font-bold text-white">Free</h3>
              <p className="mb-6 text-3xl font-bold text-white">
                $0<span className="text-base font-normal text-zinc-400"> forever</span>
              </p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>✓ 2 team evaluations</li>
                <li>✓ Full AI analysis</li>
                <li>✓ Player injury status</li>
                <li>✓ Depth chart data</li>
              </ul>
            </div>
            <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-8">
              <h3 className="mb-1 text-xl font-bold text-white">Pro</h3>
              <p className="mb-6 text-3xl font-bold text-white">
                $20<span className="text-base font-normal text-zinc-400">/month</span>
              </p>
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>✓ 50 agent runs/month</li>
                <li>✓ All current agents</li>
                <li>✓ Personalized reports</li>
                <li>✓ Priority support</li>
                <li className="text-zinc-500">+ Waiver, Lineup agents (coming soon)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

const features = [
  {
    icon: '🏈',
    title: 'Team Evaluation',
    description:
      'Get an A-F grade for every position on your roster with specific insights and actionable recommendations.',
  },
  {
    icon: '⚡',
    title: 'Real-Time Data',
    description:
      'Powered by live injury reports, depth charts, and consensus rankings updated throughout the week.',
  },
  {
    icon: '🎯',
    title: 'Personalized',
    description:
      'Set your league format, scoring type, and play style. Every report is tailored to how you play.',
  },
]
