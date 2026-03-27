import { IngestionJobTypes, INGESTION_JOB_TYPE_VALUES, type IngestionJobType } from './types/agent.js'

/**
 * Single source of truth for ingestion jobs: Admin catalog + worker BullMQ repeat jobs.
 * Every `IngestionJobType` must appear exactly once. Cron is omitted for on-demand-only jobs.
 */
export interface IngestionJobRegistryEntry {
  type: IngestionJobType
  label: string
  desc: string
  /** Human-readable schedule for operators */
  schedule: string
  /** When set, worker registers `upsertJobScheduler` on startup */
  cron?: {
    schedulerId: string
    pattern: string
    queueJobName: string
  }
}

export const INGESTION_JOB_REGISTRY: readonly IngestionJobRegistryEntry[] = [
  {
    type: IngestionJobTypes.PLAYER_REFRESH,
    label: 'Player refresh',
    desc: 'Sync NFL players from Sleeper (searchRank, metadata, aliases)',
    schedule: 'Daily 6am ET',
    cron: {
      schedulerId: 'player-refresh-daily',
      pattern: '0 11 * * *',
      queueJobName: 'player-refresh',
    },
  },
  {
    type: IngestionJobTypes.INJURY_REFRESH,
    label: 'Injury refresh',
    desc: 'Lightweight injury status from Sleeper',
    schedule: 'Every 30 min',
    cron: { schedulerId: 'injury-refresh-30min', pattern: '*/30 * * * *', queueJobName: 'injury-refresh' },
  },
  {
    type: IngestionJobTypes.TRENDING_REFRESH,
    label: 'Trending refresh',
    desc: 'Sleeper add/drop trending → TrendingPlayer',
    schedule: 'Hourly',
    cron: { schedulerId: 'trending-refresh-hourly', pattern: '0 * * * *', queueJobName: 'trending-refresh' },
  },
  {
    type: IngestionJobTypes.RANKINGS_REFRESH,
    label: 'Rankings refresh (legacy)',
    desc: 'Delegates to FantasyPros ECR path',
    schedule: 'Weekly Tue 9am ET',
    cron: { schedulerId: 'rankings-refresh-weekly', pattern: '0 14 * * 2', queueJobName: 'rankings-refresh' },
  },
  {
    type: IngestionJobTypes.CONTENT_REFRESH,
    label: 'Content refresh',
    desc: 'All active RSS feeds (incl. Reddit/Nitter URLs in ContentSource)',
    schedule: 'Every 30 min',
    cron: { schedulerId: 'content-refresh-30min', pattern: '*/30 * * * *', queueJobName: 'content-refresh' },
  },
  {
    type: IngestionJobTypes.CREDITS_REFILL,
    label: 'Credits refill',
    desc: 'Reset paid users monthly run credits',
    schedule: '1st of month 5am UTC',
    cron: { schedulerId: 'credits-refill-monthly', pattern: '0 5 1 * *', queueJobName: 'credits-refill' },
  },
  {
    type: IngestionJobTypes.YOUTUBE_REFRESH,
    label: 'YouTube refresh',
    desc: 'Active YouTube ContentSource channels',
    schedule: 'Every 2h',
    cron: { schedulerId: 'youtube-refresh-2h', pattern: '0 */2 * * *', queueJobName: 'youtube-refresh' },
  },
  {
    type: IngestionJobTypes.TRADE_REFRESH,
    label: 'Trade refresh',
    desc: 'Sleeper transactions for stored leagues → TradeTransaction',
    schedule: 'Daily 8am ET',
    cron: { schedulerId: 'trade-refresh-daily', pattern: '0 13 * * *', queueJobName: 'trade-refresh' },
  },
  {
    type: IngestionJobTypes.TRADE_VALUES_REFRESH,
    label: 'Trade values (FantasyCalc)',
    desc: 'PlayerTradeValue source=fantasycalc',
    schedule: 'Weekly Tue 10am ET',
    cron: { schedulerId: 'trade-values-refresh-weekly', pattern: '0 15 * * 2', queueJobName: 'trade-values-refresh' },
  },
  {
    type: IngestionJobTypes.ADP_REFRESH,
    label: 'ADP refresh (FFC)',
    desc: 'PlayerRanking ffc_adp_*',
    schedule: 'Weekly Tue 10:30am ET',
    cron: { schedulerId: 'adp-refresh-weekly', pattern: '30 15 * * 2', queueJobName: 'adp-refresh' },
  },
  {
    type: IngestionJobTypes.DYNASTY_DADDY_REFRESH,
    label: 'Dynasty Daddy refresh',
    desc: 'KTC + DD trade values and volume',
    schedule: 'Weekly Tue 11am ET',
    cron: {
      schedulerId: 'dynasty-daddy-refresh-weekly',
      pattern: '0 16 * * 2',
      queueJobName: 'dynasty-daddy-refresh',
    },
  },
  {
    type: IngestionJobTypes.SEASON_STATS_REFRESH,
    label: 'Season stats refresh',
    desc: 'Sleeper season stats → PlayerSeasonStats (multi-season; heavy)',
    schedule: 'Manual only',
  },
  {
    type: IngestionJobTypes.FP_PLAYER_ID_SYNC,
    label: 'FP player ID sync',
    desc: 'FantasyPros / ESPN / Yahoo / CBS external IDs',
    schedule: 'Weekly Tue 10am UTC',
    cron: { schedulerId: 'fp-player-id-sync-weekly', pattern: '0 10 * * 2', queueJobName: 'fp-player-id-sync' },
  },
  {
    type: IngestionJobTypes.FP_RANKINGS_REFRESH,
    label: 'FP rankings (ECR)',
    desc: 'PlayerRanking fantasypros + tier/ownership',
    schedule: 'Tue & Fri 9am ET',
    cron: { schedulerId: 'fp-rankings-refresh', pattern: '0 14 * * 2,5', queueJobName: 'fp-rankings-refresh' },
  },
  {
    type: IngestionJobTypes.FP_PROJECTIONS_REFRESH,
    label: 'FP projections',
    desc: 'PlayerProjection weekly + ROS',
    schedule: 'Tue & Fri 10am ET',
    cron: { schedulerId: 'fp-projections-refresh', pattern: '0 15 * * 2,5', queueJobName: 'fp-projections-refresh' },
  },
  {
    type: IngestionJobTypes.FP_NEWS_REFRESH,
    label: 'FP news',
    desc: 'FantasyPros NFL news → ContentItem',
    schedule: 'Every 6h',
    cron: { schedulerId: 'fp-news-refresh-6h', pattern: '0 */6 * * *', queueJobName: 'fp-news-refresh' },
  },
  {
    type: IngestionJobTypes.FP_INJURIES_REFRESH,
    label: 'FP injuries',
    desc: 'Player.probabilityOfPlaying',
    schedule: 'Every 12h',
    cron: { schedulerId: 'fp-injuries-refresh-12h', pattern: '0 */12 * * *', queueJobName: 'fp-injuries-refresh' },
  },
  {
    type: IngestionJobTypes.ESPN_NEWS_REFRESH,
    label: 'ESPN news',
    desc: 'ESPN articles → ContentItem',
    schedule: 'Every 6h',
    cron: { schedulerId: 'espn-news-refresh-6h', pattern: '30 */6 * * *', queueJobName: 'espn-news-refresh' },
  },
  {
    type: IngestionJobTypes.ESPN_DEFENSE_REFRESH,
    label: 'ESPN defense',
    desc: 'NFLTeamDefense vs position',
    schedule: 'Weekly Tue 5pm UTC',
    cron: { schedulerId: 'espn-defense-refresh-weekly', pattern: '0 17 * * 2', queueJobName: 'espn-defense-refresh' },
  },
  {
    type: IngestionJobTypes.ESPN_RANKINGS_REFRESH,
    label: 'ESPN fantasy rankings',
    desc: 'PlayerRanking source=espn (needs ESPN_FANTASY_COOKIE)',
    schedule: 'Tue & Fri 2:30pm UTC',
    cron: { schedulerId: 'espn-rankings-refresh', pattern: '30 14 * * 2,5', queueJobName: 'espn-rankings-refresh' },
  },
  {
    type: IngestionJobTypes.ODDS_REFRESH,
    label: 'Odds refresh',
    desc: 'PlayerPropLine from Odds API',
    schedule: 'Wed 8pm UTC + Sat 4pm UTC',
    cron: { schedulerId: 'odds-refresh-wed-sat', pattern: '0 20 * * 3,6', queueJobName: 'odds-refresh' },
  },
  {
    type: IngestionJobTypes.YAHOO_RANKINGS_REFRESH,
    label: 'Yahoo fantasy rankings',
    desc: 'PlayerRanking source=yahoo (OAuth env trio)',
    schedule: 'Tue & Fri 2:45pm UTC',
    cron: { schedulerId: 'yahoo-rankings-refresh', pattern: '45 14 * * 2,5', queueJobName: 'yahoo-rankings-refresh' },
  },
  {
    type: IngestionJobTypes.REDDIT_REFRESH,
    label: 'Reddit refresh',
    desc: 'Subreddit RSS for active reddit ContentSources',
    schedule: 'Every 2h',
    cron: { schedulerId: 'reddit-refresh-2h', pattern: '30 */2 * * *', queueJobName: 'reddit-refresh' },
  },
  {
    type: IngestionJobTypes.REDDIT_BACKFILL,
    label: 'Reddit backfill (~14d)',
    desc: 'Paginate new.json per subreddit; idempotent by URL',
    schedule: 'On demand',
  },
  {
    type: IngestionJobTypes.TWITTER_INGESTION_REFRESH,
    label: 'Twitter ingestion refresh',
    desc: 'TweetMonitorRule scrape path (not Nitter RSS)',
    schedule: 'Every 6h',
    cron: { schedulerId: 'twitter-ingestion-6h', pattern: '0 */6 * * *', queueJobName: 'twitter-ingestion' },
  },
  {
    type: IngestionJobTypes.REDDIT_SEED,
    label: 'Reddit seed',
    desc: 'Register default subreddits as ContentSource rows',
    schedule: 'On demand',
  },
  {
    type: IngestionJobTypes.TWITTER_SEED,
    label: 'Twitter seed',
    desc: 'Register default handles as ContentSource rows',
    schedule: 'On demand',
  },
  {
    type: IngestionJobTypes.CONTEXT_REVISION,
    label: 'Context revision',
    desc: 'Learning proposals from accumulated signals',
    schedule: 'Nightly 3am UTC',
    cron: { schedulerId: 'context-revision-nightly', pattern: '0 3 * * *', queueJobName: 'context-revision' },
  },
]

