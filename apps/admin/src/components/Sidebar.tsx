'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Bot, Database, FileText, Layers, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/runs', label: 'Agent Runs', icon: Bot },
  { href: '/sources', label: 'Content Sources', icon: Database },
  { href: '/content', label: 'Content Analytics', icon: FileText },
  { href: '/queue', label: 'Queue', icon: Layers },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('rzf_admin_secret')
    router.push('/login')
  }

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-white/10 md:flex">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Red Zone Fantasy</p>
        <p className="mt-0.5 text-xs text-zinc-400">Admin Dashboard</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
              )}
            >
              <Icon size={15} className="shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </aside>
  )
}
