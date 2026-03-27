# Red Zone Fantasy — Roadmap

> Living document. Update as priorities shift.
> Format: items are ordered by priority within each phase.

---

## Phase 1-3 — MVP Complete ✅

### Infrastructure
- [x] Monorepo scaffold (API, Worker, Web, all packages)
- [x] Clerk auth (middleware, sign-in/up pages, webhook → DB user creation)
- [x] Prisma schema + Render Postgres migrations
- [x] BullMQ worker + Redis queue
- [x] Render deploy (rzf-api + rzf-worker)
- [x] Vercel deploy (rzf-web, rzf-admin)
- [x] Credit system — free tier (2 runs), paid tier (50/mo), 402 gate
- [x] Token budget tracking per user per month
- [x] Internal admin routes (`/internal/*`) with `x-admin-secret` auth
- [x] LLM provider dual-support — Anthropic (primary) + OpenAI fallback
- [x] Duplicate job prevention (5-minute window)

### All 6 Agents Live
- [x] **TeamEvalAgent** — roster grade with position scores, insights, content links
- [x] **InjuryWatchAgent** — starter injury risk scan, severity-coded alerts, handcuff recs
- [x] **WaiverAgent** — roster gap analysis → ranked waiver pickups with drop suggestions
- [x] **LineupAgent** — optimized starting lineup with confidence scores and matchup analysis
- [x] **TradeAnalysisAgent** — accept/decline/counter with value score (uses Claude Sonnet)
- [x] **PlayerScoutAgent** — deep-dive player report with trend, news, insights

### UX
- [x] Onboarding flow (Sleeper username → profile linked)
- [x] `/dashboard/analyze` — AI assistant chat UI, all 6 agents accessible
- [x] `/dashboard/trade` — dedicated trade advisor page with player picker
- [x] `/dashboard/scout` — dedicated player scout page with player search
- [x] Report history — `/dashboard/history` with full agent-specific report replay
- [x] `focusNote` — optional user direction injected into agent prompt
- [x] Post-run follow-up chat — sync LLM Q&A on completed reports (no credit cost)
- [x] Intent router (DB-driven) — keyword classifier → agent dispatch, enabled by AgentConfig

### Agent Manager
- [x] `AgentConfig` DB model — system prompts, model tier, enabled flag, labels
- [x] Admin Agent Manager page — edit prompts, model tier, enable/disable without redeploy
- [x] Worker reads AgentConfig at runtime before each dispatch
- [x] Reset-to-default endpoint — restore hardcoded prompt from source-of-truth map

### Monetization
- [x] Stripe checkout session (`POST /billing/checkout`)
- [x] Stripe webhook handler (`checkout.session.completed` → upgrade to paid, 50 credits)
- [x] Billing page upgrade button wired to Stripe hosted checkout

### Remaining for Go-Live
- [ ] Monthly credit refill cron job for paid users (resets `runCredits` to 50 on 1st of month)
- [ ] `ADMIN_SECRET` hardened to real value in Render (currently placeholder)
- [ ] End-to-end sign-up test — verify Clerk webhook → DB row → Sleeper connect → team eval run
- [ ] Set `STRIPE_PRICE_ID` in Render after creating product in Stripe Dashboard

---

## Phase 2 — UX / Product

- [ ] **Post-run follow-up chat** — ask the agent follow-up questions about the report
  - `POST /agents/:id/followup` — direct sync LLM call with report as context
  - Chat UI addition to the analyze page (reply thread under result)
- [ ] **Upgrade flow** — working Stripe checkout for free → Pro upgrade
- [ ] **Roster alerts** — Telegram/push notification when a starter gets injured
  - Requires: InjuryWatchAgent + notification delivery (TELEGRAM_BOT_TOKEN already stubbed)
- [ ] **Multi-league compare** — analyze all leagues at once, summarize across them
- [ ] **Active nav item highlighting** — sidebar shows current page as active
- [ ] **Mobile sidebar** — hamburger menu for mobile dashboard nav

---

## Phase 3 — Content & Intelligence ✅ (Agent Content Injection complete)

- [x] **Content ingestion pipeline** — RSS/YouTube ingest → `ContentItem` table, player mention linking via alias matching
- [x] **Agent content injection** — unified `injectContent()` wired into all 6 agents; tiered source filtering; per-agent `recencyWindowHours`, `maxContentItems`, `allowedTiers`, `allowedPlatforms` configurable from admin
- [x] **Source tiers** — `ContentSource.tier` (1=premium, 2=established, 3=general); Rotowire/PFT = Tier 1; ESPN/CBS/YouTube = Tier 2
- [x] **Confidence scoring** — 0-100 per-run score (tier quality + player coverage + recency freshness); stored on `AgentRun`; displayed as badge in UI
- [x] **NFL schedule-aware recency** — `nfl-schedule.ts` tightens windows on game days for injury-watch and lineup agents
- [x] **Injury-watch LLM enrichment** — optional LLM path enriches summaries/recommendations/handcuff suggestions from real news; falls back to rule-based gracefully
- [x] **5 new RSS sources** — FantasyPros, The Ringer, Football Outsiders, 4for4.com, NFL Trade Rumors
- [ ] **NewsDigestAgent** — weekly personalized digest from ContentItem + roster context
- [ ] **Player trend signals** — snap count %, target share, opportunity scores from box scores
- [ ] **Season-long projections** — ROS outlook, not just this week

