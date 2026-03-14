'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { SignInButton, UserButton } from '@clerk/nextjs'

export default function Navbar() {
  const { isSignedIn } = useAuth()

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
          <Link href="/search" className="transition-colors hover:text-white">Players</Link>
          <Link href="/sources" className="transition-colors hover:text-white">Sources</Link>
          <Link href="/rankings" className="transition-colors hover:text-white">Rankings</Link>
          <Link href="/search?tab=news" className="transition-colors hover:text-white">News</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={process.env.NEXT_PUBLIC_ROSTERMIND_URL ?? 'https://rostermind.vercel.app'}
            className="hidden rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-white/10 md:block"
            style={{ color: 'rgb(163,163,163)' }}
          >
            RosterMind AI →
          </a>

          {isSignedIn ? (
            <UserButton
              appearance={{
                elements: { avatarBox: 'h-8 w-8' },
              }}
            />
          ) : (
            <SignInButton mode="modal">
              <button
                className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: 'rgb(220,38,38)' }}
              >
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
