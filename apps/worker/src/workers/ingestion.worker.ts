import { Worker } from 'bullmq'
import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import { RSSConnector } from '@rzf/connectors/rss'
import { inferContentTopics } from '@rzf/connectors/topics'
import { YouTubeConnector } from '@rzf/connectors/youtube'
import { FantasyCalcConnector } from '@rzf/connectors/fantasycalc'
import { FFCConnector } from '@rzf/connectors/ffc'
import { DynastyDaddyConnector } from '@rzf/connectors/dynastydaddy'
import { FantasyProsConnector } from '@rzf/connectors/fantasypros'
import { ESPNConnector } from '@rzf/connectors/espn'
import { OddsConnector } from '@rzf/connectors/odds'
import { RedditConnector } from '@rzf/connectors/reddit'
import { seedNitterSources } from '@rzf/connectors/twitter'
import { IngestionJobTypes, generateAliases } from '@rzf/shared'
import type { IngestionJobType } from '@rzf/shared/types'
import { getRedisConnection } from '../redis.js'
import { QUEUE_NAMES } from '../queues.js'

/** Warn after this many consecutive Reddit runs with zero inserts (sources > 0). */
let redditZeroInsertStreak = 0

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
        case IngestionJobTypes.INJURY_REFRESH:
          await runInjuryRefresh()
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
        case IngestionJobTypes.SEASON_STATS_REFRESH:
          await runSeasonStatsRefresh()
          break
        case IngestionJobTypes.FP_PLAYER_ID_SYNC:
          await runFPPlayerIdSync()
          break
        case IngestionJobTypes.FP_RANKINGS_REFRESH:
          await runFPRankingsRefresh()
          break
        case IngestionJobTypes.FP_PROJECTIONS_REFRESH:
          await runFPProjectionsRefresh()
          break
        case IngestionJobTypes.FP_NEWS_REFRESH:
          await runFPNewsRefresh()
          break
        case IngestionJobTypes.FP_INJURIES_REFRESH:
          await runFPInjuriesRefresh()
          break
        case IngestionJobTypes.ESPN_NEWS_REFRESH:
          await runESPNNewsRefresh()
          break
        case IngestionJobTypes.ESPN_DEFENSE_REFRESH:
          await runESPNDefenseRefresh()
          break
        case IngestionJobTypes.ODDS_REFRESH:
          await runOddsRefresh()
          break
        case IngestionJobTypes.TWITTER_INGESTION_REFRESH:
          await runTwitterIngestionRefresh()
          break
        case IngestionJobTypes.REDDIT_REFRESH:
          await runRedditRefresh()
          break
        case IngestionJobTypes.REDDIT_SEED:
          await runRedditSeed()
          break
        case IngestionJobTypes.TWITTER_SEED:
          await runTwitterSeed()
          break
        case IngestionJobTypes.CONTEXT_REVISION:
          await runContextRevision()
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

        const playerMeta = JSON.parse(JSON.stringify(p))
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
            metadata: playerMeta,
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
            metadata: playerMeta,
            lastRefreshedAt: new Date(),
          },
        })

        // Seed the SportRadar external ID from Sleeper's sportsdata_id field.
        // This is the universal bridge used by FP, ESPN, Yahoo, CBS, etc.
        const sportsdataId = (p as unknown as Record<string, unknown>).sportsdata_id as string | undefined
        if (sportsdataId && firstName && lastName) {
          await db.playerExternalId.upsert({
            where: { sleeperId_source: { sleeperId: p.player_id, source: 'sportradar' } },
            create: { sleeperId: p.player_id, source: 'sportradar', externalId: sportsdataId, lastVerifiedAt: new Date() },
            update: { externalId: sportsdataId, lastVerifiedAt: new Date() },
          }).catch(() => { /* skip on unique constraint race */ })
        }

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

