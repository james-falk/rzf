/**
 * YouTube Data API v3 Connector
 *
 * Strategy (quota-efficient):
 *   1. channels.list (1 unit) — resolve upload playlist ID once per channel, cache in platformConfig
 *   2. playlistItems.list (1 unit/page) — get latest video IDs from upload playlist
 *   3. videos.list (1 unit/batch of 50) — fetch full metadata for new videos only
 *
 * With 10,000 units/day free tier, polling ~50 channels every 2 hours uses ~2,400 units/day.
 * Avoids search.list (100 units/call) entirely.
 */

import { db } from '@rzf/db'
import { env } from '@rzf/shared/env'
import { resolvePlayerMentions, extractSnippet, inferMentionContext } from '@rzf/shared'

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

// ─── Types ────────────────────────────────────────────────────────────────────

interface YouTubeChannelResponse {
  items?: Array<{
    id: string
    contentDetails: {
      relatedPlaylists: { uploads: string }
    }
  }>
}

interface YouTubePlaylistItemsResponse {
  nextPageToken?: string
  items?: Array<{
    snippet: {
      resourceId: { videoId: string }
      publishedAt: string
      channelTitle: string
    }
  }>
}

interface YouTubeVideoItem {
  id: string
  snippet: {
    title: string
    description: string
    publishedAt: string
    channelTitle: string
    channelId: string
    thumbnails?: { medium?: { url?: string } }
    tags?: string[]
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
  }
  contentDetails?: {
    duration?: string
  }
}

interface YouTubeVideosResponse {
  items?: YouTubeVideoItem[]
}

// ─── Topic Tagging ────────────────────────────────────────────────────────────

