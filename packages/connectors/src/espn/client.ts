/**
 * ESPN NFL Connector
 *
 * Uses ESPN's unofficial public API (no auth required).
 * Ingests:
 *   1. NFL news → ContentItem + ContentPlayerMention (player-tagged via ESPN categories)
 *   2. Team defense stats → NFLTeamDefense table
 *
 * Rate limits: ESPN has no documented rate limits for public endpoints.
 * We stay conservative: 1 req/sec, fetch only what changed since last run.
 */

import { db } from '@rzf/db'
import { resolvePlayerMentions, extractSnippet, inferMentionContext } from '@rzf/shared'

const ESPN_SITE_API = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl'
const ESPN_CORE_API = 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function espnFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RZF-Bot/1.0)' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`ESPN API error ${res.status}: ${url}`)
  return res.json() as Promise<T>
}

// ─── ESPN News Types ──────────────────────────────────────────────────────────

interface ESPNArticle {
  id: string
  type: string
  headline: string
  description?: string
  published?: string
  lastModified?: string
  images?: Array<{ url: string; type?: string }>
  links?: { web?: { href: string } }
  categories?: Array<{
    type: string
    description?: string
    athlete?: { id: string; description?: string; displayName?: string }
    team?: { id: string; description?: string }
  }>
}

interface ESPNNewsResponse {
  articles?: ESPNArticle[]
  feed?: ESPNArticle[]
}

// ─── ESPN Scoreboard Types ────────────────────────────────────────────────────

interface ESPNScoreboardEvent {
  id: string
  season: { year: number; type: number }
  week: { number: number }
  competitions?: Array<{
    competitors?: Array<{
      id: string
      team: { id: string; abbreviation: string }
      score?: string
    }>
  }>
}

interface ESPNScoreboardResponse {
  season?: { year: number }
  week?: { number: number }
  events?: ESPNScoreboardEvent[]
}

// ─── ESPN Stats Types ─────────────────────────────────────────────────────────

interface ESPNTeamStatsCategory {
  name: string
  displayValue?: string
  stats?: Array<{ name: string; value?: number; displayValue?: string }>
}

// ─── Helper: Normalise ESPN articles ─────────────────────────────────────────

function articleUrl(article: ESPNArticle): string | null {
  return article.links?.web?.href ?? null
}

function articleThumbnail(article: ESPNArticle): string | null {
  return article.images?.[0]?.url ?? null
}

/**
 * Extract Sleeper player IDs from ESPN article categories.
 * ESPN already tags articles with athlete IDs — we map those to our DB via
 * the "espn" entry in PlayerExternalId. Falls back to name-based resolution.
 */
async function resolveMentionsFromESPN(
  article: ESPNArticle,
  aliases: Array<{ alias: string; playerId: string; aliasType: string }>,
): Promise<string[]> {
  const playerIds = new Set<string>()

  // Primary: use ESPN athlete category tags (most accurate)
  const athleteCategories = (article.categories ?? []).filter((c) => c.type === 'athlete' && c.athlete?.id)
  if (athleteCategories.length > 0) {
    const espnIds = athleteCategories.map((c) => c.athlete!.id)
    const mappings = await db.playerExternalId.findMany({
      where: { source: 'espn', externalId: { in: espnIds } },
      select: { sleeperId: true },
    })
    for (const m of mappings) playerIds.add(m.sleeperId)
  }

  // Fallback: name resolution on headline + description
  if (playerIds.size === 0) {
    const text = `${article.headline}\n${article.description ?? ''}`
    const matches = resolvePlayerMentions(text, aliases, { strictMode: true })
    for (const m of matches) playerIds.add(m.playerId)
  }

  return Array.from(playerIds)
}