/** Jobs that register a BullMQ repeat scheduler */
export const INGESTION_SCHEDULED_JOB_ENTRIES = INGESTION_JOB_REGISTRY.filter(
  (e): e is IngestionJobRegistryEntry & { cron: NonNullable<IngestionJobRegistryEntry['cron']> } =>
    e.cron != null,
)

export interface IngestionJobCatalogEntry {
  type: IngestionJobType
  label: string
  desc: string
  schedule: string
}

/** Derived catalog for Admin — must stay in sync via shared registry only */
export const INGESTION_JOB_CATALOG: readonly IngestionJobCatalogEntry[] = INGESTION_JOB_REGISTRY.map(
  ({ type, label, desc, schedule }) => ({ type, label, desc, schedule }),
)

/**
 * Throws if registry does not cover exactly all ingestion job types.
 * Call from worker startup (and optionally tests / CI).
 */
export function assertIngestionRegistryComplete(): void {
  const expected = new Set(INGESTION_JOB_TYPE_VALUES)
  const seen = new Set<IngestionJobType>()
  for (const row of INGESTION_JOB_REGISTRY) {
    if (seen.has(row.type)) {
      throw new Error(`[ingestion-registry] Duplicate registry entry for type: ${row.type}`)
    }
    seen.add(row.type)
  }
  const missing = INGESTION_JOB_TYPE_VALUES.filter((t) => !seen.has(t))
  if (missing.length > 0) {
    throw new Error(`[ingestion-registry] Missing registry entries for: ${missing.join(', ')}`)
  }
}
