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
      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        {/* Animated background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-orb absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[100px]" />
          <div className="animate-orb-reverse absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-red-800/10 blur-[100px]" />
          <div className="animate-orb absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/5 blur-[80px]" style={{ animationDelay: '4s' }} />
        </div>

        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[4rem_4rem]" />

        {/* Scan line */}
        <div className="animate-scan pointer-events-none absolute inset-x-0 h-px bg-linear-to-r from-transparent via-red-500/20 to-transparent" />

        {/* Content */}
        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            AI Fantasy Analysis — Now Live
          </div>

          <h1 className="mb-6 max-w-3xl text-5xl font-bold tracking-tight text-white md:text-6xl">
            NFL RedZone{' '}
            <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              for fantasy
            </span>
          </h1>

          <p className="mb-4 max-w-2xl text-lg text-zinc-400">
            Your AI-powered fantasy assistant. Ask it anything about your roster —
            get instant grades, waiver targets, trade advice, and weekly lineup calls.
          </p>
          <p className="mb-10 text-sm text-zinc-600">Powered by real-time NFL data from Sleeper</p>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="group relative overflow-hidden rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500">
                  <span className="relative z-10">Analyze My Team Free</span>
                  <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </SignUpButton>
              <p className="text-sm text-zinc-500">2 free analyses included • No credit card</p>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard/analyze"
                className="group relative overflow-hidden rounded-xl bg-red-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-red-900/40 transition hover:bg-red-500"
              >
                <span className="relative z-10">Open RZF Assistant</span>
                <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            What you get
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-white/20 hover:bg-white/[0.07]"
              >
                {!f.live && (
                  <span className="absolute right-3 top-3 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                    Coming soon
                  </span>
                )}
                <div className="mb-3 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
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
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Just ask. Tell RZF what you need and it routes to the right analysis automatically.',
    live: true,
  },
  {
    icon: '📊',
    title: 'Team Evaluation',
    description: 'Full roster grade with position scores, strengths, weaknesses, and key insights.',
    live: true,
  },
  {
    icon: '🔄',
    title: 'Waiver Wire',
    description: 'Best available adds and drops tailored to your exact roster gaps — every week.',
    live: false,
  },
  {
    icon: '💱',
    title: 'Trade Advice',
    description: 'Accept or reject trade offers with detailed reasoning and counter-suggestions.',
    live: false,
  },
  {
    icon: '📋',
    title: 'Start / Sit',
    description: 'Confident weekly lineup decisions for every borderline call.',
    live: false,
  },
  {
    icon: '⚡',
    title: 'Real-Time Data',
    description: 'Injury reports, depth charts, and consensus rankings updated throughout the week.',
    live: true,
  },
]
