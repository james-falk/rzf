import { Worker } from 'bullmq'
import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { RSSConnector } from '@rzf/connectors/rss'
import { IngestionJobTypes, generateAliases } from '@rzf/shared'
import type { IngestionJobType } from '@rzf/shared/types'
import { getRedisConnection } from '../redis.js'
import { QUEUE_NAMES } from '../queues.js'

export function createIngestionWorker(): Worker<{ type: IngestionJobType }> {
  const worker = new Worker<{ type: IngestionJobType }>(
    QUEUE_NAMES.INGESTION,
    async (job) => {
      const { type } = job.data
      console.log(`[ingestion-worker] Starting ${type} job ${job.id}`)

      switch (type) {
        case IngestionJobTypes.PLAYER_REFRESH:
          await runPlayerRefresh()
          break
        case IngestionJobTypes.TRENDING_REFRESH:
          await runTrendingRefresh()
          break
        case IngestionJobTypes.RANKINGS_REFRESH:
          await runRankingsRefresh()
          break
        case IngestionJobTypes.CONTENT_REFRESH:
          await runContentRefresh()
          break
        default:
          throw new Error(`Unknown ingestion job type: ${type}`)
      }

      console.log(`[ingestion-worker] Completed ${type} job ${job.id}`)
    },
    {
      connection: getRedisConnection(),
      concurrency: 1, // Ingestion jobs run one at a time
    },
  )

  return worker
}

// Fantasy-relevant offensive positions only — excludes all defensive/special teams
// positions that add no value to the system and waste storage + alias resolution.
const OFFENSIVE_POSITIONS = new Set(['QB', 'RB', 'WR', 'TE', 'K', 'FB'])

// ─── PlayerRefreshJob ─────────────────────────────────────────────────────────
// Daily: fetch all NFL players from Sleeper and upsert into Player table

async function runPlayerRefresh(): Promise<void> {
  console.log('[ingestion] Fetching all players from Sleeper...')
  const players = await SleeperConnector.getAllPlayers()
  const entries = Object.values(players).filter(
    (p) => p.position && OFFENSIVE_POSITIONS.has(p.position),
  )

  console.log(`[ingestion] Upserting ${entries.length} players...`)

  let updated = 0
  // Process in batches to avoid Prisma transaction limits
  const BATCH_SIZE = 200
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (p) => {
        const firstName = p.first_name ?? ''
        const lastName = p.last_name ?? ''

        await db.player.upsert({
          where: { sleeperId: p.player_id },
          create: {
            sleeperId: p.player_id,
            firstName,
            lastName,
            position: p.position ?? 'UNKNOWN',
            team: p.team ?? null,
            status: p.status ?? 'Unknown',
            injuryStatus: p.injury_status ?? null,
            practiceParticipation: p.practice_participation ?? null,
            depthChartPosition: p.depth_chart_position ?? null,
            depthChartOrder: p.depth_chart_order ?? null,
            searchRank: p.search_rank ?? null,
            age: p.age ?? null,
            yearsExp: p.years_exp ?? null,
            metadata: JSON.parse(JSON.stringify(p)),
            lastRefreshedAt: new Date(),
          },
          update: {
            team: p.team ?? null,
            status: p.status ?? 'Unknown',
            injuryStatus: p.injury_status ?? null,
            practiceParticipation: p.practice_participation ?? null,
            depthChartPosition: p.depth_chart_position ?? null,
            depthChartOrder: p.depth_chart_order ?? null,
            searchRank: p.search_rank ?? null,
            metadata: JSON.parse(JSON.stringify(p)),
            lastRefreshedAt: new Date(),
          },
        })

        // Generate and upsert name aliases for entity resolution
        if (firstName && lastName) {
          const aliases = generateAliases({
            sleeperId: p.player_id,
            firstName,
            lastName,
          })

          if (aliases.length > 0) {
            await db.playerAlias.createMany({
              data: aliases.map((a) => ({
                playerId: a.playerId,
                alias: a.alias,
                aliasType: a.aliasType,
              })),
              skipDuplicates: true,
            })
          }
        }
      }),
    )
    updated += batch.length
    console.log(`[ingestion] Player refresh progress: ${updated}/${entries.length}`)
  }

  console.log(`[ingestion] Player refresh complete: ${updated} players upserted`)
}

