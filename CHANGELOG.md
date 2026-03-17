# Changelog

All meaningful changes are logged here. Most recent first.

---

## 2026-03-17

### Phase 1 — Agent Content Injection: tiered sources, confidence scoring, schedule-aware recency

- **Content Injector** (`packages/agents/src/content-injector.ts`): new unified `injectContent()` utility used by all 6 agents. Filters `ContentPlayerMention → ContentItem → ContentSource` by source tier (1/2/3), platform, and recency window. Deduplicates by URL, caps 2 items per player + `maxContentItems` total. Returns `InjectedContent[]`, a 0-100 `confidenceScore`, and `sourcesUsed[]` breakdown.
- **Confidence score formula**: three components — `tierScore` (0-40, weighted avg source quality), `coverageScore` (0-35, % of players with news), `recencyScore` (0-25, avg freshness fraction). Written to `AgentRun.confidenceScore` on every completed run.
- **NFL Schedule utility** (`packages/agents/src/nfl-schedule.ts`): `adjustWindowForSchedule()` tightens recency windows near game days — injury-watch shrinks to 12h on Sundays/game-day TNF, 24h Fri/Sat. Lineup shrinks proportionally. Other agents use their configured base window unchanged.
- **Schema**: `ContentSource.tier Int @default(2)` (1=premium, 2=established, 3=general); `AgentRun.confidenceScore Int?` and `AgentRun.sourcesUsed Json?`; `AgentConfig` gains four source-control fields: `allowedSourceTiers`, `allowedPlatforms`, `recencyWindowHours`, `maxContentItems` — all admin-configurable per agent.
- **All 6 agents updated**: team-eval, waiver, trade-analysis, player-scout — ad-hoc `contentPlayerMention` queries replaced with `injectContent()`. Lineup agent — content injected for first time (previously had none). Injury-watch — upgraded from purely rule-based: now calls LLM (haiku) to enrich summaries/recommendations/handcuff suggestions when news is available; falls back to rule-based output gracefully if LLM fails or no content exists.
- **Injury-watch prompt** (`packages/agents/src/injury-watch/prompt.ts`): new file with `buildSystemPrompt()` and `buildUserPrompt()` for the LLM enrichment path. News snippets formatted with source name, tier label, and relative publish age.
- **Lineup prompt updated**: `buildUserPrompt()` now accepts optional `newsContext` string injected as a per-player news block above the optimization instruction.
- **Team-eval prompt updated**: `buildUserPrompt()` now accepts optional `newsContext` injected into the LLM prompt; `contentLinks` in the output still populated from the same injection result.
- **Worker** (`apps/worker/src/workers/agent.worker.ts`): passes `allowedSourceTiers`, `allowedPlatforms`, `recencyWindowHours`, `maxContentItems` from `AgentConfig` DB row to `runtimeConfig`; extracts `confidenceScore` + `sourcesUsed` from agent output and writes to `AgentRun`.
- **API** (`apps/api/src/routes/agents.ts`): `GET /agents/:id` response now includes `confidenceScore`.
- **Frontend** (`apps/rostermind/src/components/AgentResults.tsx`): `ConfidenceBadge` component renders above every result card — green "High Confidence" (80+), yellow "Moderate Confidence" (50-79), gray "Limited Data" (<50 or null). `AgentRunResult` interface extended with `confidenceScore?: number | null`.
- **Shared types** (`packages/shared/src/types/agent.ts`): `AgentRuntimeConfig` extended with 4 source config fields; all 6 output schemas gain optional `confidenceScore` and `sourcesUsed` fields; `InjuryAlertSchema` gains optional `handcuffSuggestion`.
- **Content sources seed**: all existing sources assigned tiers (Rotowire/PFT = Tier 1, ESPN/CBS/YouTube = Tier 2, Flock/Domain = Tier 3); 5 new RSS sources added: FantasyPros NFL News, The Ringer NFL, Football Outsiders, 4for4.com Articles, NFL Trade Rumors.

---

## 2026-03-13

### Admin & Directory overhaul — token tracking, queue improvements, full directory UI rebuild