function inferTopics(text: string): string[] {
  const t = text.toLowerCase()
  const topics: string[] = []
  if (/injur|hurt|questionable|doubtful|out\b|placed on ir|injured reserve/.test(t)) topics.push('injury')
  if (/trade[d]?|trading|deal|acqui[re|red]/.test(t)) topics.push('trade')
  if (/waiver|stream|pickup|add\b/.test(t)) topics.push('waiver')
  if (/start|lineup|flex|sit\b|bench|must.?start/.test(t)) topics.push('lineup')
  if (/break.?out|emerge|target share|snap count|usage rate|role/.test(t)) topics.push('breakout')
  if (/depth chart|promoted|demoted|starter|resting/.test(t)) topics.push('depth_chart')
  if (/rank\b|ranking|tier\b|consensus/.test(t)) topics.push('rankings')
  return topics
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const apiKey = env.YOUTUBE_API_KEY
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not configured')

  const qs = new URLSearchParams({ ...params, key: apiKey })
  const res = await fetch(`${YT_BASE}${path}?${qs}`, {
    headers: { 'User-Agent': 'RedZoneFantasy/1.0' },
  })

  if (res.status === 403) {
    throw new Error('YouTube API quota exceeded for today. Will retry after midnight PT.')
  }
  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

async function getUploadPlaylistId(channelId: string): Promise<string> {
  const data = await ytFetch<YouTubeChannelResponse>('/channels', {
    part: 'contentDetails',
    id: channelId,
  })
  const item = data.items?.[0]
  if (!item) throw new Error(`YouTube channel not found: ${channelId}`)
  return item.contentDetails.relatedPlaylists.uploads
}

async function getLatestVideoIds(playlistId: string, maxResults = 50): Promise<string[]> {
  const data = await ytFetch<YouTubePlaylistItemsResponse>('/playlistItems', {
    part: 'snippet',
    playlistId,
    maxResults: String(maxResults),
  })
  return (data.items ?? []).map((item) => item.snippet.resourceId.videoId)
}

async function getVideoMetadata(videoIds: string[]): Promise<YouTubeVideoItem[]> {
  if (videoIds.length === 0) return []
  const data = await ytFetch<YouTubeVideosResponse>('/videos', {
    part: 'snippet,statistics,contentDetails',
    id: videoIds.join(','),
    maxResults: '50',
  })
  return data.items ?? []
}

// ─── Source Processor ─────────────────────────────────────────────────────────

interface YouTubeRunResult {
  inserted: number
  sources: number
  errors: Array<{ source: string; message: string }>
}

async function processChannel(
  source: { id: string; name: string; feedUrl: string; platformConfig: unknown },
  aliases: Array<{ alias: string; playerId: string; aliasType: string }>,
): Promise<number> {
  const config = (source.platformConfig ?? {}) as Record<string, string>
  let uploadPlaylistId = config.uploadPlaylistId as string | undefined

  // Resolve and cache upload playlist ID on first run
  if (!uploadPlaylistId) {
    const channelId = config.channelId ?? source.feedUrl
    uploadPlaylistId = await getUploadPlaylistId(channelId)
    await db.contentSource.update({
      where: { id: source.id },
      data: { platformConfig: { ...config, uploadPlaylistId } },
    })
  }

  const videoIds = await getLatestVideoIds(uploadPlaylistId)
  if (videoIds.length === 0) return 0

  // Batch dedup: skip already-stored videos
  const candidateUrls = videoIds.map((id) => `https://www.youtube.com/watch?v=${id}`)
  const existing = await db.contentItem.findMany({
    where: { sourceUrl: { in: candidateUrls } },
    select: { sourceUrl: true },
  })
  const existingUrls = new Set(existing.map((e) => e.sourceUrl))

  const newVideoIds = videoIds.filter((id) => !existingUrls.has(`https://www.youtube.com/watch?v=${id}`))
  if (newVideoIds.length === 0) return 0

  const videos = await getVideoMetadata(newVideoIds)
  let inserted = 0

  for (const video of videos) {
    const sourceUrl = `https://www.youtube.com/watch?v=${video.id}`
    const rawContent = `${video.snippet.title}\n\n${video.snippet.description}`
    const topics = inferTopics(rawContent)
    const matches = resolvePlayerMentions(rawContent, aliases)

    try {
      const contentItem = await db.contentItem.create({
        data: {
          sourceId: source.id,
          contentType: 'video',
          sourceUrl,
          title: video.snippet.title,
          rawContent,
          authorName: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt ? new Date(video.snippet.publishedAt) : null,
          thumbnailUrl: video.snippet.thumbnails?.medium?.url ?? null,
          topics,
          mediaMeta: {
            channelId: video.snippet.channelId,
            viewCount: video.statistics?.viewCount ? parseInt(video.statistics.viewCount, 10) : null,
            likeCount: video.statistics?.likeCount ? parseInt(video.statistics.likeCount, 10) : null,
            duration: video.contentDetails?.duration ?? null,
            tags: video.snippet.tags ?? [],
          },
        },
      })

      if (matches.length > 0) {
        await db.contentPlayerMention.createMany({
          data: matches.map((match) => {
            const snippet = extractSnippet(rawContent, match)
            return {
              contentId: contentItem.id,
              playerId: match.playerId,
              context: inferMentionContext(snippet),
              snippet,
            }
          }),
          skipDuplicates: true,
        })
      }

      inserted++
    } catch (err) {
      // Skip individual video errors (e.g. duplicate sourceUrl race condition)
      if (!(err instanceof Error && err.message.includes('Unique constraint'))) {
        throw err
      }
    }
  }

  return inserted
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const YouTubeConnector = {
  /**
   * Fetch all active YouTube sources from the DB and process each channel.
   * Safe to call repeatedly — deduplicates by sourceUrl (video URL).
   */
  async run(): Promise<YouTubeRunResult> {
    if (!env.YOUTUBE_API_KEY) {
      console.log('[youtube] YOUTUBE_API_KEY not set — skipping YouTube refresh')
      return { inserted: 0, sources: 0, errors: [] }
    }

    const sources = await db.contentSource.findMany({
      where: { platform: 'youtube', isActive: true },
    })

    if (sources.length === 0) {
      console.log('[youtube] No active YouTube sources in DB')
      return { inserted: 0, sources: 0, errors: [] }
    }

    const aliases = await db.playerAlias.findMany({
      select: { alias: true, playerId: true, aliasType: true },
    })

    console.log(`[youtube] Processing ${sources.length} channel(s)`)

    let totalInserted = 0
    const errors: YouTubeRunResult['errors'] = []

    for (const source of sources) {
      try {
        console.log(`[youtube] Processing "${source.name}"`)
        const inserted = await processChannel(source, aliases)
        totalInserted += inserted
        console.log(`[youtube] "${source.name}": +${inserted} new videos`)

        await db.contentSource.update({
          where: { id: source.id },
          data: { lastFetchedAt: new Date() },
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error(`[youtube] Error on "${source.name}": ${message}`)
        errors.push({ source: source.name, message })

        // Stop entirely on quota exceeded — don't waste remaining attempts
        if (message.includes('quota exceeded')) break
      }
    }

    console.log(`[youtube] Done — ${totalInserted} new videos across ${sources.length} channels`)
    return { inserted: totalInserted, sources: sources.length, errors }
  },
}