// ─── InjuryRefreshJob ─────────────────────────────────────────────────────────
// Every 30 min during season: sync injury_status, practice_participation, and
// injury notes for all known players. Lighter than full PLAYER_REFRESH since it
// only updates the injury-related fields.

async function runInjuryRefresh(): Promise<void> {
  console.log('[ingestion] Running injury status refresh from Sleeper...')
  const players = await SleeperConnector.getAllPlayers()
  const entries = Object.values(players).filter(
    (p) => p.position && OFFENSIVE_POSITIONS.has(p.position),
  )

  let updated = 0
  const BATCH_SIZE = 500
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (p) => {
        if (!p.player_id) return
        try {
          await db.player.updateMany({
            where: { sleeperId: p.player_id },
            data: {
              status: p.status ?? 'Unknown',
              injuryStatus: p.injury_status ?? null,
              practiceParticipation: p.practice_participation ?? null,
              team: p.team ?? null,
              lastRefreshedAt: new Date(),
            },
          })
          updated++
        } catch { /* skip unknown players */ }
      }),
    )
  }

  console.log(`[ingestion] Injury refresh complete: ${updated} players updated`)
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
// Weekly: delegates to the FantasyPros rankings sync (Phase 2 — live API).
// The previous Sleeper searchRank proxy has been superseded by FP consensus data.

