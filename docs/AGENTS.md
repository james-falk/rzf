# Agents

> Last updated: 2026-03-26
> Auto-regenerated section: I/O contracts come from `packages/agents/*/types.ts` via `pnpm sync:docs`

## Agent Design Principles

1. **Pure logic** — agents are functions: typed input → typed output. No DB writes, no side effects inside agent code. Side effects happen in the worker after the agent returns.
2. **Strict schemas** — every agent has explicit Zod-validated input and output types. If the LLM returns malformed output, the schema parse throws and the job fails cleanly.
3. **User context injection** — every agent receives a `userContext` block built from `UserPreferences` via `buildUserContext()`. This personalizes output without duplicating prompt logic.
4. **Token budget** — each agent has a documented token target. Haiku is used by default; Sonnet only for complex multi-step tasks.
5. **Data from DB** — agents query our cached data (Player, PlayerRanking, TrendingPlayer), not external APIs at run time. Only the user's live roster is fetched live.

---

## Phase 1 Agents

### TeamEvalAgent

**Purpose**: Analyze a user's fantasy team in a specific league. Returns a graded breakdown of roster strengths, weaknesses, position grades, key insights, and relevant content links per player.

**Queue name**: `team-eval`

**Token budget**: < 2,500 tokens per run (Claude Haiku ~$0.001/run)

**Input schema**:
```typescript
type TeamEvalInput = {
  userId: string           // our DB User.id — sleeperUserId derived from DB automatically
  leagueId: string         // Sleeper league_id
  focusNote?: string       // optional user direction e.g. "check my RB depth"
}
```

**Output schema**:
```typescript
type TeamEvalOutput = {
  overallGrade: string                    // e.g. "B+"
  strengths: string[]                     // 2-4 bullet points
  weaknesses: string[]                    // 2-4 bullet points
  positionGrades: Record<string, string>  // { "QB": "A", "RB": "C+", ... }
  keyInsights: string[]                   // 3-5 actionable insights
  contentLinks: ContentLink[]             // relevant articles/videos per key player
  tokensUsed: number
}

type ContentLink = {
  playerId: string
  playerName: string
  title: string
  url: string
  type: 'article' | 'youtube' | 'fantasypros'
}
```

**Execution steps**:
1. Load `UserPreferences` → `buildUserContext(prefs)` → terse LLM context block
2. `SleeperConnector.getRoster(leagueId, sleeperId)` — live fetch
3. `SleeperConnector.getLeagueSettings(leagueId)` — scoring format, roster config
4. DB: enrich each player with `Player` table (injury, depth chart, search_rank)
5. DB: `PlayerRanking` for positional context (current week)
6. Build `contentLinks` from real `ContentItem` + `ContentPlayerMention` rows tied to starters
7. Single Claude Haiku call with structured JSON prompt
8. Parse + validate output against schema
9. Return `TeamEvalOutput`

**Data sources**:
- Sleeper `/league/:id/rosters` (live)
- Sleeper `/league/:id` (live)
- `Player` table (cached daily)
- `PlayerRanking` table (cached weekly)

---

## Manager / Intent Agent

Not a queued job — a synchronous API call (`POST /agents/intent`) that classifies user intent and returns required parameters.

**Input**: `{ message: string, context?: { leagueId?: string } }`

**Output**: `{ agentType, agentMeta, gatheredParams, missingParams, clarifyingQuestion, readyToRun, availableAgents }`

Routes free-text queries to the correct agent. Keyword-based classifier for now; upgrades to LLM classification when 3+ agents are live.

---

## All Implemented Agents

All 6 agents are live as of 2026-03-12. Schemas in `packages/shared/src/types/agent.ts`. Runtime config (system prompt, model tier, enabled) editable in the admin Agent Manager (`/agents/config`).

### InjuryWatchAgent
On-demand risk assessment for a user's starting lineup.
- **Status**: ✅ Live
- **Input**: `{ userId, leagueId }`
- **Output**: `{ alerts[], riskyStarters, healthyStarters, tokensUsed }`
- **Key data**: `Player.injuryStatus`, `Player.status`
- **Notes**: Deterministic/non-LLM agent — no system prompt used.

