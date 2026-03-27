# Data

> Last updated: 2026-03-26
> Schema section auto-regenerated from `packages/db/prisma/schema.prisma` via `pnpm sync:docs`

## Data Strategy

Agents query **our DB**, not external APIs at run time (except for the user's live Sleeper roster). This makes agents fast, reliable, and cost-free to scale.

### Tier 0 (hard data) vs `ContentSource.tier` (1–3)

Do **not** confuse these:

- **Tier 0** — Structured ground-truth tables agents and Directory should trust: `Player`, `PlayerRanking`, `PlayerProjection`, `PlayerTradeValue`, `TrendingPlayer`, `TradeTransaction`, `PlayerSeasonStats`, props, defense rows, etc. Canonical allowlists live in `packages/shared/src/tier0-data.ts` (`TIER_ZERO_*` constants).
- **`ContentSource.tier` (integer 1–3)** — Editorial quality for **news/video/social** injection via `injectContent` only. Editable in Admin Source Manager and `POST/PUT /internal/sources`. Unrelated to tier 0.

### Two data modes

| Mode | What | Source | When |
|------|------|--------|------|
| **Live** | User's current roster | Sleeper API | Per agent run (~50ms) |
| **Live** | League settings | Sleeper API | Per agent run (cached in memory) |
| **Cached** | All NFL players (injury, depth chart, position, team) | Sleeper `/players/nfl` | Daily refresh |
| **Cached** | Trending adds/drops | Sleeper trending | Hourly refresh |
| **Cached** | Consensus rankings | FantasyPros + FFC ADP + optional ESPN/Yahoo | Scheduled refresh |

---

## Database Schema

### `User`
Stores application-level user data. Auth source of truth is Clerk — we sync via webhook.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | Primary key |
| clerkId | String | Unique. Links to Clerk user. Created on `user.created` webhook |
| email | String | Unique |
| tier | Enum | `free` \| `paid` |
| role | Enum | `user` \| `admin` |
| runCredits | Int | Starts at 2 (free). 50/mo for paid |
| stripeCustomerId | String? | Set on first Stripe checkout |
| stripeSubscriptionId | String? | Set on active subscription |
| stripeSubscriptionStatus | String? | Mirrors Stripe: `active \| past_due \| canceled \| trialing` |
| createdAt | DateTime | |

### `SleeperProfile`
Stores the user's linked Sleeper account and league snapshot.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| userId | String | FK → User |
| sleeperId | String | Sleeper user_id |
| displayName | String | Sleeper display name |
| leagues | Json | Snapshot of user's leagues array |
| updatedAt | DateTime | |

### `UserPreferences`
Per-user agent customization. Injected into every agent run as system context.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| userId | String | Unique FK → User (1:1) |
| leagueStyle | Enum | `redraft` \| `keeper` \| `dynasty` |
| scoringPriority | Enum | `ppr` \| `half_ppr` \| `standard` |
| playStyle | Enum | `safe_floor` \| `balanced` \| `boom_bust` |
| reportFormat | Enum | `detailed` \| `concise` |
| priorityPositions | String[] | e.g. `["RB", "WR"]` |
| customInstructions | String? | Free-text prompt additions |
| notifyOnInjury | Boolean | Default false |
| notifyOnTrending | Boolean | Default false |
| updatedAt | DateTime | |

### `AgentRun`
Record of every agent execution.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| userId | String | FK → User |
| agentType | String | e.g. `team_eval`, `waiver`, `lineup` |
| status | Enum | `queued` \| `running` \| `done` \| `failed` |
| inputJson | Json | Typed agent input |
| outputJson | Json? | Typed agent output (null until done) |
| tokensUsed | Int? | Total tokens consumed |
| durationMs | Int? | Wall-clock execution time |
| rating | Enum? | `up` \| `down` — user feedback |
| errorMessage | String? | Set on failure |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### `TokenBudget`
Monthly token usage tracking per user.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| userId | String | FK → User |
| periodStart | DateTime | Start of billing period |
| tokensUsed | Int | Cumulative tokens this period |
| runsUsed | Int | Cumulative runs this period |

### `Player`
Cached NFL player data from Sleeper. Refreshed daily.

| Field | Type | Notes |
|-------|------|-------|
| sleeperId | String | Primary key (Sleeper player_id) |
| firstName | String | |
| lastName | String | |
| position | String | QB, RB, WR, TE, K, DEF |
| team | String? | NFL team abbreviation |
| status | String | Active, Injured Reserve, PUP, etc. |
| injuryStatus | String? | Questionable, Doubtful, Out, IR |
| practiceParticipation | String? | Full, Limited, Did Not Practice |
| depthChartPosition | String? | e.g. "QB1" |
| depthChartOrder | Int? | 1 = starter, 2 = backup |
| searchRank | Int? | Sleeper's built-in rough ranking |
| age | Int? | |
| yearsExp | Int? | Years of NFL experience |
| metadata | Json | Full raw Sleeper player object |
| lastRefreshedAt | DateTime | |
| aliases | PlayerAlias[] | Name variants for entity resolution |
| contentMentions | ContentPlayerMention[] | Content items that mention this player |

### `PlayerRanking`
Expert consensus, ADP, and platform ranks. Refreshed on worker schedule.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| playerId | String | FK → Player (sleeperId) |
| source | String | `fantasypros` (ECR); `ffc_adp_ppr` / `ffc_adp_half_ppr` / `ffc_adp_standard` (ADP in `rankOverall`); `espn` / `yahoo` when those jobs run. Sleeper waiver trending is `TrendingPlayer`, not this table. |
| rankOverall | Int | Overall rank (or ADP for FFC sources) |
| rankPosition | Int | Rank within position (FFC ADP rows often use `0`) |
| week | Int | NFL week number |
| season | Int | NFL season year |
| fetchedAt | DateTime | |

### `TrendingPlayer`
Waiver wire trending data from Sleeper. Refreshed hourly.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| playerId | String | FK → Player |
| type | Enum | `add` \| `drop` |
| count | Int | Number of adds/drops in lookback window |
| lookbackHours | Int | Window size (default 24) |
| fetchedAt | DateTime | |

### `AnalyticsEvent`
Flexible event store for behavioral analytics and system telemetry. No schema migration needed for new event types.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| userId | String? | Nullable — some events are system-level |
| eventType | String | Typed string (see catalog below) |
| payload | Json | Event-specific data |
| createdAt | DateTime | |

### `ContentSource`
Registry of all content ingestion sources. Each entry drives a scheduled fetch job.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| name | String | Human-readable name e.g. "The Fantasy Footballers" |
| platform | Enum | `rss` \| `youtube` \| `twitter` \| `podcast` \| `reddit` \| `api` \| `manual` |
| feedUrl | String | RSS URL, YouTube channel URL, Nitter RSS for X handles, podcast feed, etc. |
| avatarUrl | String? | Source logo for directory UI |
| platformConfig | Json | Platform-specific config (channel ID, selectors, etc.) |
| tier | Int | 1–3 — editorial quality for `injectContent` only (**not** tier 0 hard data) |
| featured | Boolean | Partner carousel / highlights |
| partnerTier | String? | Ordering among featured sources |
| refreshIntervalMins | Int | Poll interval in minutes (default 60) |
| lastFetchedAt | DateTime? | |
| isActive | Boolean | Default true |

### `ContentItem`
Unified content record. All platforms (RSS articles, YouTube videos, tweets, podcast episodes) normalize to this shape.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| sourceId | String? | FK → ContentSource |
| contentType | Enum | `article` \| `video` \| `social_post` \| `podcast_episode` \| `vlog` \| `stat_update` |
| sourceUrl | String | Canonical URL — deduplication key |
| title | String | |
| summary | String? | AI-generated or extracted 2-3 sentence summary |
| rawContent | String | Full text or video transcript — stored for search + future embedding |
| thumbnailUrl | String? | For video/social content |
| authorName | String? | |
| publishedAt | DateTime? | |
| mediaMeta | Json | Platform-specific metadata (video duration, tweet counts, etc.) |
| topics | String[] | e.g. `["injury", "waiver", "breakout", "matchup"]` |
| importanceScore | Float? | 0–1 importance |
| noveltyScore | Float? | 0–1 novelty vs known info |
| sentimentScore | Float? | -1 to 1 sentiment |
| searchVector | tsvector? | Auto-updated by DB trigger — powers full-text search |
| embedding | vector(1536)? | pgvector embedding — schema-ready, unfilled until post-MVP |
| parentId | String? | For chunked content: FK → parent ContentItem |
| fetchedAt | DateTime | |

### `ContentPlayerMention`
Join table linking content to players, populated during ingestion via entity resolution.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| contentId | String | FK → ContentItem |
| playerId | String | FK → Player (sleeperId) |
| context | String | `injury_update` \| `trade_rumor` \| `start_recommendation` \| `breakout_candidate` \| `depth_chart_change` \| `waiver_wire` \| `general` |
| sentiment | Float? | -1 to 1 sentiment for this player in this item |
| snippet | String? | ~1-2 sentence excerpt mentioning the player |

### `PlayerAlias`
All known name variants for a player. Used during content ingestion to resolve "Mahomes" → player ID 4046.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| playerId | String | FK → Player |
| alias | String | e.g. "Mahomes", "Patrick Mahomes", "P. Mahomes" |
| aliasType | Enum | `full_name` \| `last_name` \| `first_last_initial` \| `nickname` \| `social_handle` \| `abbreviation` \| `custom` |

### `PlayerProjection`
Weekly fantasy point projections per player per source.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| playerId | String | FK → Player |
| source | String | Primarily `fantasypros` today. Any value written by a worker is tier 0; avoid documenting hypothetical writers unless implemented. |
| week / season | Int | NFL week and season year |
| passYds, rushYds, recYds, etc. | Float? | Stat-line projections |
| fpts | Float | Total projected fantasy points |
| fetchedAt | DateTime | |

### `NFLTeamDefense`
Defensive rankings vs each position. Used for matchup quality assessment.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| team | String | NFL team abbreviation e.g. "KC" |
| season / week | Int | |
| ptsAllowedQB/RB/WR/TE | Float? | Avg fantasy points allowed to that position |
| rankVsQB/RB/WR/TE | Int? | 1–32 rank (1 = toughest, 32 = easiest matchup) |
| fetchedAt | DateTime | |

---

## Analytics Event Catalog

All events are tracked via `db.track(eventType, userId?, payload)`.

### User Events

| Event type | Payload | When |
|------------|---------|------|
| `user.signup` | `{ email, tier: "free" }` | Clerk webhook fires, user row created |
| `user.upgrade.prompted` | `{ triggeredBy: "credit_exhaustion" }` | User hits 0 credits |
| `user.upgraded` | `{ fromTier, toTier }` | Stripe webhook: subscription created |

### Agent Events

| Event type | Payload | When |
|------------|---------|------|
| `agent.run.started` | `{ agentType, userTier, leagueId }` | Job picked up by worker |
| `agent.run.completed` | `{ agentType, tokensUsed, durationMs, grade }` | Agent returns successfully |
| `agent.run.failed` | `{ agentType, errorType, errorMessage }` | Agent throws or schema parse fails |
| `agent.result.rated` | `{ agentRunId, rating: "up" \| "down" }` | User submits thumbs up/down |

### Feature Events

| Event type | Payload | When |
|------------|---------|------|
| `feature.used` | `{ featureName, context }` | Any significant feature interaction |

---

## ContentItem mediaMeta Format

The `mediaMeta` JSON field stores platform-specific metadata that doesn't fit the normalized columns.

**Video (YouTube/Vlog)**:
```json
{ "duration": 2340, "viewCount": 18500, "likeCount": 412, "channelId": "UC..." }
```

**Podcast episode**:
```json
{ "duration": 3600, "episodeNumber": 42, "showName": "Fantasy Footballers", "enclosureUrl": "..." }
```

**Social post (Twitter/X)**:
```json
{ "likeCount": 1200, "retweetCount": 340, "replyCount": 88, "tweetId": "17..." }
```

## Search Architecture

### Full-Text Search (active)
- `content_items."searchVector"` column of type `tsvector`
- Auto-updated by Postgres trigger on INSERT/UPDATE of `title`, `summary`, `rawContent`, `authorName`
- Weighted: title=A, summary=B, rawContent=C, authorName=D
- GIN index: `content_items_search_vector_idx`
- Query pattern: `WHERE "searchVector" @@ plainto_tsquery('english', $1)`

### Vector Search (schema-ready, post-MVP)
- `content_items."embedding"` column of type `vector(1536)`
- Will use OpenAI `text-embedding-3-small` (1536 dims, $0.02/1M tokens)
- HNSW index: `content_items_embedding_hnsw_idx` (cosine similarity)
- Query pattern: `ORDER BY embedding <=> $embedding LIMIT 20`
- Embedding generation deferred — column is nullable, index only applies to non-NULL rows

---

## Storage Estimates

| Table | Size estimate | Notes |
|-------|--------------|-------|
| `Player` | < 1 MB | ~3,000 records, updated in-place daily |
| `TrendingPlayer` | ~50 MB/year | 50 records × 24/day × 365 days |
| `PlayerRanking` | Negligible | ~500 records × 17 weeks/season |
| `AgentRun` | ~1 MB/1000 runs | Grows with usage |
| `AnalyticsEvent` | ~5 MB/10K events | Grows with usage |
| `ContentItem` | ~500 MB/year | Phase 2: depends on sources (text storage) |
| `PlayerTradeValue` | < 5 MB | ~1,500 players × 5 sources (ktc/fantasycalc/dynastydaddy/dynastyprocess/dynastysuperflex), updated weekly |
| `PlayerTradeVolume` | < 1 MB | ~1,500 players × 7 fields, updated weekly from Dynasty Daddy /trade/volume |
| `TradeTransaction` | ~10 MB/season | Grows with user league count; includes leagueType/teamCount/isSuperflex/scoringFormat metadata |

Render Postgres Starter (1 GB) handles all Phase 1 + Phase 2 content comfortably.
