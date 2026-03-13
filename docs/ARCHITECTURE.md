# Architecture

> Last updated: 2026-03-12

## System Overview

Red Zone Fantasy is a monorepo with three deployed services plus a local operator gateway.

```
┌─────────────────────────────────────────────────────────┐
│                      End Users                          │
│   apps/rostermind + apps/directory (Next.js — Vercel)  │
│   /dashboard  /account  /onboarding  /internal          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────┐
│                  apps/api (Fastify)                     │
│              Render Web Service :3001                   │
│  /users  /sleeper/*  /agents/*  /webhooks/*  /internal  │
└──────┬────────────────────────────┬─────────────────────┘
       │ Prisma                     │ BullMQ enqueue
       │                            │
┌──────▼──────────┐    ┌────────────▼────────────────────┐
│  Render Postgres │    │  Render Key Value (Redis)       │
│  (Primary store) │    │  BullMQ queue backing store     │
└──────▲──────────┘    └────────────┬────────────────────┘
       │ Prisma                     │ BullMQ consume
       │                    ┌───────▼────────────────────┐
       │                    │   apps/worker (BullMQ)     │
       │                    │   Render Background Worker │
       │                    │   AgentJobs + IngestionJobs│
       │                    └───────┬────────────────────┘
       │                            │
       │                    ┌───────▼────────────────────┐
       │                    │   packages/agents          │
       │                    │   TeamEvalAgent            │
       │                    └───────┬────────────────────┘
       │                            │
       └────────────────────┬───────┘
                            │
                    ┌───────▼────────────────────┐
                    │   packages/connectors      │
                    │   SleeperConnector         │
                    │   LLMConnector (Anthropic) │
                    └───────┬────────────────────┘
                            │
              ┌─────────────┼─────────────────┐
              │             │                 │
     ┌────────▼──┐  ┌───────▼────┐  ┌────────▼──────────┐
     │ Sleeper   │  │ Anthropic  │  │ FantasyPros CSV    │
     │ Public API│  │ Haiku/     │  │ (weekly rankings)  │
     │ (no auth) │  │ Sonnet     │  │                    │
     └───────────┘  └────────────┘  └────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Operator Interface (Local Only)            │
│   OpenClaw Gateway (Docker) → Telegram Bot              │
│   Connects to production Postgres + API via HTTPS       │
│   ClawDeck dashboard at localhost:3002                  │
└─────────────────────────────────────────────────────────┘
```

## Service Responsibilities

### `apps/rostermind` (Vercel)
- User-facing Next.js 15 App Router application
- Clerk auth integration (sign-up, sign-in, account management)
- Pages: onboarding, dashboard, team eval, account, preferences, internal admin
- Server Components for data display; Client Components for interactivity

### `apps/admin` (Vercel)
- Standalone internal admin dashboard — separate Vercel project, no Clerk dependency
- Auth via `ADMIN_SECRET` stored in `localStorage`, sent as `x-admin-secret` header
- Pages: Overview, Agent Runs (with charts), Content Sources (health + manual triggers), Content Analytics (Recharts visualizations), Queue Status, Agent Config (edit system prompts / model tiers / enable toggles per agent)
- Uses `recharts` for time-series and distribution charts

### `apps/directory` (Vercel)
- Public Next.js 15 data directory for player search/detail/source browsing
- Server-rendered pages and route handlers reading from shared Prisma DB

### `apps/api` (Render Web Service)
- Fastify REST API — all business logic entry point
- Validates Clerk JWT sessions on protected routes
- Enqueues jobs to BullMQ for async agent execution
- Handles webhooks: Clerk user lifecycle, Stripe `checkout.session.completed` (upgrades user to paid tier)
- `POST /agents/:id/followup` — credit-free LLM follow-up chat on a completed run
- `GET /players/search` — player name search for frontend agent inputs
- `POST /billing/checkout` — creates Stripe Checkout Session for tier upgrade
- Admin routes under `/internal/*` gated by `role = admin`; includes `GET/PUT /internal/agents/configs` for runtime agent config