### WaiverAgent
Weekly ranked pickup/drop recommendations tailored to the user's specific roster gaps.
- **Status**: ✅ Live
- **Input**: `{ userId, leagueId, targetPosition?: string }`
- **Output**: `{ recommendations[], summary, tokensUsed }`
- **Key data**: roster (live), `TrendingPlayer`, available `Player` records

### LineupAgent (formerly StartSitAgent)
Weekly lineup optimizer with confidence scores and matchup analysis.
- **Status**: ✅ Live
- **Input**: `{ userId, leagueId, week?: number }`
- **Output**: `{ recommendedLineup[], benchedPlayers[], keyMatchups[], warnings[], tokensUsed }`
- **Key data**: starters (live), `Player.injuryStatus`, `PlayerRanking`

### TradeAnalysisAgent
Accept/reject/counter trade evaluation with a numerical value score.
- **Status**: ✅ Live (uses Claude Sonnet / GPT-4o for quality)
- **Input**: `{ userId, leagueId, giving: string[], receiving: string[] }`
- **Output**: `{ verdict, valueScore, summary, givingAnalysis[], receivingAnalysis[], keyInsights[], tokensUsed }`
- **Key data**: `PlayerTradeValue`, `PlayerRanking`, `ContentPlayerMention`, Dynasty Daddy community trades

### PlayerScoutAgent
Deep per-player evaluation on demand.
- **Status**: ✅ Live
- **Input**: `{ userId, playerId, context? }`
- **Output**: `{ trend, recentNewsSummary, summary, keyInsights[], ...player fields, tokensUsed }`
- **Key data**: `PlayerTradeValue`, `PlayerRanking`, `ContentPlayerMention`, Dynasty Daddy trade volume

### Future Agent Work
- See `docs/PLAN.md` for planned agent roadmap items and sequencing.

---

## Ingestion Jobs (not user-facing agents)

These run on a schedule in `apps/worker/src/scheduler.ts` and populate the tables agents read. **Canonical list:** `packages/shared/src/types/ingestion-catalog.ts` (`INGESTION_JOB_CATALOG`) — labels, descriptions, and **schedule vs manual-only** for Admin and operators.

**Trigger any job type** (same allowlist as the worker): `POST /internal/ingestion/trigger` with `{ "type": "<snake_case IngestionJobType>" }` and `x-admin-secret`. Examples: `reddit_backfill`, `fp_rankings_refresh`, `espn_rankings_refresh`, `yahoo_rankings_refresh`, `season_stats_refresh` (manual-only in catalog).

**Audit:** Each run is recorded in `IngestionJobRun`. Admin **Queue → Ingestion** shows BullMQ jobs plus paginated DB runs with **Retry**.

**Manual-only note:** `season_stats_refresh` has **no cron** by default (heavy Sleeper season stats pull). Run on demand when needed.

High-level examples (not exhaustive — see catalog):

| Job type (snake_case) | Typical schedule | Target |
|------------------------|------------------|--------|
| `player_refresh` | Daily | `Player`, `PlayerAlias` |
| `trending_refresh` | Hourly | `TrendingPlayer` |
| `content_refresh` | Every 30 min | `ContentItem` (RSS platforms incl. Reddit/Nitter sources) |
| `youtube_refresh` | Every 2h | `ContentItem` (YouTube sources) |
| `fp_rankings_refresh` | Tue & Fri | `PlayerRanking` (`fantasypros`) |
| `adp_refresh` | Weekly | `PlayerRanking` (`ffc_adp_*`) |
| `trade_refresh` | Daily | `TradeTransaction` |
| `reddit_backfill` | On demand | ~14d Reddit JSON backfill per subreddit source |

`PlayerRefreshJob` generates `PlayerAlias` rows via `generateAliases()` from `@rzf/shared` for entity resolution during ingestion.

**Social runbook:** [INGESTION_REDDIT_TWITTER.md](./INGESTION_REDDIT_TWITTER.md). **ESPN/Yahoo rankings:** [INGESTION_ESPN_YAHOO.md](./INGESTION_ESPN_YAHOO.md).
