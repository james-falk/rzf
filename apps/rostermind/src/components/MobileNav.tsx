'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    exact: true,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
        <path d="M9 22V12h6v10" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
      </svg>
    ),
  },
  {
    href: '/dashboard/analyze',
    label: 'Analyze',
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
        <circle cx="12" cy="12" r="2.5" fill={active ? '#a78bfa' : '#52525b'} />
        <circle cx="5" cy="8" r="1.5" fill={active ? '#818cf8' : '#3f3f46'} />
        <circle cx="19" cy="8" r="1.5" fill={active ? '#818cf8' : '#3f3f46'} />
        <circle cx="5" cy="16" r="1.5" fill={active ? '#818cf8' : '#3f3f46'} />
        <circle cx="19" cy="16" r="1.5" fill={active ? '#818cf8' : '#3f3f46'} />
        <line x1="12" y1="12" x2="5" y2="8" stroke={active ? '#6366f1' : '#3f3f46'} strokeWidth="1" strokeOpacity="0.8" />
        <line x1="12" y1="12" x2="19" y2="8" stroke={active ? '#6366f1' : '#3f3f46'} strokeWidth="1" strokeOpacity="0.8" />
        <line x1="12" y1="12" x2="5" y2="16" stroke={active ? '#6366f1' : '#3f3f46'} strokeWidth="1" strokeOpacity="0.8" />
        <line x1="12" y1="12" x2="19" y2="16" stroke={active ? '#6366f1' : '#3f3f46'} strokeWidth="1" strokeOpacity="0.8" />
      </svg>
    ),
  },
  {
    href: '/dashboard/history',
    label: 'History',
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
        <path d="M12 7v5l3 3" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
      </svg>
    ),
  },
  {
    href: '/account/sleeper',
    label: 'Sleeper',
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
      </svg>
    ),
  },
  {
    href: '/account/billing',
    label: 'Billing',
    exact: false,
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
        <line x1="1" y1="10" x2="23" y2="10" style={{ stroke: active ? '#818cf8' : '#52525b' }} />
      </svg>
    ),
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-zinc-950 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch">
        {TABS.map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2 min-h-[56px]"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-medium"
                style={{ color: active ? '#818cf8' : '#52525b' }}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
