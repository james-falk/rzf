import Link from 'next/link'

const accountLinks = [
  { href: '/account/usage', label: 'Usage & Credits', icon: '⚡' },
  { href: '/account/sleeper', label: 'Sleeper Account', icon: '🔗' },
  { href: '/account/preferences', label: 'Preferences', icon: '⚙️' },
  { href: '/account/billing', label: 'Billing', icon: '💳' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      <aside className="hidden w-56 flex-shrink-0 border-r border-white/10 md:block">
        <div className="border-b border-white/10 p-5">
          <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
        <nav className="p-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Account
          </p>
          {accountLinks.map((link) => (
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
      </aside>
      <main className="flex-1 p-6 md:p-10">{children}</main>
    </div>
  )
}
