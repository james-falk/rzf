import { Worker } from 'bullmq'
import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { RSSConnector } from '@rzf/connectors/rss'
import { YouTubeConnector } from '@rzf/connectors/youtube'
import { FantasyCalcConnector } from '@rzf/connectors/fantasycalc'
import { FFCConnector } from '@rzf/connectors/ffc'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
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
        case IngestionJobTypes.CREDITS_REFILL:
          await runCreditsRefill()
          break
        case IngestionJobTypes.YOUTUBE_REFRESH:
          await runYouTubeRefresh()
          break
        case IngestionJobTypes.TRADE_REFRESH:
          await runTradeRefresh()
          break
        case IngestionJobTypes.TRADE_VALUES_REFRESH:
          await runTradeValuesRefresh()
          break
        case IngestionJobTypes.ADP_REFRESH:
          await runADPRefresh()
          break
        case IngestionJobTypes.DYNASTY_DADDY_REFRESH:
          await runDynastyDaddyRefresh()
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

// ─── CreditsRefillJob ─────────────────────────────────────────────────────────
// Monthly: reset all paid users back to 50 run credits
async function runCreditsRefill(): Promise<void> {
  const result = await db.user.updateMany({
    where: { tier: 'paid' },
    data: { runCredits: 50 },
  })

  console.log(`[ingestion] Credits refill complete: reset ${result.count} paid users to 50 credits`)
}

// ─── YouTubeRefreshJob ────────────────────────────────────────────────────────
// Every 2 hours: fetch latest videos from all active YouTube channels
async function runYouTubeRefresh(): Promise<void> {
  const result = await YouTubeConnector.run()
  if (result.errors.length > 0) {
    console.warn(
      `[ingestion] YouTube refresh completed with ${result.errors.length} error(s):`,
      result.errors,
    )
  }
  console.log(
    `[ingestion] YouTube refresh: ${result.inserted} new videos from ${result.sources} channels`,
  )
}