async function runRankingsRefresh(): Promise<void> {
  await runFPRankingsRefresh()
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
  console.log(
    `[ingestion] YouTube refresh: ${result.inserted} new videos from ${result.sources} channels`,
  )
  if (result.errors.length > 0) {
    const formatted = result.errors.map((e) => `${e.source}: ${e.message}`).join('; ')
    const allQuota = result.errors.every((e) => e.message.includes('quota exceeded'))
    if (allQuota) {
      // Quota exhaustion is an expected daily limit — log and skip rather than failing the job
      console.warn(`[ingestion] YouTube quota exceeded — skipping until tomorrow: ${formatted}`)
      return
    }
    // Throw so BullMQ marks this job as Failed — visible in the admin queue page
    throw new Error(`YouTube refresh had ${result.errors.length} error(s): ${formatted}`)
  }
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
// Weekly: sync KTC (markets 0+4), DynastyProcess (2), DynastySuperflex (3),
// DD own values (/today) into PlayerTradeValue, plus bulk trade volume into
// PlayerTradeVolume via /trade/volume.
async function runDynastyDaddyRefresh(): Promise<void> {
  const [valuesResult, volumeResult] = await Promise.all([
    DynastyDaddyConnector.syncValues(),
    DynastyDaddyConnector.syncTradeVolume(),
  ])

  if (valuesResult.errors.length > 0) {
    console.warn(
      `[ingestion] Dynasty Daddy values had ${valuesResult.errors.length} error(s):`,
      valuesResult.errors.slice(0, 5),
    )
  }
  if (volumeResult.errors.length > 0) {
    console.warn(
      `[ingestion] Dynasty Daddy volume had ${volumeResult.errors.length} error(s):`,
      volumeResult.errors.slice(0, 5),
    )
  }

  console.log(
    `[ingestion] Dynasty Daddy refresh: KTC=${valuesResult.ktcUpserted}, DP=${valuesResult.dpUpserted}, DS=${valuesResult.dsUpserted}, DD=${valuesResult.ddUpserted}, unmatched=${valuesResult.unmatched} | volume upserted=${volumeResult.upserted}`,
  )
}

// ─── SeasonStatsRefreshJob ────────────────────────────────────────────────────
// One-time + annual: pull regular-season stats for 2020–present from Sleeper
// and upsert into PlayerSeasonStats. Enables follow-up chat to answer accurate
// historical performance questions without relying on LLM knowledge.
async function runSeasonStatsRefresh(): Promise<void> {
  const currentYear = new Date().getFullYear()
  // We consider stats finalized once the Super Bowl is over (February).
  // If it's before August, include the prior year as it may still be accumulating.
  const startYear = 2020
  const endYear = currentYear

  console.log(`[ingestion] Season stats refresh — seasons ${startYear}–${endYear}`)

  // Build a lookup of active player sleeper IDs from our DB
  const activePlayers = await db.player.findMany({
    select: { sleeperId: true },
    where: { team: { not: null } },
  })
  const activeIds = new Set(activePlayers.map((p) => p.sleeperId))

  let totalUpserted = 0
  let totalSkipped = 0

  for (let season = startYear; season <= endYear; season++) {
    try {
      console.log(`[ingestion] Fetching season stats: ${season} regular`)
      const statsMap = await SleeperConnector.getSeasonStats(season, 'regular')

      const records: Array<{
        playerId: string
        season: number
        seasonType: string
        passYds: number | null
        passTds: number | null
        passInt: number | null
        passCmp: number | null
        passAtt: number | null
        rushYds: number | null
        rushTds: number | null
        rushAtt: number | null
        recYds: number | null
        recTds: number | null
        rec: number | null
        targets: number | null
        fantasyPtsPpr: number | null
        fantasyPtsStd: number | null
        gamesPlayed: number | null
      }> = []

      for (const [sleeperId, raw] of Object.entries(statsMap)) {
        if (!activeIds.has(sleeperId)) continue
        if (!raw || typeof raw !== 'object') continue

        const fantasyPtsPpr = raw['pts_ppr'] ?? raw['fantasy_pts_ppr'] ?? null
        const fantasyPtsStd = raw['pts_std'] ?? raw['fantasy_pts_std'] ?? null

        records.push({
          playerId: sleeperId,
          season,
          seasonType: 'regular',
          passYds: raw['pass_yd'] ?? raw['pass_yds'] ?? null,
          passTds: raw['pass_td'] ?? raw['pass_tds'] ?? null,
          passInt: raw['pass_int'] ?? null,
          passCmp: raw['pass_cmp'] ?? null,
          passAtt: raw['pass_att'] ?? null,
          rushYds: raw['rush_yd'] ?? raw['rush_yds'] ?? null,
          rushTds: raw['rush_td'] ?? raw['rush_tds'] ?? null,
          rushAtt: raw['rush_att'] ?? null,
          recYds: raw['rec_yd'] ?? raw['rec_yds'] ?? null,
          recTds: raw['rec_td'] ?? raw['rec_tds'] ?? null,
          rec: raw['rec'] ?? null,
          targets: raw['rec_tgt'] ?? raw['targets'] ?? null,
          fantasyPtsPpr: typeof fantasyPtsPpr === 'number' ? fantasyPtsPpr : null,
          fantasyPtsStd: typeof fantasyPtsStd === 'number' ? fantasyPtsStd : null,
          gamesPlayed: raw['gp'] ?? raw['games_played'] ?? null,
        })
      }

      // Batch upsert using createMany with skipDuplicates for efficiency
      await db.playerSeasonStats.deleteMany({ where: { season, seasonType: 'regular' } })
      const result = await db.playerSeasonStats.createMany({
        data: records,
        skipDuplicates: true,
      })

      console.log(`[ingestion] Season ${season}: upserted ${result.count} records (of ${records.length} active players)`)
      totalUpserted += result.count
    } catch (err) {
      console.error(`[ingestion] Season ${season} stats failed:`, err)
      totalSkipped++
    }
  }

  console.log(`[ingestion] Season stats refresh complete — total upserted=${totalUpserted}, seasons failed=${totalSkipped}`)
}

// ─── FantasyPros Jobs ─────────────────────────────────────────────────────────

// FP_PLAYER_ID_SYNC — Weekly: map Sleeper players to FP IDs (and ESPN/Yahoo/CBS)
// via sportsdata_player_id bridge. Seeds PlayerExternalId for all future FP calls.
async function runFPPlayerIdSync(): Promise<void> {
  if (!process.env['FANTASYPROS_API_KEY']) {
    console.warn('[ingestion] FP_PLAYER_ID_SYNC skipped — FANTASYPROS_API_KEY not configured')
    return
  }
  const result = await FantasyProsConnector.syncPlayerIds()
  console.log(
    `[ingestion] FP player ID sync complete — synced=${result.synced} unmatched=${result.unmatched} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] FP player ID sync errors (first 5):', result.errors.slice(0, 5))
  }
}

// FP_RANKINGS_REFRESH — Tuesday + Friday: sync consensus ECR rankings with tier,
// ownership %, and per-format ranks into PlayerRanking.
async function runFPRankingsRefresh(): Promise<void> {
  if (!process.env['FANTASYPROS_API_KEY']) {
    console.warn('[ingestion] FP_RANKINGS_REFRESH skipped — FANTASYPROS_API_KEY not configured')
    return
  }
  const nflState = await SleeperConnector.getNFLState()
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const result = await FantasyProsConnector.syncRankings(week, season)
  console.log(
    `[ingestion] FP rankings refresh complete — upserted=${result.upserted} skipped=${result.skipped} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] FP rankings errors (first 5):', result.errors.slice(0, 5))
  }
}

