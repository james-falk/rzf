import { unstable_cache } from 'next/cache'
import { db } from '@rzf/db'

const TRENDING_WINDOW_HOURS = 72
const CACHE_SECONDS = 15 * 60 // 15 minutes

export type TrendingTopicRow = { slug: string; count: number }

async function fetchTrendingTopics(): Promise<TrendingTopicRow[]> {
  try {
    const since = new Date(Date.now() - TRENDING_WINDOW_HOURS * 60 * 60 * 1000)
    const rows = await db.$queryRaw<Array<{ topic: string; count: bigint }>>`
      SELECT u.topic AS topic, COUNT(*)::bigint AS count
      FROM content_items ci
      CROSS JOIN LATERAL unnest(ci.topics) AS u(topic)
      WHERE ci.published_at >= ${since}
        AND ci.topics IS NOT NULL
        AND cardinality(ci.topics) > 0
        AND length(trim(u.topic)) > 0
      GROUP BY u.topic
      ORDER BY count DESC
      LIMIT 5
    `
    return rows.map((r) => ({ slug: r.topic, count: Number(r.count) }))
  } catch {
    return []
  }
}

export const getTrendingTopics = unstable_cache(fetchTrendingTopics, ['directory-trending-topics'], {
  revalidate: CACHE_SECONDS,
})
