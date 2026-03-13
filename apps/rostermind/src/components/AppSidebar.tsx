import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

const navSections = [
  {
    label: 'AI Agents',
    links: [
      { href: '/dashboard/analyze', icon: '🧠', label: 'Ask RosterMind' },
      { href: '/dashboard/team-eval', icon: '📊', label: 'Team Analysis' },
      { href: '/dashboard/trade', icon: '💱', label: 'Trade Advice' },
      { href: '/dashboard/scout', icon: '🔍', label: 'Player Scout' },
      { href: '/dashboard/history', icon: '📋', label: 'Report History' },
    ],
  },
  {
    label: 'Account',
    links: [
      { href: '/account/sleeper', icon: '🔗', label: 'Sleeper Account' },
      { href: '/account/preferences', icon: '⚙️', label: 'Preferences' },
      { href: '/account/billing', icon: '💳', label: 'Billing' },
    ],
  },
]

export function AppSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-zinc-950 md:flex md:flex-col">
      <div className="border-b border-white/10 p-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))' }}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <circle cx="12" cy="12" r="2.5" fill="#a78bfa" />
              <circle cx="5" cy="8" r="1.5" fill="#60a5fa" />
              <circle cx="19" cy="8" r="1.5" fill="#22d3ee" />
              <circle cx="5" cy="16" r="1.5" fill="#818cf8" />
              <circle cx="19" cy="16" r="1.5" fill="#a78bfa" />
              <line x1="12" y1="12" x2="5" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="19" y2="8" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="5" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
              <line x1="12" y1="12" x2="19" y2="16" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.7" />
            </svg>
          </div>
          <div>
            <span className="text-sm font-bold text-white">RosterMind</span>
            <span className="ml-1 text-sm font-light" style={{ color: 'rgb(139,92,246)' }}>AI</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {section.label}
            </p>
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <UserButton />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-zinc-400">Account</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
