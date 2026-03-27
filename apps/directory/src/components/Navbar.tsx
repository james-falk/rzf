'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth, SignInButton, UserButton } from '@clerk/nextjs'

const NAV_LINKS = [
  { href: '/', label: 'Feed' },
  { href: '/search', label: 'Players' },
  { href: '/sources', label: 'Sources' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/tools', label: 'Tools' },
]

export default function Navbar() {
  const { isSignedIn } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-50 border-b bg-[rgb(10,10,10)]/80 backdrop-blur-md" style={{ borderColor: 'rgb(38,38,38)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded" style={{ background: 'rgb(220,38,38)' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 3h12M2 8h8M2 13h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="13" cy="8" r="2" fill="white"/>
            </svg>
          </div>
          <div className="leading-none">
            <span className="block text-sm font-bold tracking-tight text-white">Red Zone</span>
            <span className="block text-[10px] font-medium tracking-widest uppercase" style={{ color: 'rgb(220,38,38)' }}>Fantasy</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex" style={{ color: 'rgb(163,163,163)' }}>
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={process.env.NEXT_PUBLIC_ROSTERMIND_URL ?? 'https://rostermind.vercel.app'}
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10 md:block"
            style={{ color: 'rgb(163,163,163)' }}
          >
            RosterMind AI →
          </a>

          {mounted && isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-white/10"
                style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(115,115,115)' }}
                title="Account settings"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: 'h-9 w-9' } }} />
            </div>
          ) : (
            <SignInButton mode="modal">
              <button
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: 'rgb(220,38,38)' }}
              >
                Sign In
              </button>
            </SignInButton>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border transition-colors hover:bg-white/10 md:hidden"
            style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M3 6h18M3 12h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t md:hidden" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(10,10,10)' }}>
          <nav className="flex flex-col px-4 py-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="py-4 text-base font-medium transition-colors hover:text-white border-b"
                style={{ color: 'rgb(163,163,163)', borderColor: 'rgb(28,28,28)' }}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={process.env.NEXT_PUBLIC_ROSTERMIND_URL ?? 'https://rostermind.vercel.app'}
              className="py-4 text-base font-medium transition-colors hover:text-white"
              style={{ color: 'rgb(220,38,38)' }}
            >
              RosterMind AI →
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