// ─── TradeRefreshJob ──────────────────────────────────────────────────────────
// Daily: fetch trade transactions for all leagues from all linked Sleeper profiles
async function runTradeRefresh(): Promise<void> {
  const nflState = await SleeperConnector.getNFLState()
  const season = nflState.season
  const currentWeek = nflState.week

  // Fetch transactions for current week and prior week to catch recent activity
  const weeksToFetch = currentWeek > 1 ? [currentWeek, currentWeek - 1] : [currentWeek]

  // Get all unique league IDs across all stored SleeperProfiles
  const profiles = await db.sleeperProfile.findMany({
    select: { leagues: true },
  })

  const leagueIds = new Set<string>()
  for (const profile of profiles) {
    const leagues = profile.leagues as Array<{ league_id: string }>
    if (Array.isArray(leagues)) {
      for (const league of leagues) {
        if (league.league_id) leagueIds.add(league.league_id)
      }
    }
  }

  if (leagueIds.size === 0) {
    console.log('[ingestion] No leagues found — skipping trade refresh')
    return
  }

  console.log(`[ingestion] Trade refresh: ${leagueIds.size} leagues, weeks ${weeksToFetch.join(',')}`)

  // Cache league metadata per leagueId to avoid redundant API calls
  const leagueMetaCache = new Map<string, {
    leagueType: 'dynasty' | 'keeper' | 'redraft'
    teamCount: number
    isSuperflex: boolean
    scoringFormat: 'ppr' | 'half_ppr' | 'standard'
  }>()

  async function fetchLeagueMeta(leagueId: string) {
    if (leagueMetaCache.has(leagueId)) return leagueMetaCache.get(leagueId)!
    try {
      const league = await SleeperConnector.getLeague(leagueId)
      const typeNum = typeof league.settings['type'] === 'number' ? league.settings['type'] as number : 0
      const leagueType = typeNum === 2 ? 'dynasty' : typeNum === 1 ? 'keeper' : 'redraft'
      const teamCount = league.total_rosters
      const isSuperflex = league.roster_positions.includes('SUPER_FLEX')
      const rec = typeof league.scoring_settings['rec'] === 'number' ? league.scoring_settings['rec'] : 0
      const scoringFormat = rec >= 1 ? 'ppr' : rec >= 0.5 ? 'half_ppr' : 'standard'
      const meta = { leagueType, teamCount, isSuperflex, scoringFormat } as const
      leagueMetaCache.set(leagueId, meta)
      return meta
    } catch {
      return null
    }
  }

  let totalUpserted = 0
  let errors = 0

  for (const leagueId of leagueIds) {
    const meta = await fetchLeagueMeta(leagueId)

    for (const week of weeksToFetch) {
      try {
        const transactions = await SleeperConnector.getTransactions(leagueId, week)
        const trades = transactions.filter((t) => t.type === 'trade' && t.status === 'complete')

        for (const trade of trades) {
          await db.tradeTransaction.upsert({
            where: { transactionId: trade.transaction_id },
            create: {
              leagueId,
              transactionId: trade.transaction_id,
              week,
              season,
              adds: trade.adds ?? {},
              drops: trade.drops ?? {},
              draftPicks: trade.draft_picks ?? [],
              waiverBudget: trade.waiver_budget ?? [],
              rosterIds: trade.roster_ids,
              createdAt: new Date(trade.created),
              ...(meta && {
                leagueType: meta.leagueType,
                teamCount: meta.teamCount,
                isSuperflex: meta.isSuperflex,
                scoringFormat: meta.scoringFormat,
              }),
            },
            update: {
              ...(meta && {
                leagueType: meta.leagueType,
                teamCount: meta.teamCount,
                isSuperflex: meta.isSuperflex,
                scoringFormat: meta.scoringFormat,
              }),
            },
          })
          totalUpserted++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.warn(`[ingestion] Trade refresh error — league ${leagueId} week ${week}: ${msg}`)
        errors++
      }
    }
  }

  console.log(`[ingestion] Trade refresh complete: ${totalUpserted} trades upserted, ${errors} errors`)
}

// ─── TradeValuesRefreshJob ────────────────────────────────────────────────────
// Weekly: fetch dynasty + redraft trade values from FantasyCalc
async function runTradeValuesRefresh(): Promise<void> {
  const result = await FantasyCalcConnector.run()
  if (result.errors.length > 0) {
    console.warn(
      `[ingestion] Trade values refresh had ${result.errors.length} error(s)`,
    )
  }
  console.log(
    `[ingestion] Trade values refresh: ${result.upserted} upserted, ${result.matched} matched, ${result.unmatched} unmatched`,
  )
}

// ─── ADPRefreshJob ────────────────────────────────────────────────────────────
// Weekly: fetch ADP data from Fantasy Football Calculator
async function runADPRefresh(): Promise<void> {
  const result = await FFCConnector.run()
  console.log(
    `[ingestion] ADP refresh: ${result.upserted} rankings upserted (week ${result.week} / ${result.year})`,
  )
}

// ─── DynastyDaddyRefreshJob ───────────────────────────────────────────────────
// Weekly: sync KTC dynasty (market=0) + KTC redraft (market=4) values and
// Dynasty Daddy's own aggregated values into PlayerTradeValue.
async function runDynastyDaddyRefresh(): Promise<void> {
  const result = await DynastyDaddyConnector.syncValues()
  if (result.errors.length > 0) {
    console.warn(
      `[ingestion] Dynasty Daddy refresh had ${result.errors.length} error(s):`,
      result.errors.slice(0, 5),
    )
  }
  console.log(
    `[ingestion] Dynasty Daddy refresh: KTC upserted=${result.ktcUpserted}, DD upserted=${result.ddUpserted}, unmatched=${result.unmatched}`,
  )
}
