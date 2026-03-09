import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-shrink-0 border-r border-white/10 bg-zinc-950 md:flex md:flex-col">
        <div className="border-b border-white/10 p-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-red-500">RZF</span>
            <span className="text-sm font-medium text-zinc-300">Red Zone Fantasy</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-zinc-400">Account</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

const navLinks = [
  { href: '/dashboard', icon: '🏈', label: 'Dashboard' },
  { href: '/dashboard/analyze', icon: '🤖', label: 'Ask RZF' },
  { href: '/dashboard/team-eval', icon: '📊', label: 'Team Evaluation' },
  { href: '/dashboard/history', icon: '📋', label: 'Report History' },
  { href: '/account/usage', icon: '⚡', label: 'Usage' },
  { href: '/account/sleeper', icon: '🔗', label: 'Sleeper Account' },
  { href: '/account/preferences', icon: '⚙️', label: 'Preferences' },
  { href: '/account/billing', icon: '💳', label: 'Billing' },
]