// FP_PROJECTIONS_REFRESH — Tuesday + Friday: sync weekly + ROS projected fantasy
// points and stat lines into PlayerProjection (table was previously empty).
async function runFPProjectionsRefresh(): Promise<void> {
  if (!process.env['FANTASYPROS_API_KEY']) {
    console.warn('[ingestion] FP_PROJECTIONS_REFRESH skipped — FANTASYPROS_API_KEY not configured')
    return
  }
  const nflState = await SleeperConnector.getNFLState()
  const week = nflState.week
  const season = parseInt(nflState.season, 10)

  const result = await FantasyProsConnector.syncProjections(week, season)
  console.log(
    `[ingestion] FP projections refresh complete — upserted=${result.upserted} skipped=${result.skipped} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] FP projections errors (first 5):', result.errors.slice(0, 5))
  }
}

// FP_NEWS_REFRESH — Every 6 hours: sync latest 100 NFL news items with expert-written
// fantasy impact blurbs into ContentItem / ContentPlayerMention as Tier 1 api content.
async function runFPNewsRefresh(): Promise<void> {
  if (!process.env['FANTASYPROS_API_KEY']) {
    console.warn('[ingestion] FP_NEWS_REFRESH skipped — FANTASYPROS_API_KEY not configured')
    return
  }
  const result = await FantasyProsConnector.syncNews()
  console.log(
    `[ingestion] FP news refresh complete — inserted=${result.inserted} skipped=${result.skipped} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] FP news errors (first 5):', result.errors.slice(0, 5))
  }
}

// FP_INJURIES_REFRESH — Every 12 hours: sync injury status and numeric probability
// of playing into Player.probabilityOfPlaying for use by the Injury Watch agent.
async function runFPInjuriesRefresh(): Promise<void> {
  if (!process.env['FANTASYPROS_API_KEY']) {
    console.warn('[ingestion] FP_INJURIES_REFRESH skipped — FANTASYPROS_API_KEY not configured')
    return
  }
  const result = await FantasyProsConnector.syncInjuries()
  console.log(
    `[ingestion] FP injuries refresh complete — updated=${result.updated} skipped=${result.skipped} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] FP injuries errors (first 5):', result.errors.slice(0, 5))
  }
}

// ESPN_NEWS_REFRESH — Every 6 hours: ingest NFL news articles from ESPN's public
// API and store as ContentItem rows. Uses ESPN athlete category tags for accurate
// player tagging rather than name-based resolution.
async function runESPNNewsRefresh(): Promise<void> {
  const result = await ESPNConnector.ingestNews(50)
  console.log(
    `[ingestion] ESPN news refresh complete — inserted=${result.inserted} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] ESPN news errors (first 5):', result.errors.slice(0, 5))
  }
}