- **Admin token usage page** (`/usage`): per-user token consumption + estimated cost (Haiku/Sonnet rates) for last 30 days, sortable table + bar chart; new `GET /internal/usage/tokens` endpoint
- **Admin queue page**: state tooltips explaining Waiting/Active/Delayed/Completed/Failed; live "Recent Jobs" table with `GET /internal/queue/jobs` endpoint
- **Bad mention cleanup**: new `POST /internal/maintenance/cleanup-mentions` endpoint; raised alias min match from 4→6 chars; RSS + YouTube connectors filter Inactive players from alias lookups
- **YouTube ingestion**: `runYouTubeRefresh` now throws on errors so BullMQ marks job Failed (visible in admin)
- **Schema**: added `featured` (Boolean) and `partnerTier` (String?) to `ContentSource`; migration `20260312000002_content_source_featured`
- **Directory homepage**: full overhaul — trending ticker (Sleeper headshots), hero, stats bar, featured section, live news feed with content-type filter tabs, RosterMind AI CTA
- **Directory components**: `TrendingTicker`, `ContentCard`, `ContentFeed`
- **Directory Clerk**: separate `@clerk/nextjs` app, `ClerkProvider`, middleware, sign-in/up pages, Navbar auth buttons
- **Directory Stripe**: `ProGate` component with paywall overlay, `/api/billing/checkout` route, player detail page gated after 3 free mentions
- **Directory player page**: Sleeper headshot image, trade value breakdown, paywall structure
- **Directory env**: localhost links → `NEXT_PUBLIC_ROSTERMIND_URL`; `icon.svg` favicon; `.env.example` + `DEPLOYMENT.md` updated

## 2026-03-12

### Phase 1-3 MVP Lock-Down: all 6 agents live, Agent Manager, follow-up chat, Stripe

- **Intent router expanded**: All 6 agents (team_eval, injury_watch, waiver, lineup, trade_analysis, player_scout) now registered as `available: true`. Fixed `start_sit` → `lineup` naming. Added keywords for injury_watch and player_scout. Registry is now DB-driven via AgentConfig.enabled flag.
- **Agent result components**: Created `AgentResults.tsx` router + `InjuryWatchResults`, `WaiverResults`, `LineupResults`, `TradeAnalysisResults`, `PlayerScoutResults` components with full output rendering.
- **Analyze page overhaul**: All 6 quick-action chips active. Inline agents (team_eval, injury_watch, waiver, lineup) handled in chat UI. Trade/Scout chips navigate to dedicated pages. `handleRun` dispatches via `api.runAgent` by type.
- **Dedicated agent pages**: `/dashboard/trade` (player picker → TradeAnalysisAgent) and `/dashboard/scout` (player search → PlayerScoutAgent). Both poll for results and render agent-specific components.
- **AppSidebar**: Restructured into sections (AI Agents / Account). Added Trade Advice and Player Scout links.
- **History page**: Dynamic title from `AGENT_LABELS` map. All agent types render via `AgentResults` router.
- **Admin runs filter**: All 6 agent types added to `AGENT_OPTIONS` filter.
- **AgentConfig model**: New `agent_configs` DB table stores system prompts, model tier, enabled flag, label, description, sortOrder per agent. Migration seeded with hardcoded defaults.
- **Worker runtime config**: `agent.worker.ts` fetches `AgentConfig` from DB before each dispatch. `systemPromptOverride` and `modelTierOverride` passed to all agent runner functions.
- **Agent prompt overrides**: All 5 LLM agent `buildSystemPrompt()` functions accept optional `override?` string. Override replaces hardcoded template with `{userContext}` interpolation preserved.
- **Internal API — agent configs**: `GET /internal/agents/configs`, `PUT /internal/agents/configs/:type`, `POST /internal/agents/configs/:type/reset` endpoints added to `internal.ts`.
- **Admin Agent Manager page**: `/agents/config` in admin dashboard. Lists all agents with model badge, enabled toggle, edit button. Edit drawer: label, description, model selector, enabled/showInAnalyze toggles, full system prompt textarea, save + reset-to-default buttons.
- **Players search endpoint**: `GET /players/search?q=&position=` added to Fastify API for trade/scout player lookup.
- **Follow-up chat**: `POST /agents/:id/followup` — sync LLM call using completed run output as context. No credits deducted. `FollowUpThread` component added to analyze and history pages.
- **Stripe integration**: `POST /billing/checkout` creates hosted Checkout Session. `POST /webhooks/stripe` handles `checkout.session.completed` → upgrades user tier to `paid`, sets 50 credits. Billing page wired to call checkout and handle success/cancel redirect. `STRIPE_PRICE_ID` env var added.

