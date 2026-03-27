import { db } from '@rzf/db'
import Navbar from '@/components/Navbar'
import { brandLogoUrlFromDomain } from '@/lib/brandLogo'
import { ToolsClient } from './ToolsClient'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Fantasy Tools — Red Zone Fantasy',
  description: 'A curated directory of the best fantasy football tools, apps, and resources — free, paid, and AI-powered.',
}

export default async function ToolsPage() {
  const tools = await db.fantasyTool.findMany({
    where: { isActive: true },
    orderBy: [{ featured: 'desc' }, { partnerTier: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
  })

  const featured = tools.filter((t) => t.featured)
  const rest = tools.filter((t) => !t.featured)

  return (
    <div className="min-h-screen" style={{ background: 'rgb(10,10,10)' }}>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Fantasy Tools</h1>
          <p className="mt-1 text-sm" style={{ color: 'rgb(115,115,115)' }}>
            {tools.length} tools, apps, and resources curated for fantasy football managers
          </p>
        </div>

        {/* Featured section */}
        {featured.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-bold text-white">Featured</span>
              <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(234,179,8,0.15)', color: 'rgb(253,224,71)' }}>
                ★ Partner Tools
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((tool) => (
                <FeaturedToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* Full directory */}
        <section>
          {featured.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-bold text-white">All Tools</h2>
            </div>
          )}
          <ToolsClient tools={rest} />
        </section>
      </main>
    </div>
  )
}

function FeaturedToolCard({ tool }: { tool: Awaited<ReturnType<typeof db.fantasyTool.findMany>>[0] }) {
  const domain = (() => { try { return new URL(tool.url).hostname.replace(/^www\./, '') } catch { return '' } })()
  const logoSrc = tool.logoUrl ?? (domain ? brandLogoUrlFromDomain(domain) : null)
  const priceLabel = tool.priceType === 'free' ? 'Free' : tool.priceType === 'freemium' ? 'Freemium' : tool.price ?? 'Paid'

  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:border-red-800/40 hover:shadow-lg"
      style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
    >
      {/* Logo area */}
      <div className="flex items-center justify-center p-8" style={{ background: 'rgb(14,14,14)' }}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt={tool.name}
            className="h-16 w-16 rounded-xl object-contain"
          />
        ) : (
          <div
            className="flex h-16 w-16 items-center justify-center rounded-xl text-2xl font-bold"
            style={{ background: 'rgba(220,38,38,0.15)', color: 'rgb(220,38,38)' }}
          >
            {tool.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">
            {tool.name}
          </h3>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={
              tool.priceType === 'free'
                ? { background: 'rgba(34,197,94,0.15)', color: 'rgb(134,239,172)' }
                : tool.priceType === 'freemium'
                ? { background: 'rgba(59,130,246,0.15)', color: 'rgb(147,197,253)' }
                : { background: 'rgba(168,85,247,0.15)', color: 'rgb(216,180,254)' }
            }
          >
            {priceLabel}
          </span>
        </div>
        <p className="mb-3 text-xs leading-relaxed line-clamp-2" style={{ color: 'rgb(115,115,115)' }}>
          {tool.description}
        </p>
        {tool.promoCode && (
          <div
            className="mt-auto flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs"
            style={{ borderColor: 'rgba(234,179,8,0.3)', background: 'rgba(234,179,8,0.08)', color: 'rgb(253,224,71)' }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3 shrink-0"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/></svg>
            <span className="font-mono font-bold">{tool.promoCode}</span>
            {tool.promoDesc && <span className="text-yellow-300/60">— {tool.promoDesc}</span>}
          </div>
        )}
      </div>
    </a>
  )
}