// ─── TrendingRefreshJob ───────────────────────────────────────────────────────
// Hourly: fetch trending adds + drops and store in TrendingPlayer table

async function runTrendingRefresh(): Promise<void> {
  const [adds, drops] = await Promise.all([
    SleeperConnector.getTrending('add', 24, 25),
    SleeperConnector.getTrending('drop', 24, 25),
  ])

  const now = new Date()

  await db.trendingPlayer.createMany({
    data: [
      ...adds.map((t) => ({
        playerId: t.player_id,
        type: 'add' as const,
        count: t.count,
        lookbackHours: 24,
        fetchedAt: now,
      })),
      ...drops.map((t) => ({
        playerId: t.player_id,
        type: 'drop' as const,
        count: t.count,
        lookbackHours: 24,
        fetchedAt: now,
      })),
    ],
    skipDuplicates: true,
  })

  console.log(`[ingestion] Trending refresh: ${adds.length} adds, ${drops.length} drops`)
}

// ─── RankingsRefreshJob ───────────────────────────────────────────────────────
// Weekly: fetch FantasyPros consensus rankings CSV and store in PlayerRanking

async function runRankingsRefresh(): Promise<void> {
  // Phase 1: Use Sleeper's built-in search_rank as a rankings proxy
  // Phase 2: Fetch and parse FantasyPros CSV
  // For now, generate rankings from our cached Player.searchRank data

  const nflState = await SleeperConnector.getNFLState()
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const players = await db.player.findMany({
    where: {
      searchRank: { not: null },
      status: 'Active',
      position: { in: [...OFFENSIVE_POSITIONS] },
    },
    orderBy: { searchRank: 'asc' },
  })

  // Group by position for position rankings
  const byPosition = players.reduce<Record<string, typeof players>>((acc, p) => {
    const pos = p.position
    if (!acc[pos]) acc[pos] = []
    acc[pos]!.push(p)
    return acc
  }, {})

  const rankingData = players
    .filter((p) => p.searchRank !== null)
    .map((p) => {
      const posPlayers = byPosition[p.position] ?? []
      const rankPosition = posPlayers.findIndex((pp) => pp.sleeperId === p.sleeperId) + 1
      return {
        playerId: p.sleeperId,
        source: 'fantasypros' as const,
        rankOverall: p.searchRank!,
        rankPosition,
        week,
        season,
        fetchedAt: new Date(),
      }
    })

  // Upsert rankings for this week
  await Promise.all(
    rankingData.map((r) =>
      db.playerRanking.upsert({
        where: {
          playerId_source_week_season: {
            playerId: r.playerId,
            source: r.source,
            week: r.week,
            season: r.season,
          },
        },
        create: r,
        update: { rankOverall: r.rankOverall, rankPosition: r.rankPosition, fetchedAt: r.fetchedAt },
      }),
    ),
  )

  console.log(`[ingestion] Rankings refresh: ${rankingData.length} players ranked for week ${week}`)
}

// ─── ContentRefreshJob ────────────────────────────────────────────────────────
// Scheduled: fetch all active RSS sources from DB and ingest new articles

async function runContentRefresh(): Promise<void> {
  const result = await RSSConnector.run()
  if (result.errors.length > 0) {
    console.warn(
      `[ingestion] Content refresh completed with ${result.errors.length} error(s):`,
      result.errors,
    )
  }
  console.log(
    `[ingestion] Content refresh: ${result.inserted} new items from ${result.sources} sources`,
  )
}
