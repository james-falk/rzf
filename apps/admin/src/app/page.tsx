'use client'

import Link from 'next/link'
import { AuthGuard } from '@/components/AuthGuard'

function ShieldLogo() {
  return (
    <div style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.7)) drop-shadow(0 0 40px rgba(59,130,246,0.35))' }}>
      <svg width="52" height="60" viewBox="0 0 52 60" fill="none">
        <path
          d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z"
          fill="url(#sg)"
        />
        <path
          d="M26 2L4 11v16c0 14.4 9.4 27.9 22 31.9C38.6 54.9 48 41.4 48 27V11L26 2z"
          fill="none"
          stroke="rgba(147,197,253,0.4)"
          strokeWidth="1"
        />
        {/* Inner emblem — simple bolt/star */}
        <path
          d="M30 18h-7l-4 11h6l-3 11 11-14h-7z"
          fill="white"
          fillOpacity="0.9"
        />
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

const APPS = [
  {
    href: '/sources',
    label: 'Sources',
    description: 'Manage content ingestion, source health, analytics, and the data pipeline.',
    cta: 'Open Sources',
    ctaColor: 'text-blue-600 hover:text-blue-700',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
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
    ctaColor: 'text-indigo-600 hover:text-indigo-700',
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-500',
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
    href: '/x-engine',
    label: 'X Engine',
    description: 'Twitter/X automation — monitor fantasy tweets, schedule posts, and AI-powered replies.',
    cta: 'Open X Engine',
    ctaColor: 'text-sky-600 hover:text-sky-700',
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-500',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

export default function CommandCenterHome() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#eef2f8] flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-3xl">

          {/* Logo + heading */}
          <div className="mb-12 flex flex-col items-center text-center">
            <ShieldLogo />
            <h1 className="mt-6 text-3xl font-bold text-gray-900">Choose Your Application</h1>
            <p className="mt-2 text-sm text-gray-500">Select an application to manage.</p>
          </div>

          {/* App cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {APPS.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className="group flex flex-col rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5 transition hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Icon circle */}
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${app.iconBg} ${app.iconColor}`}>
                  {app.icon}
                </div>

                {/* Text */}
                <p className="font-semibold text-gray-900">{app.label}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{app.description}</p>

                {/* CTA */}
                <div className={`mt-6 flex items-center gap-1 text-sm font-semibold transition ${app.ctaColor}`}>
                  {app.cta}
                  <svg viewBox="0 0 16 16" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M8 3l5 5-5 5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </AuthGuard>
  )
}
