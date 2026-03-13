# Agents

> Last updated: 2026-03-12
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

### Planned (Phase 4+)
- **NewsDigestAgent**: Personalized weekly digest — requires ContentItem pipeline to be fully populated
- **BrowseAgents**: Requires OpenClaw/Orgo integration (Phase 5)

---

## Ingestion Jobs (not user-facing agents)

These run on a schedule in `apps/worker`. They populate the data tables that agents read from.

| Job | Schedule | Source | Target table |
|-----|----------|--------|--------------|
| `PlayerRefreshJob` | Daily 6am ET | Sleeper `/players/nfl` | `Player`, `PlayerAlias` |
| `TrendingRefreshJob` | Hourly | Sleeper trending | `TrendingPlayer` |
| `RankingsRefreshJob` | Weekly (Tue) | Sleeper `searchRank` proxy (FantasyPros CSV planned) | `PlayerRanking` |
| `ContentRefreshJob` | Every 30 min | Active RSS `ContentSource` rows | `ContentItem`, `ContentPlayerMention` |
| `YouTubeRefreshJob` | Every 2 hours | Active YouTube `ContentSource` rows | `ContentItem`, `ContentPlayerMention` |
| `TradeRefreshJob` | Daily 8am ET | Sleeper transactions for all stored leagues | `TradeTransaction` (with `leagueType`, `teamCount`, `isSuperflex`, `scoringFormat`) |
| `TradeValuesRefreshJob` | Weekly (Tue 10am ET) | FantasyCalc public API | `PlayerTradeValue` (`source='fantasycalc'`) |
| `DynastyDaddyRefreshJob` | Weekly (Tue 11am ET) | Dynasty Daddy API (KTC market=0/4 + DD own) | `PlayerTradeValue` (`source='ktc'` and `source='dynastydaddy'`) |
| `ADPRefreshJob` | Weekly (Tue 10:30am ET) | Fantasy Football Calculator | `PlayerRanking` (`source='ffc_adp_*'`) |
| `CreditsRefillJob` | Monthly (1st) | Internal system job | `User.runCredits` |

Manual trigger: `POST /internal/ingestion/trigger` with `{ "type": "player_refresh" | "trending_refresh" | "rankings_refresh" | "content_refresh" | "credits_refill" }` (requires admin secret or admin session).

`PlayerRefreshJob` now also generates `PlayerAlias` records for every upserted player using `generateAliases()` from `@rzf/shared`. These are used during content ingestion to resolve name mentions to canonical Sleeper player IDs.