---

## 2026-03-12

### Dynasty Daddy full data pull, PlayerTradeVolume, and Source Manager Automated APIs tab

- **Dynasty Daddy markets 2+3**: `syncValues()` now pulls DynastyProcess (market=2) and DynastySuperflex (market=3) into `PlayerTradeValue` with `source='dynastyprocess'` and `source='dynastysuperflex'`. Five markets total per weekly run (KTC dynasty, KTC redraft, DP, DS, DD own).
- **PlayerTradeVolume**: New schema model and table storing 8-week community trade frequency per player (count1w/2w/4w/8w + rank1w/4w/8w). Populated by new `syncTradeVolume()` which calls Dynasty Daddy's `/trade/volume` endpoint in the same weekly job.
- **Ingestion trigger endpoint expanded**: `POST /internal/ingestion/trigger` now accepts all job types including `youtube_refresh`, `trade_refresh`, `trade_values_refresh`, `adp_refresh`, and `dynasty_daddy_refresh`.
- **Source Manager — Automated APIs tab**: New read-only tab showing all 7 automated connectors (Sleeper Players/Trending/Trades, FantasyCalc, Dynasty Daddy, FFC ADP, Rankings) with schedule, data target, and a Trigger button for each.

### Dynasty Daddy connector, trade context enrichment, and Source Manager improvements