// ESPN_DEFENSE_REFRESH — Weekly (Tuesday): fetch team defense stats from ESPN
// and populate NFLTeamDefense table for lineup/waiver matchup analysis.
async function runESPNDefenseRefresh(): Promise<void> {
  const result = await ESPNConnector.ingestTeamDefense()
  console.log(
    `[ingestion] ESPN defense refresh complete — inserted=${result.inserted} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] ESPN defense errors (first 5):', result.errors.slice(0, 5))
  }
}

// ODDS_REFRESH — Wednesday + Saturday: fetch NFL player prop lines from The Odds API
// and upsert into PlayerPropLine table. Requires THE_ODDS_API_KEY env var.
async function runOddsRefresh(): Promise<void> {
  if (!process.env['THE_ODDS_API_KEY']) {
    console.warn('[ingestion] ODDS_REFRESH skipped — THE_ODDS_API_KEY not configured')
    return
  }
  const result = await OddsConnector.ingestProps()
  console.log(
    `[ingestion] Odds refresh complete — events=${result.eventsProcessed} lines=${result.linesUpserted} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] Odds errors (first 5):', result.errors.slice(0, 5))
  }
}

// TWITTER_INGESTION_REFRESH — Every 6 hours: ingest Twitter content.
// Primary path (no API key): processes Nitter RSS ContentSource rows (platform='twitter')
// via the existing RSS pipeline — same dedup, player tagging, and content storage.
// Fallback path (if X API configured): also processes any active TweetMonitorRule entries.
async function runTwitterIngestionRefresh(): Promise<void> {
  // Primary: Nitter RSS feeds (zero cost, no API key required)
  const nitterSources = await db.contentSource.count({
    where: { platform: 'twitter', isActive: true },
  })

  if (nitterSources > 0) {
    const result = await RSSConnector.run('twitter')
    console.log(
      `[ingestion] Nitter RSS complete — inserted=${result.inserted} sources=${result.sources} errors=${result.errors.length}`,
    )
    if (result.errors.length > 0) {
      console.warn('[ingestion] Nitter errors (first 3):', result.errors.slice(0, 3))
    }
  } else {
    console.log('[ingestion] Twitter/Nitter: no active sources — run TWITTER_SEED first')
  }

  // Fallback: official X API (only if authenticated TweetMonitorRule entries exist)
  const rules = await db.tweetMonitorRule.findMany({
    where: { isActive: true },
    include: { xAccount: { select: { accessToken: true, isActive: true } } },
  })
  const authenticatedRules = rules.filter((r) => r.xAccount?.isActive && r.xAccount.accessToken)
  if (authenticatedRules.length === 0) return

  console.log(`[ingestion] Processing ${authenticatedRules.length} authenticated X API rules`)
  const aliases = await db.playerAlias.findMany({
    where: { player: { status: { not: 'Inactive' } } },
    select: { alias: true, playerId: true, aliasType: true },
  })
  let twitterSource = await db.contentSource.findFirst({ where: { platform: 'twitter', name: 'Twitter/X Monitor' } })
  if (!twitterSource) {
    twitterSource = await db.contentSource.create({
      data: { name: 'Twitter/X Monitor', platform: 'twitter', feedUrl: 'https://twitter.com', tier: 2, refreshIntervalMins: 360 },
    })
  }
  const { XConnector } = await import('@rzf/connectors/twitter')
  const { resolvePlayerMentions, extractSnippet, inferMentionContext } = await import('@rzf/shared')
  let inserted = 0
  for (const rule of authenticatedRules) {
    try {
      const result = await XConnector.searchTweets(rule.xAccount!.accessToken, rule.query, 25)
      if (!result.success || !result.data) continue
      for (const tweet of result.data.tweets) {
        const url = `https://twitter.com/i/web/status/${tweet.id}`
        if (await db.contentItem.findUnique({ where: { sourceUrl: url } })) continue
        const matches = resolvePlayerMentions(tweet.text, aliases, { strictMode: true })
        const topics = inferContentTopics(tweet.text)
        const contentItem = await db.contentItem.create({
          data: {
            sourceId: twitterSource.id,
            contentType: 'social_post',
            sourceUrl: url,
            title: tweet.text.slice(0, 120),
            rawContent: tweet.text,
            authorName: tweet.authorHandle ? `@${tweet.authorHandle}` : 'Twitter',
            publishedAt: tweet.createdAt ? new Date(tweet.createdAt) : null,
            topics,
            mediaMeta: { tweetId: tweet.id, likeCount: tweet.publicMetrics?.likeCount ?? 0, retweetCount: tweet.publicMetrics?.retweetCount ?? 0, replyCount: tweet.publicMetrics?.replyCount ?? 0 },
          },
        })
        if (matches.length > 0) {
          await db.contentPlayerMention.createMany({
            data: matches.map((m) => ({ contentId: contentItem.id, playerId: m.playerId, context: inferMentionContext(extractSnippet(tweet.text, m)), snippet: extractSnippet(tweet.text, m, 140) })),
            skipDuplicates: true,
          })
        }
        inserted++
      }
      await db.tweetMonitorRule.update({ where: { id: rule.id }, data: { lastRanAt: new Date() } })
    } catch (err) {
      console.warn(`[ingestion] Twitter rule "${rule.query}": ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  console.log(`[ingestion] X API ingestion complete — inserted=${inserted} items`)
}

// REDDIT_REFRESH — Every 2 hours: process Reddit RSS sources (platform='reddit')
// using the same RSS pipeline. Reddit's public RSS feeds need no auth.
async function runRedditRefresh(): Promise<void> {
  // Reddit sources use the same RSS processing pipeline but with platform='reddit'
  const result = await RSSConnector.run('reddit')
  console.log(
    `[ingestion] Reddit refresh complete — inserted=${result.inserted} sources=${result.sources} errors=${result.errors.length}`,
  )
  if (result.errors.length > 0) {
    console.warn('[ingestion] Reddit errors (first 5):', result.errors.slice(0, 5))
  }
  if (result.sources > 0 && result.inserted === 0) {
    redditZeroInsertStreak++
    if (redditZeroInsertStreak >= 3) {
      console.warn(
        `[ingestion] Reddit: ${redditZeroInsertStreak} consecutive refresh(es) with 0 new items (check RSS URLs, rate limits, or subreddit changes)`,
      )
    }
  } else {
    redditZeroInsertStreak = 0
  }
}

// REDDIT_SEED — One-time setup: registers r/fantasyfootball, r/DynastyFF, r/FFCommish
// as ContentSource rows so the 2-hour REDDIT_REFRESH job has targets to process.
async function runRedditSeed(): Promise<void> {
  await RedditConnector.seedDefaultSources()
  console.log('[ingestion] Reddit seed complete')
}

// TWITTER_SEED — One-time setup: registers default Nitter RSS handles (beat reporters,
// fantasy analysts) as ContentSource rows. After seeding, TWITTER_INGESTION_REFRESH
// will automatically pick them up via the RSS pipeline on every 6-hour run.
async function runTwitterSeed(): Promise<void> {
  const result = await seedNitterSources()
  console.log(`[ingestion] Twitter/Nitter seed complete — seeded=${result.seeded} existing=${result.existing}`)
}

// CONTEXT_REVISION — Nightly at 3am UTC: analyze low-confidence runs and chat
// failures, generate LearningProposal rows for admin review.
async function runContextRevision(): Promise<void> {
  const { runContextRevisionJob } = await import('@rzf/agents/context-revision')
  await runContextRevisionJob()
}
