# Data

> Last updated: 2026-03-06
> Schema section auto-regenerated from `packages/db/prisma/schema.prisma` via `pnpm sync:docs`

## Data Strategy

Agents query **our DB**, not external APIs at run time (except for the user's live Sleeper roster). This makes agents fast, reliable, and cost-free to scale.

### Two data modes

| Mode | What | Source | When |
|------|------|--------|------|
| **Live** | User's current roster | Sleeper API | Per agent run (~50ms) |
| **Live** | League settings | Sleeper API | Per agent run (cached in memory) |
| **Cached** | All NFL players (injury, depth chart, position, team) | Sleeper `/players/nfl` | Daily refresh |
| **Cached** | Trending adds/drops | Sleeper trending | Hourly refresh |
| **Cached** | Consensus rankings | FantasyPros CSV | Weekly refresh |

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

### `PlayerRanking`
Consensus rankings from FantasyPros (and future sources). Refreshed weekly.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| playerId | String | FK → Player (sleeperId) |
| source | String | `fantasypros` \| `sleeper_trending` |
| rankOverall | Int | Overall rank across all positions |
| rankPosition | Int | Rank within position |
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

### `ContentItem` *(Phase 2 — schema defined now)*
Normalized content from all ingested sources.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| sourceType | String | `article` \| `youtube` \| `podcast` \| `tweet` |
| sourceUrl | String | Original URL |
| title | String | |
| publishedAt | DateTime? | |
| authorName | String? | |
| rawContent | String | Full raw content (preserved for reprocessing) |
| extractedFacts | Json | Structured extraction (see format below) |
| playerIds | String[] | Sleeper player IDs mentioned |
| teamSlugs | String[] | Team abbreviations mentioned |
| topics | String[] | e.g. `["injury", "usage_spike", "depth_chart"]` |
| importanceScore | Float? | 0–1, computed by extraction agent |
| noveltyScore | Float? | 0–1, how much changed vs yesterday |
| fetchedAt | DateTime | |

### `ContentSource` *(Phase 2)*
Registry of all ingestion sources.

| Field | Type | Notes |
|-------|------|-------|
| id | String | Primary key |
| name | String | Human-readable name |
| type | String | `rss` \| `youtube_channel` \| `podcast_feed` |
| url | String | Feed URL |
| refreshIntervalMins | Int | How often to poll |
| lastFetchedAt | DateTime? | |
| isActive | Boolean | Default true |

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

## ContentItem extractedFacts Format

```json
{
  "players_mentioned": ["4046", "1234"],
  "injury_mentioned": true,
  "sentiment": "negative",
  "event_type": "injury_update",
  "key_quote": "expected to miss 2-4 weeks",
  "source_credibility": "beat_reporter"
}
```

New source types add new JSON shapes — no migration needed.

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

Render Postgres Starter (1 GB) handles all Phase 1 + Phase 2 content comfortably.
