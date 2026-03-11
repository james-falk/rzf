import Link from 'next/link'
import { Show, SignInButton, SignUpButton } from '@clerk/nextjs'
import { NeuralNetwork } from '@/components/neural/NeuralNetwork'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ background: 'rgb(6 8 15)' }}>

      {/* ── Nav ─────────────────────────────────────────────────── */}
      <nav className="relative z-20 border-b px-6 py-4" style={{ borderColor: 'rgb(30 36 64)', background: 'rgba(6,8,15,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark — brain/neural orb */}
            <div className="relative flex h-9 w-9 items-center justify-center">
              <div className="absolute inset-0 rounded-full opacity-70" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.6) 0%, rgba(139,92,246,0.3) 60%, transparent 100%)' }} />
              <svg viewBox="0 0 24 24" className="relative h-5 w-5" fill="none">
                <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
                <circle cx="5" cy="8" r="1.5" fill="#60a5fa" />
                <circle cx="19" cy="8" r="1.5" fill="#22d3ee" />
                <circle cx="5" cy="16" r="1.5" fill="#818cf8" />
                <circle cx="19" cy="16" r="1.5" fill="#a78bfa" />
                <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
                <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
                <line x1="12" y1="12" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
                <line x1="12" y1="12" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
                <line x1="5" y1="8" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.4" />
                <line x1="19" y1="8" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.5" strokeOpacity="0.4" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white">RosterMind</span>
              <span className="ml-1 text-base font-light" style={{ color: 'rgb(139,92,246)' }}>AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="rounded-lg border px-4 py-2 text-sm text-white/80 transition hover:text-white hover:border-white/30" style={{ borderColor: 'rgb(30 36 64)', background: 'transparent' }}>
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-white transition" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                  Get Started Free
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}
              >
                Open Dashboard
              </Link>
            </Show>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[92vh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">

        {/* Neural network canvas — full hero background */}
        <NeuralNetwork className="opacity-60" nodeCount={32} />

        {/* Deep background orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-orb absolute -right-64 -top-64 h-[700px] w-[700px] rounded-full blur-[120px]" style={{ background: 'rgba(99,102,241,0.08)' }} />
          <div className="animate-orb-reverse absolute -bottom-64 -left-64 h-[700px] w-[700px] rounded-full blur-[120px]" style={{ background: 'rgba(139,92,246,0.08)' }} />
          <div className="animate-orb absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full blur-[80px]" style={{ background: 'rgba(34,211,238,0.05)', animationDelay: '5s' }} />
        </div>

        {/* Subtle grid overlay */}
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Scan line */}
        <div className="animate-scan pointer-events-none absolute inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(99,102,241,0.3), transparent)' }} />

        {/* Hero content */}
        <div className="relative z-10">
          {/* Status badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm" style={{ borderColor: 'rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.08)', color: 'rgb(165,180,252)' }}>
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: 'rgb(139,92,246)' }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'rgb(139,92,246)' }} />
            </span>
            Neural Analysis Engine — Live
          </div>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
            Your Fantasy Team&apos;s{' '}
            <span className="gradient-neural text-glow-blue">
              Neural Core
            </span>
          </h1>

          <p className="mb-4 max-w-2xl text-lg" style={{ color: 'rgb(148,163,210)' }}>
            RosterMind AI connects your roster to a living network of NFL intelligence —
            player data, rankings, injury reports, and trends — processed in real time.
          </p>
          <p className="mb-10 text-sm" style={{ color: 'rgb(71,85,125)' }}>
            Powered by Sleeper · gpt-4o-mini · Real-time data
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Show when="signed-out">
              <SignUpButton mode="modal">
                <button
                  className="group relative overflow-hidden rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)' }}
                >
                  <span className="relative z-10">Analyze My Roster Free</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </SignUpButton>
              <p className="text-sm" style={{ color: 'rgb(71,85,125)' }}>2 free analyses · No credit card</p>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard/analyze"
                className="group relative overflow-hidden rounded-xl px-8 py-4 text-base font-semibold text-white transition hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.15)' }}
              >
                <span className="relative z-10">Open RosterMind AI</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
            </Show>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float" style={{ color: 'rgb(71,85,125)' }}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="border-t px-6 py-20" style={{ borderColor: 'rgb(30 36 64)' }}>
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest" style={{ color: 'rgb(99,102,241)' }}>Capabilities</p>
          <h2 className="mb-12 text-center text-3xl font-bold text-white">
            What RosterMind knows
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative rounded-xl border p-6 transition"
                style={{
                  borderColor: f.live ? 'rgba(99,102,241,0.2)' : 'rgb(30 36 64)',
                  background: f.live ? 'rgba(99,102,241,0.04)' : 'rgb(10 13 24)',
                }}
              >
                {!f.live && (
                  <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ background: 'rgb(14 18 32)', color: 'rgb(71,85,125)' }}>
                    Coming soon
                  </span>
                )}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: f.live ? 'rgba(99,102,241,0.12)' : 'rgba(30,36,64,0.5)' }}>
                  <span className="text-xl">{f.icon}</span>
                </div>
                <h3 className="mb-2 text-base font-semibold text-white">{f.title}</h3>
                <p className="text-sm" style={{ color: 'rgb(100,116,160)' }}>{f.description}</p>
                {f.live && (
                  <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'rgb(99,102,241)' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'rgb(99,102,241)' }} />
                    Live
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────── */}
      <section className="border-t px-6 py-20" style={{ borderColor: 'rgb(30 36 64)' }}>
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-center text-sm font-medium uppercase tracking-widest" style={{ color: 'rgb(99,102,241)' }}>Pricing</p>
          <h2 className="mb-12 text-center text-3xl font-bold text-white">Simple. Transparent.</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-8" style={{ borderColor: 'rgb(30 36 64)', background: 'rgb(10 13 24)' }}>
              <h3 className="mb-1 text-xl font-bold text-white">Free</h3>
              <p className="mb-6 text-3xl font-bold text-white">
                $0<span className="text-base font-normal" style={{ color: 'rgb(100,116,160)' }}> forever</span>
              </p>
              <ul className="space-y-2 text-sm" style={{ color: 'rgb(100,116,160)' }}>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(99,102,241)' }}>✓</span> 2 team evaluations</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(99,102,241)' }}>✓</span> Full AI analysis</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(99,102,241)' }}>✓</span> Player injury status</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(99,102,241)' }}>✓</span> Depth chart data</li>
              </ul>
            </div>
            <div className="rounded-xl border p-8" style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.06)', boxShadow: '0 0 40px rgba(99,102,241,0.1)' }}>
              <div className="mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: 'rgba(99,102,241,0.15)', color: 'rgb(165,180,252)' }}>Most Popular</div>
              <h3 className="mb-1 text-xl font-bold text-white">Pro</h3>
              <p className="mb-6 text-3xl font-bold text-white">
                $20<span className="text-base font-normal" style={{ color: 'rgb(100,116,160)' }}>/month</span>
              </p>
              <ul className="space-y-2 text-sm text-white/80">
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(139,92,246)' }}>✓</span> 50 agent runs/month</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(139,92,246)' }}>✓</span> All current agents</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(139,92,246)' }}>✓</span> Personalized reports</li>
                <li className="flex items-center gap-2"><span style={{ color: 'rgb(139,92,246)' }}>✓</span> Priority support</li>
                <li className="flex items-center gap-2 opacity-50"><span>+</span> Waiver, Lineup agents (soon)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-8 text-center text-sm" style={{ borderColor: 'rgb(30 36 64)', color: 'rgb(71,85,125)' }}>
        <div className="flex items-center justify-center gap-2">
          <span>RosterMind AI</span>
          <span>·</span>
          <span>Built for serious fantasy managers</span>
        </div>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: '🧠',
    title: 'AI Assistant',
    description: 'Tell RosterMind what you need — it routes your question to the right analysis automatically.',
    live: true,
  },
  {
    icon: '📊',
    title: 'Team Evaluation',
    description: 'Full roster grade with position scores, strengths, weaknesses, and prioritized action items.',
    live: true,
  },
  {
    icon: '⚡',
    title: 'Real-Time Data',
    description: 'Injury reports, depth charts, and consensus rankings updated continuously through the week.',
    live: true,
  },
  {
    icon: '🔄',
    title: 'Waiver Wire',
    description: 'Ranked pickup targets tailored to your exact roster gaps — every week.',
    live: false,
  },
  {
    icon: '💱',
    title: 'Trade Analysis',
    description: 'Accept or reject trades with detailed reasoning and counter-suggestions.',
    live: false,
  },
  {
    icon: '📋',
    title: 'Start / Sit',
    description: 'Weekly lineup decisions for every borderline call, with confidence scores.',
    live: false,
  },
]