### `apps/worker` (Render Background Worker)
- BullMQ consumer — executes agent jobs and ingestion jobs
- No HTTP exposure — pull-only from Redis queue
- Writes agent results + analytics events to Postgres
- Scheduled jobs: PlayerRefreshJob (daily), TrendingRefreshJob (hourly), RankingsRefreshJob (weekly), ContentRefreshJob (every 30 min), CreditsRefillJob (monthly)

### `packages/db`
- Prisma schema, migrations, generated client
- `track()` helper for analytics events
- Single import point for all DB operations

### `packages/shared`
- Zod-validated env schema (`env.ts`) — single source of truth for all env vars
- Shared TypeScript types (agent I/O contracts, analytics event types, user types)
- `buildUserContext()` — converts UserPreferences to a token-efficient LLM context block

### `packages/connectors`
- `SleeperConnector` — Sleeper public API (no auth required)
- `LLMConnector` — Anthropic SDK wrapper (Haiku default, Sonnet for complex tasks)
- Each connector is isolated; new data sources = new connector file

### `packages/agents`
- Agent logic with strict typed input/output schemas
- Live agents: TeamEvalAgent, InjuryWatchAgent, WaiverAgent, LineupAgent, TradeAnalysisAgent, PlayerScoutAgent
- All LLM-based agents accept an optional `AgentRuntimeConfig` (systemPromptOverride, modelTierOverride) loaded from `AgentConfig` DB rows at dispatch time
- Agents are pure functions: input → output, no side effects
- Side effects (DB writes, event tracking) happen in the worker, not in agent code

## Data Flow: Agent Run

```
User triggers agent (inline chat or dedicated page)
  → POST /agents/run (apps/api)
  → Check runCredits > 0
  → Enqueue agent job to Redis
  → Return { jobId, status: "queued" }

Worker picks up job
  → Fetch AgentConfig from DB (systemPromptOverride, modelTierOverride, enabled)
  → Load UserPreferences from DB → buildUserContext()
  → Live fetch: Sleeper roster + league settings (where applicable)
  → DB lookup: enrich players, rankings, trade values, content mentions
  → Call LLMConnector.completeJSON() with runtime config
  → Write result to AgentRun.outputJson
  → track("agent.run.completed", { ... })
  → Decrement User.runCredits

Web polls GET /agents/:jobId
  → Returns result when status = "done"
  → AgentResults router renders agent-specific output component

User asks follow-up question (no credit cost)
  → POST /agents/:id/followup
  → Fetch prior AgentRun.outputJson as context
  → LLM one-shot response → returned inline
```

## Data Flow: Player Data Ingestion

```
Scheduled daily (6am ET):
  PlayerRefreshJob → GET /players/nfl (Sleeper) → upsert Player table

Scheduled hourly:
  TrendingRefreshJob → GET /players/nfl/trending/add+drop → insert TrendingPlayer

Scheduled weekly (Tuesday):
  RankingsRefreshJob → fetch FantasyPros CSV → parse → upsert PlayerRanking

Scheduled monthly (1st of month):
  CreditsRefillJob → reset all paid users to 50 runCredits
```

## Deployment

| Service | Platform | Plan | Cost |
|---------|----------|------|------|
| `apps/rostermind` | Vercel | Free | $0 |
| `apps/directory` | Vercel | Free | $0 |
| `apps/admin` | Vercel | Free | $0 |
| `apps/api` | Render Web Service | Starter | $7/mo |
| `apps/worker` | Render Background Worker | Starter | $7/mo |
| Postgres | Render Managed Postgres | Starter | $7/mo |
| Redis | Render Key Value | Starter | $10/mo |
| **Total** | | | **$31/mo** |

## Security Notes

- OpenClaw Gateway is never publicly deployed — local Docker only
- All secrets via env vars, validated at startup via Zod
- Direct `process.env` access blocked by ESLint rule
- Admin routes require `User.role === "admin"` checked server-side
- Stripe webhook signatures verified before processing