function inferTopicsFromESPN(article: ESPNArticle): string[] {
  const text = `${article.headline} ${article.description ?? ''}`.toLowerCase()
  const topics: string[] = ['espn']

  if (/injur|hurt|questionable|doubtful|out\b|placed on ir|injured reserve/.test(text)) topics.push('injury')
  if (/trade[d]?|trading|deal|acqui[re|red]/.test(text)) topics.push('trade')
  if (/waiver|stream|pickup|add\b/.test(text)) topics.push('waiver')
  if (/start|lineup|flex|sit\b|bench|must.?start/.test(text)) topics.push('lineup')
  if (/break.?out|emerge|target share|snap count|usage rate|role/.test(text)) topics.push('breakout')
  if (/depth chart|promoted|demoted|starter|resting/.test(text)) topics.push('depth_chart')

  return topics
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ESPNRunResult {
  inserted: number
  errors: string[]
}

export const ESPNConnector = {
  /**
   * Fetch NFL news from ESPN and store as ContentItem rows.
   * Uses ESPN's athlete category tags for accurate player tagging.
   */
  async ingestNews(limit = 50): Promise<ESPNRunResult> {
    const errors: string[] = []

    // Ensure ESPN exists as a ContentSource
    let source = await db.contentSource.findFirst({ where: { platform: 'api', name: 'ESPN NFL News' } })
    if (!source) {
      source = await db.contentSource.create({
        data: {
          name: 'ESPN NFL News',
          platform: 'api',
          feedUrl: `${ESPN_SITE_API}/news`,
          tier: 1,
          platformConfig: { provider: 'espn' },
          refreshIntervalMins: 60,
        },
      })
    }

    const data = await espnFetch<ESPNNewsResponse>(`${ESPN_SITE_API}/news?limit=${limit}`)
    const articles = data.articles ?? data.feed ?? []

    if (articles.length === 0) return { inserted: 0, errors }

    // Batch dedup
    const candidateUrls = articles.map(articleUrl).filter(Boolean) as string[]
    const existing = await db.contentItem.findMany({
      where: { sourceUrl: { in: candidateUrls } },
      select: { sourceUrl: true },
    })
    const existingUrls = new Set(existing.map((e) => e.sourceUrl))

    // Load aliases for fallback name resolution
    const aliases = await db.playerAlias.findMany({
      where: { player: { status: { not: 'Inactive' } } },
      select: { alias: true, playerId: true, aliasType: true },
    })

    let inserted = 0
    for (const article of articles) {
      const url = articleUrl(article)
      if (!url || existingUrls.has(url)) continue

      try {
        const rawContent = `${article.headline}\n\n${article.description ?? ''}`
        const topics = inferTopicsFromESPN(article)
        const playerIds = await resolveMentionsFromESPN(article, aliases)

        const contentItem = await db.contentItem.create({
          data: {
            sourceId: source.id,
            contentType: 'article',
            sourceUrl: url,
            title: article.headline,
            rawContent,
            authorName: 'ESPN',
            publishedAt: article.published ? new Date(article.published) : null,
            thumbnailUrl: articleThumbnail(article),
            topics,
          },
        })

        if (playerIds.length > 0) {
          const text = `${article.headline}\n\n${article.description ?? ''}`
          await db.contentPlayerMention.createMany({
            data: playerIds.map((playerId) => {
              const fakeMatch = { playerId, alias: '', startIndex: 0, endIndex: 0 }
              const snippet = extractSnippet(text, fakeMatch, 200)
              return {
                contentId: contentItem.id,
                playerId,
                context: inferMentionContext(snippet),
                snippet,
              }
            }),
            skipDuplicates: true,
          })
        }

        inserted++
        await delay(100)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (!msg.includes('Unique constraint')) errors.push(`ESPN article "${article.headline}": ${msg}`)
      }
    }

    await db.contentSource.update({
      where: { id: source.id },
      data: { lastFetchedAt: new Date() },
    })

    return { inserted, errors }
  },

  /**
   * Fetch current NFL season/week from ESPN scoreboard.
   */
  async getCurrentWeek(): Promise<{ season: number; week: number } | null> {
    try {
      const data = await espnFetch<ESPNScoreboardResponse>(`${ESPN_SITE_API}/scoreboard`)
      const season = data.season?.year ?? new Date().getFullYear()
      const week = data.week?.number ?? 1
      return { season, week }
    } catch {
      return null
    }
  },

  /**
   * Fetch and store NFL team defense stats for a given season/week.
   * Iterates all 32 NFL teams and pulls their defensive scoring stats.
   */
  async ingestTeamDefense(season?: number, week?: number): Promise<ESPNRunResult> {
    const errors: string[] = []
    let inserted = 0

    const current = await ESPNConnector.getCurrentWeek()
    const targetSeason = season ?? current?.season ?? new Date().getFullYear()
    const targetWeek = week ?? current?.week ?? 1

    // ESPN team IDs for all 32 NFL teams (stable IDs)
    const NFL_TEAM_ESPN_IDS: Record<string, string> = {
      ARI: '22', ATL: '1', BAL: '33', BUF: '2', CAR: '29', CHI: '3',
      CIN: '4', CLE: '5', DAL: '6', DEN: '7', DET: '8', GB: '9',
      HOU: '34', IND: '11', JAX: '30', KC: '12', LAC: '24', LAR: '14',
      LV: '13', MIA: '15', MIN: '16', NE: '17', NO: '18', NYG: '19',
      NYJ: '20', PHI: '21', PIT: '23', SEA: '26', SF: '25', TB: '27',
      TEN: '10', WAS: '28',
    }

    for (const [abbr, espnId] of Object.entries(NFL_TEAM_ESPN_IDS)) {
      try {
        // ESPN team statistics endpoint (type=2 = regular season)
        const url = `${ESPN_CORE_API}/seasons/${targetSeason}/types/2/teams/${espnId}/statistics`
        const data = await espnFetch<{ results?: { stats?: { categories?: ESPNTeamStatsCategory[] } } }>(url)
        const categories = data.results?.stats?.categories ?? []

        const defenseCat = categories.find((c) => c.name === 'defensive')
        if (!defenseCat?.stats) {
          await delay(50)
          continue
        }

        const getStat = (name: string) => defenseCat.stats?.find((s) => s.name === name)?.value ?? null

        // Map ESPN defense stats to our NFLTeamDefense schema
        // ESPN doesn't directly provide "pts allowed vs QB" so we store what we can
        // and leave position-specific fields null (populated by FantasyPros matchup job)
        await db.nFLTeamDefense.upsert({
          where: { team_week_season: { team: abbr, week: targetWeek, season: targetSeason } },
          create: {
            team: abbr,
            season: targetSeason,
            week: targetWeek,
            ptsAllowedQB: null,
            ptsAllowedRB: getStat('rushingYardsAllowed'),
            ptsAllowedWR: getStat('receivingYardsAllowed'),
            ptsAllowedTE: null,
            rankVsQB: null,
            rankVsRB: null,
            rankVsWR: null,
            rankVsTE: null,
          },
          update: {
            ptsAllowedRB: getStat('rushingYardsAllowed'),
            ptsAllowedWR: getStat('receivingYardsAllowed'),
          },
        })

        inserted++
        await delay(50)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`ESPN defense ${abbr}: ${msg}`)
      }
    }

    return { inserted, errors }
  },
}
