'use client'

import { brandLogoUrlFromFeedUrl } from '@/lib/brandLogo'

type Source = {
  name: string | null
  avatarUrl: string | null
  feedUrl: string | null
} | null | undefined

type Content = {
  id: string
  title: string
  summary: string | null
  sourceUrl: string
  publishedAt: Date | null
  thumbnailUrl: string | null
  source: Source
}

function sourceLogoSrc(source: Source): string | null {
  if (!source) return null
  if (source.avatarUrl) return source.avatarUrl
  return brandLogoUrlFromFeedUrl(source.feedUrl)
}

export function PlayerNewsMentionCard({ content }: { content: Content }) {
  const logo = sourceLogoSrc(content.source)
  const name = content.source?.name ?? 'Unknown'

  return (
    <a
      href={content.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-xl border p-4 transition-all hover:border-red-800/50 hover:bg-white/[0.02]"
      style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border"
        style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(10,10,10)' }}
      >
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-tighter" style={{ color: 'rgb(82,82,91)' }}>
            {name.slice(0, 2)}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(115,115,115)' }}>
          <span className="font-medium text-zinc-300">{name}</span>
          {content.publishedAt && (
            <>
              <span>·</span>
              <span>{new Date(content.publishedAt).toLocaleDateString()}</span>
            </>
          )}
        </div>
        <p className="mt-1 font-medium text-white transition-colors group-hover:text-red-400 line-clamp-2">
          {content.title}
        </p>
        {content.summary && (
          <p className="mt-1 text-sm line-clamp-2" style={{ color: 'rgb(115,115,115)' }}>
            {content.summary}
          </p>
        )}
      </div>
      {content.thumbnailUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={content.thumbnailUrl} alt="" className="hidden h-16 w-24 shrink-0 rounded-lg object-cover sm:block" />
      )}
    </a>
  )
}
