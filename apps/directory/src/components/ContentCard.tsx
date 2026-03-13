import Link from 'next/link'
import Image from 'next/image'

interface PlayerChip {
  sleeperId: string
  firstName: string
  lastName: string
  position: string | null
}

interface ContentCardProps {
  id: string
  title: string
  summary: string | null
  thumbnailUrl: string | null
  sourceUrl: string
  publishedAt: Date | null
  contentType: string
  authorName: string | null
  source: {
    name: string
    platform: string
    avatarUrl: string | null
    featured: boolean
    partnerTier: string | null
  } | null
  playerMentions: Array<{ player: PlayerChip }>
}

const PLATFORM_BADGE: Record<string, { label: string; color: string }> = {
  YOUTUBE: { label: 'YouTube', color: 'rgba(239,68,68,0.2)' },
  RSS: { label: 'Article', color: 'rgba(59,130,246,0.2)' },
  X: { label: 'X / Twitter', color: 'rgba(100,116,139,0.2)' },
  PODCAST: { label: 'Podcast', color: 'rgba(168,85,247,0.2)' },
  FANTASYPROS: { label: 'FantasyPros', color: 'rgba(34,197,94,0.2)' },
}

const PARTNER_BADGE: Record<string, string> = {
  gold: 'bg-yellow-500/20 text-yellow-400',
  silver: 'bg-zinc-400/20 text-zinc-300',
  bronze: 'bg-orange-700/20 text-orange-400',
}

function timeAgo(date: Date | null): string {
  if (!date) return ''
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export function ContentCard({
  title,
  summary,
  thumbnailUrl,
  sourceUrl,
  publishedAt,
  contentType,
  source,
  playerMentions,
}: ContentCardProps) {
  const platform = source?.platform ?? 'RSS'
  const badge = PLATFORM_BADGE[platform] ?? PLATFORM_BADGE.RSS!

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-xl border transition-all hover:border-red-800/40 hover:shadow-lg"
      style={{ background: 'rgb(18,18,18)', borderColor: 'rgb(38,38,38)' }}
    >
      {/* Thumbnail */}
      {(thumbnailUrl || contentType === 'youtube_video') && (
        <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              className="object-cover transition group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-red-600" fill="currentColor">
                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              </svg>
            </div>
          )}
          {/* Partner badge overlay */}
          {source?.featured && source.partnerTier && (
            <div className="absolute left-2 top-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PARTNER_BADGE[source.partnerTier] ?? ''}`}>
                ★ Partner
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {/* Source + platform + time */}
        <div className="mb-2 flex items-center gap-2">
          {source?.avatarUrl ? (
            <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-zinc-800">
              <Image src={source.avatarUrl} alt={source.name} fill className="object-cover" unoptimized />
            </div>
          ) : (
            <div className="h-5 w-5 shrink-0 rounded-full bg-zinc-700" />
          )}
          <span className="truncate text-xs font-medium" style={{ color: 'rgb(163,163,163)' }}>
            {source?.name ?? 'Unknown source'}
            {source?.featured && !source.partnerTier && (
              <span className="ml-1.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-red-400">
                Featured
              </span>
            )}
          </span>
          <span
            className="ml-auto shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{ background: badge.color, color: 'rgb(203,213,225)' }}
          >
            {badge.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-red-400 transition-colors">
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed" style={{ color: 'rgb(115,115,115)' }}>
            {summary}
          </p>
        )}

        {/* Footer: player chips + time */}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {playerMentions.slice(0, 3).map(({ player }) => (
            <Link
              key={player.sleeperId}
              href={`/players/${player.sleeperId}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition hover:border-red-800/50"
              style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(26,26,26)', color: 'rgb(163,163,163)' }}
            >
              <div className="relative h-3.5 w-3.5 shrink-0 overflow-hidden rounded-full bg-zinc-700">
                <Image
                  src={`https://sleepercdn.com/content/nfl/players/thumb/${player.sleeperId}.jpg`}
                  alt={`${player.firstName} ${player.lastName}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {player.firstName[0]}. {player.lastName}
            </Link>
          ))}
          {playerMentions.length > 3 && (
            <span className="text-[10px]" style={{ color: 'rgb(82,82,91)' }}>+{playerMentions.length - 3}</span>
          )}
          {publishedAt && (
            <span className="ml-auto text-[10px]" style={{ color: 'rgb(82,82,91)' }}>
              {timeAgo(publishedAt)}
            </span>
          )}
        </div>
      </div>
    </a>
  )
}
