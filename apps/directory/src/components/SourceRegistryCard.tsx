'use client'

import Image from 'next/image'
import type { SourceRegistryRow } from '@/app/sources/types'
import { brandLogoUrlFromDomain } from '@/lib/brandLogo'

function extractDomain(url: string): string | null {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

const PLATFORM_BADGE: Record<string, { label: string; bg: string }> = {
  youtube: { label: 'YouTube', bg: 'rgba(239,68,68,0.2)' },
  rss: { label: 'RSS', bg: 'rgba(59,130,246,0.2)' },
  twitter: { label: 'X / Twitter', bg: 'rgba(100,116,139,0.2)' },
  podcast: { label: 'Podcast', bg: 'rgba(168,85,247,0.2)' },
  reddit: { label: 'Reddit', bg: 'rgba(234,179,8,0.2)' },
  api: { label: 'News API', bg: 'rgba(34,197,94,0.2)' },
  manual: { label: 'Manual', bg: 'rgba(115,115,115,0.2)' },
}

const PARTNER_BADGE: Record<string, string> = {
  gold: 'bg-yellow-500/20 text-yellow-400',
  silver: 'bg-zinc-400/20 text-zinc-300',
  bronze: 'bg-orange-700/20 text-orange-400',
}

function timeAgo(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function SourceRegistryCard({ source }: { source: SourceRegistryRow }) {
  const platform = source.platform ?? 'rss'
  const badge = PLATFORM_BADGE[platform] ?? PLATFORM_BADGE['rss']!
  const domain = extractDomain(source.feedUrl)
  const showClearbit = !source.avatarUrl && domain

  return (
    <a
      href={source.feedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:border-red-800/40 hover:shadow-lg"
      style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        {source.avatarUrl ? (
          <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 p-8">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl shadow-lg ring-1 ring-white/10">
              <Image
                src={source.avatarUrl}
                alt={source.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        ) : showClearbit ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-800 to-zinc-950 p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brandLogoUrlFromDomain(domain)}
              alt=""
              className="h-14 w-14 rounded-xl object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-center text-xs font-medium" style={{ color: 'rgb(115,115,115)' }}>
              {source.name}
            </span>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-950/40 to-zinc-950">
            <span
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
              style={{ background: 'rgba(220,38,38,0.2)', color: 'rgb(252,165,165)' }}
            >
              {source.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {source.featured && source.partnerTier && (
          <div className="absolute left-2 top-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PARTNER_BADGE[source.partnerTier] ?? ''}`}
            >
              ★ Partner
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-start gap-2">
          <span
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: badge.bg, color: 'rgb(203,213,225)' }}
          >
            {badge.label}
          </span>
          {!source.isActive && (
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-red-400" style={{ background: 'rgba(220,38,38,0.12)' }}>
              Inactive
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-white transition-colors group-hover:text-red-400">
          {source.name}
        </h3>

        <p className="mb-3 text-2xl font-bold tabular-nums text-white">{source.itemCount.toLocaleString()}</p>
        <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>
          ingested item{source.itemCount !== 1 ? 's' : ''} in the directory
        </p>

        {source.lastFetchedAt && (
          <p className="mt-auto pt-3 text-[10px]" style={{ color: 'rgb(82,82,91)' }} suppressHydrationWarning>
            Last fetched {timeAgo(source.lastFetchedAt)}
          </p>
        )}
      </div>
    </a>
  )
}
