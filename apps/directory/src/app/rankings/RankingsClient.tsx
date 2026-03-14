'use client'

import { useState, useCallback } from 'react'

interface RankingSite {
  id: string
  name: string
  description: string
  url: string
  logoUrl: string | null
  categories: string[]
  popularityScore: number
  promoCode: string | null
  promoDesc: string | null
  featured: boolean
}

const ALL_CATEGORIES = ['Redraft', 'Dynasty', 'DFS', 'Best Ball', 'Tools'] as const

const CATEGORY_COLOR: Record<string, string> = {
  Redraft: 'rgba(59,130,246,0.15)',
  Dynasty: 'rgba(168,85,247,0.15)',
  DFS: 'rgba(34,197,94,0.15)',
  'Best Ball': 'rgba(234,179,8,0.15)',
  Tools: 'rgba(20,184,166,0.15)',
}
const CATEGORY_TEXT: Record<string, string> = {
  Redraft: 'rgb(147,197,253)',
  Dynasty: 'rgb(216,180,254)',
  DFS: 'rgb(134,239,172)',
  'Best Ball': 'rgb(253,224,71)',
  Tools: 'rgb(94,234,212)',
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

function SiteLogo({ site }: { site: RankingSite }) {
  const [errored, setErrored] = useState(false)
  const domain = extractDomain(site.url)
  const src = site.logoUrl ?? (domain ? `https://logo.clearbit.com/${domain}` : null)
  const initial = site.name.charAt(0).toUpperCase()

  if (!src || errored) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
      >
        {initial}
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={site.name}
      className="h-10 w-10 shrink-0 rounded-lg object-contain"
      onError={() => setErrored(true)}
    />
  )
}

async function trackPromoClick(siteId: string, code: string) {
  try {
    await fetch('/api/promo-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'ranking_site', itemId: siteId, code }),
    })
  } catch {
    // non-critical
  }
}

export function RankingsClient({ sites }: { sites: RankingSite[] }) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const toggleCategory = (cat: string) => {
    setActive((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const filtered = active.size === 0
    ? sites
    : sites.filter((s) => s.categories.some((c) => active.has(c)))

  const handleCopyPromo = useCallback(async (site: RankingSite) => {
    if (!site.promoCode) return
    await navigator.clipboard.writeText(site.promoCode)
    setCopied(site.id)
    await trackPromoClick(site.id, site.promoCode)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  return (
    <div>
      {/* Filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(new Set())}
          className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
          style={
            active.size === 0
              ? { background: 'rgb(220,38,38)', color: 'white' }
              : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
          }
        >
          All
          <span className="ml-1.5 text-xs opacity-60">{sites.length}</span>
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const count = sites.filter((s) => s.categories.includes(cat)).length
          const isActive = active.has(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="rounded-full px-4 py-1.5 text-sm font-medium transition-all"
              style={
                isActive
                  ? { background: CATEGORY_COLOR[cat] ?? 'rgba(220,38,38,0.15)', color: CATEGORY_TEXT[cat] ?? 'white', border: `1px solid ${CATEGORY_TEXT[cat] ?? 'rgb(220,38,38)'}33` }
                  : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
              }
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-60">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Site list */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl border py-16 text-center"
          style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}
        >
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>No sites match the selected filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((site) => (
            <div
              key={site.id}
              className="group flex items-center gap-4 rounded-xl border p-4 transition-all hover:border-red-800/40"
              style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
            >
              <SiteLogo site={site} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-white transition-colors hover:text-red-400"
                  >
                    {site.name}
                  </a>
                  {site.featured && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'rgba(234,179,8,0.15)', color: 'rgb(253,224,71)' }}>
                      ★ Partner
                    </span>
                  )}
                  {site.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: CATEGORY_COLOR[cat] ?? 'rgba(115,115,115,0.15)', color: CATEGORY_TEXT[cat] ?? 'rgb(163,163,163)' }}
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="mt-1 line-clamp-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>
                  {site.description}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {site.promoCode && (
                  <button
                    onClick={() => handleCopyPromo(site)}
                    title={site.promoDesc ?? 'Copy promo code'}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all hover:border-yellow-500/40 hover:bg-yellow-500/10"
                    style={{ borderColor: 'rgba(234,179,8,0.3)', color: 'rgb(253,224,71)', background: 'rgba(234,179,8,0.08)' }}
                  >
                    {copied === site.id ? (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/></svg>
                    )}
                    {copied === site.id ? 'Copied!' : site.promoCode}
                  </button>
                )}
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all hover:border-red-800/50 hover:bg-red-800/10"
                  style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(115,115,115)' }}
                >
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path d="M10.5 5.5H15m0 0v4.5M15 5.5l-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