- **Dynasty Daddy connector**: New `DynastyDaddyConnector` syncs KTC dynasty (market=0), KTC redraft (market=4), and Dynasty Daddy own values (via `/player/all/today`) into `PlayerTradeValue` weekly. Sources labeled `source='ktc'` and `source='dynastydaddy'`. Also provides query-time `getPlayerTrades()` and `searchTrades()` for community trade history across 3.6M+ real trades.
- **KTC values via Dynasty Daddy**: No HTML scraping needed — Dynasty Daddy aggregates KTC rankings natively and exposes them through their unauthenticated server-side API.
- **TradeTransaction enriched**: Added `leagueType`, `teamCount`, `isSuperflex`, and `scoringFormat` (all nullable) to `TradeTransaction`. TRADE_REFRESH job now calls `GET /v1/league/{id}` once per league to capture format metadata for every trade stored.
- **YouTube @handle support**: `YouTubeConnector` now resolves `@handle` format via `channels.list?forHandle=` on first run, caching the resolved channel ID in `platformConfig`. 25 channels seeded.
- **Source Manager modal improvements**: Per-platform field labels and help text. YouTube accepts @handle, channel URL, or raw ID with client-side normalization before save. Reddit unlocked (it's standard RSS — no new connector needed). Coming-soon platforms disable the identifier field.
- **Agent trade context**: `TradeAnalysisAgent` and `PlayerScoutAgent` now call Dynasty Daddy's community trade API at query time, adding real community trade frequency and weekly volume to LLM context.
- **DYNASTY_DADDY_REFRESH cron**: Weekly Tuesday 4pm UTC job added to scheduler.
- **`YOUTUBE_API_KEY`** added to `.env.example` with setup instructions.

## 2026-03-11

### New data sources, four new agents, and Source Manager UI

- **YouTube ingestion**: New `YouTubeConnector` polls upload playlists every 2 hours using quota-efficient `playlistItems.list` (1 unit/call vs `search.list`'s 100 units). Seeded 25 top fantasy football channels. Stores as `ContentItem` with `platform: youtube`.
- **Sleeper trade transactions**: Added `getTransactions()` to `SleeperConnector`. New `TRADE_REFRESH` job pulls completed trades for all stored leagues daily, stored in new `TradeTransaction` model.
- **FantasyCalc trade values**: New `FantasyCalcConnector` fetches dynasty 1QB/SF and redraft values from the free public API. Stored in new `PlayerTradeValue` model. Weekly refresh.
- **Fantasy Football Calculator ADP**: New `FFCConnector` pulls PPR/half-PPR/standard ADP into `PlayerRanking` with `source: ffc_adp_*`. Weekly refresh.
- **Four new agents**: Waiver Wire, Trade Analyzer (uses `sonnet` for richer analysis), Lineup Optimizer, and Player Scout — all with strict Zod input/output contracts. Registered in `agents.ts` and `agent.worker.ts`.
- **Admin sidebar restructure**: Two labeled sections — SOURCES (Overview, Analytics, Source Manager) and AGENTS (Agent Runs, Queue). Added Data Sources reference page.
- **Source Manager UI** (`/sources/manager`): Full CRUD for `ContentSource` rows — add, edit, delete, active toggle, manual refresh trigger. Platform selector with "Coming Soon" states for unimplemented connectors. Inline delete confirm, toast feedback, 60s auto-refresh.
- **Internal source CRUD API**: Four new endpoints — `POST /internal/sources`, `PUT /internal/sources/:id`, `DELETE /internal/sources/:id`, `POST /internal/sources/:id/refresh`.
- **Schema**: Added `TradeTransaction` and `PlayerTradeValue` models; `Player.tradeValues` relation.

### Admin dashboard app (`apps/admin`)

- New standalone Next.js app deployed to its own Vercel project — no Clerk dependency, auth via `ADMIN_SECRET`
- **Overview page**: system health pills (API, agent queue, ingestion queue), user + run KPI cards, mini charts (runs/day, queue depth)
- **Agent Runs page**: 6-stat KPI row, runs-over-time area chart (30 days, stacked by status), token usage bar chart, agent-type breakdown chart, filterable + paginated run table with expandable rows showing `inputJson`/`outputJson`/error details, 5s auto-refresh
- **Content Sources page**: per-source health table (healthy/stale/inactive badges, stale detection at 2× refresh interval), expandable row with recent items, manual trigger buttons for all 5 ingestion job types
- **Content Analytics page**: KPI cards, items-over-time stacked area chart by content type, platform donut chart, topic distribution bar chart, top-20 player mentions bar chart, content type breakdown table with share bars
- **Queue page**: real-time agent + ingestion queue depth with auto-refresh

### New internal API endpoints

- `GET /internal/runs/stats` — 30-day daily buckets by status + token usage, per-agent-type summary, success rate, avg duration/tokens
- `GET /internal/sources` — all content sources with derived health status (stale detection), item counts, last fetch time
- `GET /internal/sources/:id/items` — paginated items for a single source with player mention counts
- `GET /internal/content/stats` — daily ingestion buckets by content type, platform distribution, top 20 player mentions resolved to names, topic frequency distribution

### Infrastructure fixes

- Region corrected: API and worker moved from Oregon to Ohio to match Render Postgres and Key Value instances — resolves `Can't reach database server at dpg-xxx:5432` 503 errors on all authenticated routes
- Redis `username` field now extracted from connection URL for Valkey ACL auth — fixes BullMQ connection hang when Render Key Value has authentication enabled

### CORS + API URL double-slash fix

- **CORS**: When `CORS_ORIGIN` is unset in production, API now defaults to allowing `https://rzf-web.vercel.app` so the Vercel frontend works without setting the secret
- **rostermind**: Normalize `NEXT_PUBLIC_API_BASE_URL` (strip trailing slash) so fetch URLs never get a double slash (`...com//sleeper/connect`), fixing 404/preflight failures

### Redis host normalization only on Render

- API/worker now append `.internal` to short Redis hostnames only when `RENDER=true` (set by Render platform)
- Fixes `ENOTFOUND red-xxxx.internal` when running API/worker locally or outside Render; local dev should use `REDIS_URL=redis://localhost:6379`

### Monthly paid credit refill cron

- Added `CREDITS_REFILL` ingestion job type and wired it through worker scheduling + execution
- Added monthly BullMQ scheduler (`credits-refill-monthly`) to run on the 1st and reset all paid users to `runCredits = 50`
- Ensures paid accounts are automatically reloaded each month without manual admin intervention

### Internal dashboard queue + run monitor upgrades

- `/internal/queue` now returns and renders both **agents** and **ingestion** queue counts (waiting/active/delayed/completed/failed)
- `/internal/runs` now supports agent-type filtering in UI and adds optional 5-second auto-refresh with manual refresh control
- Added `credits_refill` to manual ingestion trigger validation (`POST /internal/ingestion/trigger`)

### TeamEval link quality + InjuryWatchAgent

- Replaced TeamEval static FantasyPros URL construction with real content links from `ContentItem` + `ContentPlayerMention` query results
- Added `INJURY_WATCH` agent type and implemented `runInjuryWatchAgent` using existing player injury/status fields (`injuryStatus`, `status`)
- Wired InjuryWatch through API validation and worker execution path as a queueable agent run

---

## 2026-03-10

### Pre-deploy hardening + offensive positions filter

- **CORS** — replaced hardcoded stale `rzf-web.vercel.app` origin with `CORS_ORIGIN` env var (comma-separated, parsed at startup); added to `render.yaml` as `sync: false` manual secret
- **render.yaml** — added `OPENAI_API_KEY` to both `rzf-api` and `rzf-worker` services (LLM connector prefers OpenAI; was missing entirely)
- **Redis provider migration** — removed Upstash REST fallback from API/worker runtime; both services now require a single `REDIS_URL` value (Render Key Value internal URL)
- **Redis hostname normalization** — API/worker now normalize short Render Key Value host IDs (e.g. `red-xxxx`) to `red-xxxx.internal` to prevent `ENOTFOUND` DNS failures in Render private networking
- **`apps/directory/vercel.json`** — created deployment config matching `rostermind` build pattern; directory app now has a defined deploy path
- **Offensive positions filter** — `runPlayerRefresh()` now filters Sleeper's full player dump to `QB, RB, WR, TE, K, FB` only before upsert; `OFFENSIVE_POSITIONS` constant reused in `runRankingsRefresh()` query; eliminates all defensive/OL player rows from DB (reduces player table size ~60-70%, fewer aliases, faster content mention resolution)
- **RSS dedup** — replaced per-item `findUnique` loop with a single `findMany({ where: { sourceUrl: { in: [...] } } })` batch query per feed; N queries → 1 query per feed run
- **AGENTS.md** — updated ingestion jobs table to include `ContentRefreshJob` (every 30 min), corrected `RankingsRefreshJob` source description

---

### Wire CONTENT_REFRESH cron into scheduler

- Added `content-refresh-30min` job scheduler to `apps/worker/src/scheduler.ts` (runs every 30 min via `*/30 * * * *`)
- Completes the RSS pipeline — content now refreshes automatically on worker startup without manual trigger
- All four ingestion jobs are now scheduled: player-daily, trending-hourly, rankings-weekly, content-30min

---

### Post-MVP backlog items captured

#### KTC dynasty value scraper connector
- KeepTradeCut (`keeptradecut.com`) confirmed fully scrapable — `robots.txt` is `Allow: /`, all data server-side rendered, no auth required
- Player URLs encode a numeric ID (e.g. `/dynasty-rankings/players/bijan-robinson-1414`) — enumerable from the main rankings page
- Data available per player: dynasty value (0–9999), overall rank, positional rank, tier, 30-day trend, age, height/weight, college, draft info, recent KTC vote pairings (K/T/C), value-adjacent players
- Plan: new `packages/connectors/src/ktc/index.ts` connector + `KTC_REFRESH` ingestion job type; daily cron (~2am ET); store values in `PlayerRanking` table with `source: 'ktc'`; KTC vote pairings (K/T/C) are high-signal trade value context for agents

#### Internal dashboard — ingestion jobs monitor
- Current `/internal/queue` only shows BullMQ agent queue counts; needs a second section for the ingestion queue (player, trending, rankings, content jobs)
- Desired view: per-job-type cards showing last run time, next scheduled run, items inserted on last run, error count, manual trigger button
- Requires: ingestion queue stats exposed via API (`GET /internal/ingestion/queue`), last-run metadata stored on `ContentSource` table (already has `lastFetchedAt`) and surfaced for other job types

#### Internal dashboard — agent execution monitor
- Current `/internal/runs` is a basic table; needs a richer real-time view for monitoring end-user agent executions
- Desired view: live-updating feed of agent runs with status badges (queued/running/done/failed), user, agent type, duration, input summary, output preview; filter by status/agent type; click-to-expand full input/output JSON
- Requires: websocket or polling with auto-refresh, run detail endpoint (`GET /internal/runs/:id`)

---

### Phase 3b: RSS content pipeline

- Added `CONTENT_REFRESH` to `IngestionJobTypes` in `@rzf/shared`
- Created `packages/connectors/src/rss/index.ts` — `RSSConnector.run()` reads active RSS sources from `ContentSource` DB table, fetches feeds, normalizes to `ContentItem`, resolves player entity mentions via `PlayerAlias`, and upserts `ContentPlayerMention` rows
- Wired `CONTENT_REFRESH` case into `ingestion.worker.ts`
- Added `CONTENT_REFRESH` to the `/internal/ingestion/trigger` endpoint enum
- Created `packages/db/prisma/seeds/content-sources.ts` — seed script for initial RSS sources (Rotowire, NFL.com, ESPN, Pro Football Talk); DB is the runtime source of truth, seed is the initial bootstrap
- `@rzf/db` added as dependency to `@rzf/connectors` (connector reads sources + aliases from DB directly)
- Sources are managed in DB (`ContentSource` table) — admin UI management is the planned follow-on

---

### Phase 3a: Scaffold apps/directory — Red Zone Fantasy data hub

- New `apps/directory` Next.js app on port 3002, separate from RosterMind AI
- Dark + red theme mirroring the original RZF design language
- Pages: home (hero + category grid + RosterMind CTA), `/search` (player search with position filter), `/sources` (source registry grouped by platform), `/players/[id]` (player detail with rankings, projections, content mentions)
- Server-side API route at `/api/players/search` querying the shared Prisma DB
- Turborepo/pnpm workspace automatically picks up the new app via `apps/*` glob

### Phase 2: RosterMind AI rebrand — rename, neural theme, landing page

- Renamed `apps/web` → `apps/rostermind`, updated package name to `@rzf/rostermind`, updated `vercel.json` build command
- Recreated `apps/rostermind/.env.local` (gitignored, carries over Clerk + DB keys)
- Installed `framer-motion` for neural animations
- New neural dark theme in `globals.css`: electric blue/purple palette, glow utilities, neural pulse keyframes, signal-travel animation, gradient text utilities
- Built `src/components/neural/NeuralNetwork.tsx`: canvas-based animated neural network with pulsing nodes, signal propagation along edges, mouse-reactive repulsion, floating NFL position labels (QB, RB, WR, etc.)
- Rebuilt landing page (`page.tsx`) with RosterMind AI branding, neural hero section using `NeuralNetwork` canvas component, updated features/pricing sections
- Updated dashboard layout logo from "RZF / Red Zone Fantasy" to RosterMind AI neural SVG mark
- Updated all remaining RZF/Red Zone copy across analyze, onboarding, dashboard pages
- Updated root layout metadata (title, description, og tags)
- Added `outputFileTracingRoot` to `next.config.ts` to silence monorepo lockfile warning
- All TypeScript checks passing

### Redis cost optimisation — removeOnComplete + local dev routing

- Added `removeOnComplete: { count: 500 }` and `removeOnFail: { count: 20 }` to agent queue in `apps/api/src/lib/queue.ts` (was missing — completed jobs were accumulating in Upstash)
- Added `removeOnComplete: true` and `removeOnFail: { count: 10 }` to ingestion queue (fire-and-forget jobs don't need Redis retention)
- Updated Redis connection logic in both API and worker: in `NODE_ENV=development` the `REDIS_URL` is now preferred over Upstash, routing local dev traffic to a local Redis instance instead of consuming free-tier Upstash quota
- Updated `.env` to set `REDIS_URL=redis://localhost:6379` for local dev with instructions to run Redis via Docker

### Phase 0 + 1: Data architecture foundation, LLM provider switch, search infrastructure

- Redesigned Prisma schema with unified content model: `ContentSource` (enum platform), `ContentItem` (enum contentType, summary, mediaMeta, sentimentScore, chunking via parentId), `ContentPlayerMention` join table, `PlayerAlias`, `PlayerProjection`, `NFLTeamDefense`
- Enabled `pgvector`, `pg_trgm`, `unaccent` extensions; added `embedding vector(1536)` column to `content_items` (schema-ready, unfilled until post-MVP)
- Full-text search: `searchVector tsvector` column on `content_items` with GIN index and auto-update trigger (title=A, summary=B, rawContent=C, authorName=D)
- Built `packages/shared/src/player-resolver.ts`: `generateAliases()`, `resolvePlayerMentions()`, `extractSnippet()`, `inferMentionContext()` utilities for player entity resolution during content ingestion
- Switched LLM provider preference from Anthropic to OpenAI (`getProvider()` now prefers `OPENAI_API_KEY` first) — uses `gpt-4o-mini` by default
- Added `YOUTUBE_API_KEY` and `TWITTER_BEARER_TOKEN` to shared env schema (optional, for Phase 3 connectors)
- Applied schema to database via `prisma db push`

### Two-step onboarding welcome page

- Replaced the direct Sleeper connect form with a landing step showing platform cards (Sleeper, ESPN/Yahoo as "coming soon")
- Clicking Connect Sleeper transitions to the connect form inline (step 2) with a Back button
- Added "Skip for now" link so users can reach the dashboard without connecting immediately

---

## 2026-03-09

### Report history + OpenClaw operator endpoint

- Added `/dashboard/history` page listing a user's last 20 agent runs
- Added `/dashboard/history/[id]` page for full report replay (reuses shared `TeamEvalResults` component)
- Extracted `TeamEvalResults` to `apps/web/src/components/TeamEvalResults.tsx` (shared by team-eval and history pages)
- Added "Report History" nav link to dashboard sidebar
- Added `POST /internal/agents/run` — operator-triggered agent run that bypasses credit check (for OpenClaw/on-prem use)

### OpenAI provider support + CORS fix

- Added OpenAI as a fallback LLM provider in `packages/connectors/src/llm/client.ts`
- `haiku` tier maps to `gpt-4o-mini`, `sonnet` maps to `gpt-4o`
- Provider auto-selected at runtime: Anthropic preferred, OpenAI fallback (whichever key is present)
- Fixed CORS origin in `apps/api/src/index.ts` — replaced placeholder with `https://rzf-web.vercel.app`

## 2026-03-06

### Lint & typecheck fixes — initial green build

- Added `PORT` to shared env schema (Zod-validated, used by API server at startup)
- Replaced all direct `process.env` accesses in `apps/api` and `apps/web` with proper `@rzf/shared/env` imports
- Added `apps/web/src/lib/client-env.ts` as the designated wrapper for `NEXT_PUBLIC_*` client-side vars
- Removed unused `track` import in `apps/api/src/routes/users.ts`
- Removed unused `clerkUserId` in team-eval page
- All 7 packages now pass `typecheck` and `lint` with zero errors

### Initial scaffold

- Initialized pnpm monorepo with Turborepo
- Created workspace structure: `apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/shared`, `packages/connectors`, `packages/agents`
- Root config: `tsconfig.base.json`, `eslint.config.js` (with `no-process-env` rule), `prettier.config.js`, `turbo.json`
- `docker-compose.yml` for local Postgres + Redis dev environment
- `.env.example` with full variable catalog for all services
- Created living docs: `docs/ARCHITECTURE.md`, `docs/AGENTS.md`, `docs/DATA.md`, `docs/DEPLOYMENT.md`
- Created `.cursor/rules/living-docs.mdc` (alwaysApply rule for doc auto-updates)
- Created `scripts/sync-docs.ts` for mechanical doc regeneration
- Added `.cursor/mcp.json` (Postgres + GitHub MCP servers)
- Added `.vscode/extensions.json` with recommended extensions
