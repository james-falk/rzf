'use client'

import Link from 'next/link'

const APPS = [
  {
    href: '/sources',
    label: 'Sources',
    description: 'Manage content ingestion, source health, analytics, and the data pipeline.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    color: 'blue',
    cta: 'Open Sources',
  },
  {
    href: '/runs',
    label: 'Agents',
    description: 'Monitor AI agent runs, configure prompts and models, and track token usage.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="8" r="1.5" />
        <circle cx="19" cy="8" r="1.5" />
        <circle cx="5" cy="16" r="1.5" />
        <circle cx="19" cy="16" r="1.5" />
        <line x1="12" y1="12" x2="5" y2="8" />
        <line x1="12" y1="12" x2="19" y2="8" />
        <line x1="12" y1="12" x2="5" y2="16" />
        <line x1="12" y1="12" x2="19" y2="16" />
      </svg>
    ),
    color: 'indigo',
    cta: 'Open Agents',
  },
  {
    href: '/directory/rankings',
    label: 'Directory',
    description: 'Curate ranking sites and fantasy tools shown in the RZF Directory.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    color: 'emerald',
    cta: 'Open Directory',
  },
  {
    href: '/feedback',
    label: 'Feedback',
    description: 'Review user-submitted feedback from RosterMind and the Directory.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
    color: 'amber',
    cta: 'Open Feedback',
  },
  {
    href: '/x-engine',
    label: 'X Engine',
    description: 'Twitter/X automation — monitor fantasy tweets, schedule posts, and AI-power replies.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'zinc',
    cta: 'Open X Engine',
  },
]

const COLOR_MAP: Record<string, { bg: string; icon: string; border: string; cta: string }> = {
  blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-400',    border: 'border-blue-500/20',    cta: 'text-blue-400 hover:text-blue-300' },
  indigo:  { bg: 'bg-indigo-500/10',  icon: 'text-indigo-400',  border: 'border-indigo-500/20',  cta: 'text-indigo-400 hover:text-indigo-300' },
  emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20', cta: 'text-emerald-400 hover:text-emerald-300' },
  amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-400',   border: 'border-amber-500/20',   cta: 'text-amber-400 hover:text-amber-300' },
  zinc:    { bg: 'bg-zinc-500/10',    icon: 'text-zinc-300',    border: 'border-zinc-500/20',    cta: 'text-zinc-300 hover:text-white' },
}

export default function CommandCenterHome() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-red-500">Red Zone Fantasy</p>
          <h1 className="text-3xl font-bold text-white">Command Center</h1>
          <p className="mt-2 text-sm text-zinc-500">Choose an application to manage.</p>
        </div>

        {/* App cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app) => {
            const colors = COLOR_MAP[app.color]!
            return (
              <Link
                key={app.href}
                href={app.href}
                className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-900 p-6 transition hover:border-white/20 hover:bg-zinc-800/60"
              >
                {/* Icon */}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${colors.border} ${colors.bg} ${colors.icon}`}>
                  {app.icon}
                </div>

                {/* Label + description */}
                <p className="font-semibold text-white">{app.label}</p>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-zinc-400">{app.description}</p>

                {/* CTA */}
                <div className={`mt-5 flex items-center gap-1.5 text-sm font-medium transition ${colors.cta}`}>
                  {app.cta}
                  <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer hint */}
        <p className="mt-10 text-center text-xs text-zinc-600">
          Use the sidebar to navigate within each application.
        </p>
      </div>
    </div>
  )
}
