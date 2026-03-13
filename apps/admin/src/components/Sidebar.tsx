'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Database,
  Settings2,
  Layers,
  LogOut,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  {
    label: 'Sources',
    links: [
      { href: '/sources', label: 'Overview', icon: LayoutDashboard },
      { href: '/content', label: 'Analytics', icon: BarChart3 },
      { href: '/sources/manager', label: 'Source Manager', icon: Settings2 },
    ],
  },
  {
    label: 'Agents',
    links: [
      { href: '/runs', label: 'Agent Runs', icon: Bot },
      { href: '/agents/config', label: 'Agent Config', icon: SlidersHorizontal },
      { href: '/queue', label: 'Queue', icon: Layers },
    ],
  },
  {
    label: 'System',
    links: [
      { href: '/data', label: 'Data Sources', icon: Database },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('rzf_admin_secret')
    router.push('/login')
  }

  function isActive(href: string) {
    if (href === '/sources') return pathname === '/sources'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-white/10 md:flex">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Red Zone Fantasy</p>
        <p className="mt-0.5 text-xs text-zinc-400">Admin Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {sections.map((section) => (
          <div key={section.label} className="mb-4">
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.links.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    isActive(href)
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200',
                  )}
                >
                  <Icon size={15} className="shrink-0" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
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
