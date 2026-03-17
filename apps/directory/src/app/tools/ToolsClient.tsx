'use client'

import { useState, useCallback } from 'react'

interface FantasyTool {
  id: string
  name: string
  description: string
  url: string
  logoUrl: string | null
  categories: string[]
  priceType: string
  price: string | null
  promoCode: string | null
  promoDesc: string | null
  featured: boolean
  partnerTier: string | null
}

const ALL_CATEGORIES = ['Free', 'Freemium', 'Paid', 'AI', 'Rankings', 'DFS', 'Trade Analysis', 'Dynasty'] as const

const CATEGORY_COLOR: Record<string, string> = {
  Free: 'rgba(34,197,94,0.15)',
  Freemium: 'rgba(59,130,246,0.15)',
  Paid: 'rgba(168,85,247,0.15)',
  AI: 'rgba(220,38,38,0.15)',
  Rankings: 'rgba(234,179,8,0.15)',
  DFS: 'rgba(20,184,166,0.15)',
  'Trade Analysis': 'rgba(249,115,22,0.15)',
  Dynasty: 'rgba(139,92,246,0.15)',
}
const CATEGORY_TEXT: Record<string, string> = {
  Free: 'rgb(134,239,172)',
  Freemium: 'rgb(147,197,253)',
  Paid: 'rgb(216,180,254)',
  AI: 'rgb(252,165,165)',
  Rankings: 'rgb(253,224,71)',
  DFS: 'rgb(94,234,212)',
  'Trade Analysis': 'rgb(253,186,116)',
  Dynasty: 'rgb(196,181,253)',
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' }
}

function ToolLogo({ tool }: { tool: FantasyTool }) {
  const [errored, setErrored] = useState(false)
  const domain = extractDomain(tool.url)
  const src = tool.logoUrl ?? (domain ? `https://logo.clearbit.com/${domain}` : null)
  if (!src || errored) {
    return (
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
      >
        {tool.name.charAt(0)}
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={tool.name} className="h-10 w-10 shrink-0 rounded-lg object-contain" onError={() => setErrored(true)} />
  )
}

async function trackPromoClick(toolId: string, code: string) {
  try {
    await fetch('/api/promo-click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemType: 'fantasy_tool', itemId: toolId, code }),
    })
  } catch { /* non-critical */ }
}

export function ToolsClient({ tools }: { tools: FantasyTool[] }) {
  const [active, setActive] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const toggleCategory = (cat: string) => {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) { next.delete(cat) } else { next.add(cat) }
      return next
    })
  }

  const filtered = tools.filter((t) => {
    // Price type filters map to categories
    const effectiveCategories = [
      ...t.categories,
      t.priceType === 'free' ? 'Free' : t.priceType === 'freemium' ? 'Freemium' : 'Paid',
    ]
    const matchesCategory = active.size === 0 || effectiveCategories.some((c) => active.has(c))
    const q = search.toLowerCase()
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    return matchesCategory && matchesSearch
  })

  const handleCopyPromo = useCallback(async (tool: FantasyTool) => {
    if (!tool.promoCode) return
    await navigator.clipboard.writeText(tool.promoCode)
    setCopied(tool.id)
    await trackPromoClick(tool.id, tool.promoCode)
    setTimeout(() => setCopied(null), 2000)
  }, [])

  const priceLabel = (tool: FantasyTool) =>
    tool.priceType === 'free' ? 'Free' : tool.priceType === 'freemium' ? 'Freemium' : tool.price ?? 'Paid'

  return (
    <div>
      {/* Search + filter chips */}
      <div className="mb-4">
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'rgb(115,115,115)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools..."
            className="w-full rounded-lg border py-2.5 pl-9 pr-4 text-sm text-white placeholder-neutral-500 outline-none transition-colors focus:border-red-600"
            style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActive(new Set())}
            className="rounded-full px-3 py-2 text-xs font-medium transition-all"
            style={active.size === 0 ? { background: 'rgb(220,38,38)', color: 'white' } : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }}
          >
            All <span className="opacity-60">{tools.length}</span>
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const isActive = active.has(cat)
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className="rounded-full px-3 py-2 text-xs font-medium transition-all"
                style={
                  isActive
                    ? { background: CATEGORY_COLOR[cat] ?? 'rgba(115,115,115,0.15)', color: CATEGORY_TEXT[cat] ?? 'white', border: `1px solid ${CATEGORY_TEXT[cat] ?? 'rgb(115,115,115)'}33` }
                    : { background: 'rgb(26,26,26)', color: 'rgb(163,163,163)', border: '1px solid rgb(38,38,38)' }
                }
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tool list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border py-16 text-center" style={{ borderColor: 'rgb(26,26,26)', background: 'rgb(14,14,14)' }}>
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>No tools match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((tool) => (
            <div
              key={tool.id}
              className="group flex flex-col gap-3 rounded-xl border p-4 transition-all hover:border-red-800/40 sm:flex-row sm:items-center"
              style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <ToolLogo tool={tool} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-white transition-colors hover:text-red-400"
                    >
                      {tool.name}
                    </a>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={
                        tool.priceType === 'free'
                          ? { background: 'rgba(34,197,94,0.15)', color: 'rgb(134,239,172)' }
                          : tool.priceType === 'freemium'
                          ? { background: 'rgba(59,130,246,0.15)', color: 'rgb(147,197,253)' }
                          : { background: 'rgba(168,85,247,0.15)', color: 'rgb(216,180,254)' }
                      }
                    >
                      {priceLabel(tool)}
                    </span>
                    {tool.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: CATEGORY_COLOR[cat] ?? 'rgba(115,115,115,0.15)', color: CATEGORY_TEXT[cat] ?? 'rgb(163,163,163)' }}
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs sm:line-clamp-1" style={{ color: 'rgb(115,115,115)' }}>{tool.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                {tool.promoCode && (
                  <button
                    onClick={() => handleCopyPromo(tool)}
                    title={tool.promoDesc ?? 'Copy promo code'}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all hover:border-yellow-500/40 hover:bg-yellow-500/10"
                    style={{ borderColor: 'rgba(234,179,8,0.3)', color: 'rgb(253,224,71)', background: 'rgba(234,179,8,0.08)' }}
                  >
                    {copied === tool.id ? '✓ Copied!' : `🎟 ${tool.promoCode}`}
                  </button>
                )}
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-all hover:border-red-800/50 hover:bg-red-800/10"
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
