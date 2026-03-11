# Changelog

All meaningful changes are logged here. Most recent first.

---

## 2026-03-11

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
