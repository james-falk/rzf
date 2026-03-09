# Agents

> Last updated: 2026-03-06
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
6. Build `contentLinks` — Phase 1: URL construction; Phase 2: DB query from ContentItem
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

## Planned Agents (Phase 2+)

See `ROADMAP.md` for full prioritization. Schemas defined in `packages/shared/src/types/agent.ts`.

### WaiverAgent
Weekly ranked pickup/drop recommendations tailored to the user's specific roster gaps.
- **Input**: `{ userId, leagueId, focusPositions?: string[] }`
- **Key data**: roster (live), trending adds (DB), player injury/depth (DB)

### StartSitAgent
Weekly lineup decisions for borderline starters with confidence scores.
- **Input**: `{ userId, leagueId, week?: number }`
- **Key data**: starters (live), injury reports (DB), matchup data (TBD)

### TradeAnalysisAgent
Accept/reject trade evaluation with counter-suggestion.
- **Input**: `{ userId, leagueId, givePlayers: string[], receivePlayers: string[] }`
- **Key data**: both player values, roster needs, ROS rankings — needs trade value data source

### InjuryWatchAgent
On-demand risk assessment for a user's starting lineup.
- **Input**: `{ userId, leagueId }`
- **Key data**: roster injury statuses (DB), handcuff availability

### NewsDigestAgent
Personalized weekly digest (Phase 3 — requires ContentItem pipeline).
- **Input**: `{ userId, leagueId }`
- **Key data**: ContentItem table (not yet populated)

---

## Ingestion Jobs (not user-facing agents)

These run on a schedule in `apps/worker`. They populate the data tables that agents read from.

| Job | Schedule | Source | Target table |
|-----|----------|--------|--------------|
| `PlayerRefreshJob` | Daily 6am ET | Sleeper `/players/nfl` | `Player` |
| `TrendingRefreshJob` | Hourly | Sleeper trending | `TrendingPlayer` |
| `RankingsRefreshJob` | Weekly (Tue) | FantasyPros CSV | `PlayerRanking` |
