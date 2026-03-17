'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'

// ── Shield logo ───────────────────────────────────────────────────────────────

function ShieldLogo() {
  return (
    <div style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.7)) drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}>
      <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
        <path d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z" fill="url(#sg)" />
        <path d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z" fill="none" stroke="rgba(147,197,253,0.4)" strokeWidth="1" />
        <path d="M30 18h-7l-4 11h6l-3 11 11-14h-7z" fill="white" fillOpacity="0.9" />
        <defs>
          <linearGradient id="sg" x1="26" y1="2" x2="26" y2="61" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

// ── Sun / Moon toggle icons ───────────────────────────────────────────────────

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

// ── App definitions ───────────────────────────────────────────────────────────

const APPS = [
  {
    href: '/sources',
    label: 'Sources',
    description: 'Manage content ingestion, source health, analytics, and the data pipeline.',
    cta: 'Open Sources',
    light: { cta: 'text-blue-600 hover:text-blue-700', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
    dark:  { cta: 'text-blue-400 hover:text-blue-300', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-400' },
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4.03 3-9 3S3 13.66 3 12" />
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
  {
    href: '/runs',
    label: 'Agents',
    description: 'Monitor AI agent runs, configure prompts and models, and track token usage.',
    cta: 'Open Agents',
    light: { cta: 'text-indigo-600 hover:text-indigo-700', iconBg: 'bg-indigo-50', iconColor: 'text-indigo-500' },
    dark:  { cta: 'text-indigo-400 hover:text-indigo-300', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-400' },
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2.5" />
        <circle cx="5" cy="8" r="1.5" /><circle cx="19" cy="8" r="1.5" />
        <circle cx="5" cy="16" r="1.5" /><circle cx="19" cy="16" r="1.5" />
        <line x1="12" y1="12" x2="5" y2="8" /><line x1="12" y1="12" x2="19" y2="8" />
        <line x1="12" y1="12" x2="5" y2="16" /><line x1="12" y1="12" x2="19" y2="16" />
      </svg>
    ),
  },
  {
    href: '/directory/rankings',
    label: 'Directory',
    description: 'Curate ranking sites and fantasy tools shown in the RZF Directory.',
    cta: 'Open Directory',
    light: { cta: 'text-emerald-600 hover:text-emerald-700', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
    dark:  { cta: 'text-emerald-400 hover:text-emerald-300', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-400' },
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/feedback',
    label: 'Feedback',
    description: 'Review user-submitted feedback from RosterMind and the Directory.',
    cta: 'Open Feedback',
    light: { cta: 'text-amber-600 hover:text-amber-700', iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
    dark:  { cta: 'text-amber-400 hover:text-amber-300', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-400' },
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: '/x-engine',
    label: 'X Engine',
    description: 'Twitter/X automation — monitor fantasy tweets, schedule posts, and AI-powered replies.',
    cta: 'Open X Engine',
    light: { cta: 'text-sky-600 hover:text-sky-700', iconBg: 'bg-sky-50', iconColor: 'text-sky-500' },
    dark:  { cta: 'text-sky-400 hover:text-sky-300', iconBg: 'bg-sky-500/10', iconColor: 'text-sky-400' },
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommandCenterHome() {
  const [dark, setDark] = useState(false)

  // Persist preference
  useEffect(() => {
    const saved = localStorage.getItem('cc_theme')
    if (saved === 'dark') setDark(true)
  }, [])

  function toggleTheme() {
    setDark((d) => {
      localStorage.setItem('cc_theme', d ? 'light' : 'dark')
      return !d
    })
  }

  // Theme token objects
  const bg       = dark ? 'bg-zinc-950'  : 'bg-[#eef2f8]'
  const heading  = dark ? 'text-white'   : 'text-gray-900'
  const subtext  = dark ? 'text-zinc-500' : 'text-gray-500'
  const cardBg   = dark ? 'bg-zinc-900 ring-white/10' : 'bg-white ring-black/5'
  const cardText = dark ? 'text-zinc-100' : 'text-gray-900'
  const cardDesc = dark ? 'text-zinc-400' : 'text-gray-500'
  const toggleBg = dark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white text-gray-600 shadow-sm hover:bg-gray-50'

  return (
    <AuthGuard>
      <div className={`min-h-screen ${bg} flex flex-col transition-colors duration-200`}>

        {/* Top-right theme toggle */}
        <div className="flex justify-end px-6 pt-5">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${toggleBg}`}
            aria-label="Toggle theme"
          >
            {dark ? <SunIcon /> : <MoonIcon />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* Center content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div className="w-full max-w-4xl">

            {/* Logo + heading */}
            <div className="mb-12 flex flex-col items-center text-center">
              <ShieldLogo />
              <h1 className={`mt-6 text-3xl font-bold ${heading}`}>Choose Your Application</h1>
              <p className={`mt-2 text-sm ${subtext}`}>Select an application to manage.</p>
            </div>

            {/* App cards — 3-col top row, 2-col bottom row centered */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {APPS.map((app) => {
                const colors = dark ? app.dark : app.light
                return (
                  <Link
                    key={app.href}
                    href={app.href}
                    className={`group flex flex-col rounded-2xl ${cardBg} p-7 ring-1 transition hover:shadow-lg hover:-translate-y-0.5 duration-150`}
                  >
                    {/* Icon */}
                    <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${colors.iconBg} ${colors.iconColor}`}>
                      {app.icon}
                    </div>

                    {/* Text */}
                    <p className={`font-semibold ${cardText}`}>{app.label}</p>
                    <p className={`mt-2 flex-1 text-sm leading-relaxed ${cardDesc}`}>{app.description}</p>

                    {/* CTA */}
                    <div className={`mt-6 flex items-center gap-1 text-sm font-semibold transition ${colors.cta}`}>
                      {app.cta}
                      <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10M8 3l5 5-5 5" />
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>

          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