### Directory — custom feeds & trending (planned)

See **`docs/PLAN_CUSTOM_FEEDS_TRENDING_TOPICS.md`** for the full execution plan: authenticated custom feed CRUD + query layer (Sleeper / players / team / sources), enforcement of 2 free / 5 Pro feeds, Reddit & X operational hardening, **five trending topic chips** on the home feed driven by `ContentItem.topics` aggregation, and a **Featured Content** carousel (Swiper, 10s autoplay, peek layout) above the main feed.

---

## Phase 4 — RosterMind Chat Continuity & UX Depth

> Goal: transform the analyze page from a one-shot agent runner into a cohesive multi-run session.

- [ ] **Continuous chat sessions** — multi-run conversations; each new agent run appends to the same thread without resetting the page
- [ ] **Credit awareness in chat** — inline credit counter visible in chat; warn before each run that consumes a credit; confirm prompt ("This will use 1 credit — continue?")
- [ ] **ChatSession persistence** — store follow-up messages per session in DB (`ChatSession` + `ChatMessage` models); 30-day retention; allows history replay
- [ ] **Session summary** — auto-generated summary card shown at end of multi-run session
- [ ] **Agent parameter refinement** — clearer prompts for required params; inline validation before dispatch; smarter intent routing
- [ ] **Admin Source Control Panel** — checkboxes per agent to toggle which source tiers/platforms are injected; edit `allowedSourceTiers`, `allowedPlatforms`, `recencyWindowHours`, `maxContentItems` from Admin UI
- [ ] **Confidence score dial-in** — monitor per-agent confidence averages; surface in admin; add alert when score consistently below 50

---

## Phase 5 — X / Twitter Engine

> Builds the social layer of the RZF ecosystem. Requires X API access (Rostermind + RZF accounts).

- [ ] **Twitter connector** (`packages/connectors/twitter/`) — read-only ingestion of fantasy football content via Twitter API v2 (filtered stream / search); stores as `ContentItem` with `platform: twitter`
- [ ] **X Feed tab** in directory — curated feed of ingested fantasy Twitter content
- [ ] **Automated weekly posts** — worker jobs generate and post tailored content weekly:
  - Start/Sit recommendations
  - Waiver wire pickups
  - Good matchups of the week
  - Recent notable trades
  - Trending players
- [ ] **Comment responder** — monitors replies to specific tweet formats (e.g. "start/sit for [Player X] or [Player Y]?"); uses agent output to generate a response; drops product link (Rostermind) in reply
- [ ] **Post scheduler** — admin UI to preview and schedule queued posts; toggle auto-post on/off
- [ ] **Bot account management** — support for multiple accounts (rostermind_ai, rzf_official, worker bots)

---

## Phase 6 — OpenClaw / Operator Tooling

- [ ] **On-prem OpenClaw bot** (Telegram) — operator interface to `/internal` routes
  - Trigger agent runs for specific users, bump credits, check queue health
  - Runs on always-on PC; connects via `x-admin-secret` header
- [ ] **Weekly operator digest** — Telegram summary of signups, runs, errors, revenue
- [ ] **Per-user proactive agent** — auto-runs team eval weekly, notifies via Telegram/Discord

---

## Phase 7 — Browse-Mode Agents (Orgo VMs)

> Requires ORGO_API_KEY. Only build when browse tasks can't be solved via API.

- [ ] Beat writer article scraper — pull player news from local beat reporters
- [ ] Advanced stats extraction — PFF, NextGenStats, Pro Football Focus

---

## Future Ideas (Backlog / Discuss Before Building)

- Opponent analysis — scout your weekly matchup opponent's roster
- Historical performance trends — player consistency scoring
- Dynasty / keeper mode — long-term value tools alongside weekly tools
- Discord bot — public-facing community slash commands
- League-wide analysis — rank all teams in a league (with their permission)
- Mobile app — React Native using the same API

---

## Known Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| Prisma connection pooling (PgBouncer) | Low | Only needed at 200+ concurrent DB queries |
| `AGENTS.md` auto-sync (`pnpm sync:docs`) | Low | Currently manual updates |
| Worker retry behavior on OpenAI rate limits | Medium | Should detect 429 and backoff longer |
| `TeamEvalOutput` schema expansion | Medium | Add `tradeTargets`, `waiverTargets` sections once agent suite is stable |
| FantasyPros `contentLinks` static URLs | Low | Replaced with real ContentItem DB queries via content-injector in Phase 3 ✅ |
| Confidence score calibration | Medium | Need real run data to tune tier weights and formula components |
| New RSS source URL verification | Medium | FantasyPros and 4for4 feed URLs need confirming before relying on them |
