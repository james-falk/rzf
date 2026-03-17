'use client'

import React from 'react'
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
  Coins,
  MessageSquare,
  Trophy,
  Wrench,
  Home,
  CalendarClock,
  Radio,
  MessageCircleReply,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── App section definitions ───────────────────────────────────────────────────

const SECTIONS = {
  sources: {
    title: 'Sources',
    links: [
      { href: '/sources', label: 'Overview', icon: LayoutDashboard, exact: true },
      { href: '/content', label: 'Analytics', icon: BarChart3 },
      { href: '/sources/manager', label: 'Source Manager', icon: Settings2 },
      { href: '/queue/ingestion', label: 'Ingestion Queue', icon: Layers },
      { href: '/data', label: 'Data Sources', icon: Database },
    ],
  },
  agents: {
    title: 'Agents',
    links: [
      { href: '/runs', label: 'Agent Runs', icon: Bot },
      { href: '/agents/config', label: 'Agent Config', icon: SlidersHorizontal },
      { href: '/usage', label: 'Token Usage', icon: Coins },
      { href: '/queue/agents', label: 'Agent Queue', icon: Layers },
    ],
  },
  'x-engine': {
    title: 'X Engine',
    links: [
      { href: '/x-engine', label: 'Overview', icon: Home, exact: true },
      { href: '/x-engine/scheduler', label: 'Post Scheduler', icon: CalendarClock },
      { href: '/x-engine/monitor', label: 'Tweet Monitor', icon: Radio },
      { href: '/x-engine/replies', label: 'Reply Queue', icon: MessageCircleReply },
    ],
  },
  directory: {
    title: 'Directory',
    links: [
      { href: '/directory/rankings', label: 'Ranking Sites', icon: Trophy },
      { href: '/directory/tools', label: 'Fantasy Tools', icon: Wrench },
    ],
  },
  feedback: {
    title: 'Feedback',
    links: [
      { href: '/feedback', label: 'Feedback', icon: MessageSquare },
    ],
  },
} as const

type SectionKey = keyof typeof SECTIONS

// ── Path → section detection ──────────────────────────────────────────────────

const PATH_MAP: Array<[string, SectionKey]> = [
  ['/queue/ingestion', 'sources'],
  ['/sources', 'sources'],
  ['/content', 'sources'],
  ['/data', 'sources'],
  ['/queue/agents', 'agents'],
  ['/queue', 'agents'],
  ['/runs', 'agents'],
  ['/agents', 'agents'],
  ['/usage', 'agents'],
  ['/x-engine', 'x-engine'],
  ['/directory', 'directory'],
  ['/feedback', 'feedback'],
]

function detectSection(pathname: string): SectionKey | null {
  for (const [prefix, section] of PATH_MAP) {
    if (pathname.startsWith(prefix)) return section
  }
  return null
}

// ── Shield logo ───────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <div style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.8)) drop-shadow(0 0 14px rgba(59,130,246,0.4))' }}>
      <svg width="28" height="32" viewBox="0 0 52 60" fill="none">
        <path d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z" fill="url(#ss)" />
        <path d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z" fill="none" stroke="rgba(147,197,253,0.3)" strokeWidth="1" />
        <path d="M30 18h-7l-4 11h6l-3 11 11-14h-7z" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="ss" x1="26" y1="2" x2="26" y2="61" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const sectionKey = detectSection(pathname)
  const section = sectionKey ? SECTIONS[sectionKey] : null

  function handleLogout() {
    localStorage.removeItem('rzf_admin_secret')
    router.push('/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-white/10 md:flex">
      {/* Logo header */}
      <div className="border-b border-white/10 px-4 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <ShieldIcon />
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              {section?.title ?? 'Command Center'}
            </p>
            <p className="text-[10px] text-zinc-500 leading-tight">rzf admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {/* Back to apps link */}
        <Link
          href="/"
          className="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
        >
          <ChevronLeft size={13} />
          All Applications
        </Link>

        {/* Current section's links */}
        {section && (
          <div>
            <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {(section.links as ReadonlyArray<{ href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; exact?: boolean }>).map(({ href, label, icon: Icon, exact }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition',
                    isActive(href, exact)
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
        )}
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
