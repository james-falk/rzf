import Link from 'next/link'

const internalLinks = [
  { href: '/internal', label: 'Overview', icon: '📊' },
  { href: '/internal/users', label: 'Users', icon: '👥' },
  { href: '/internal/runs', label: 'Agent Runs', icon: '🤖' },
  { href: '/internal/events', label: 'Events', icon: '📋' },
  { href: '/internal/queue', label: 'Queue', icon: '⚙️' },
]

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="hidden w-52 flex-shrink-0 border-r border-white/10 md:flex md:flex-col">
        <div className="border-b border-white/10 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-red-400">
            Internal Admin
          </p>
        </div>
        <nav className="flex-1 p-3">
          {internalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Back to App
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-8">{children}</main>
    </div>
  )
}
