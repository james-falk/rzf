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

## Phase 3 — Content & Intelligence

- [ ] **Content ingestion pipeline** — RSS/YouTube ingest → ContentItem table
  - Currently `ContentItem` table exists but is empty; `contentLinks` uses static FantasyPros URLs
  - Goal: replace with real matched articles/videos per player
- [ ] **NewsDigestAgent** — weekly personalized digest from ContentItem + roster context
- [ ] **Player trend signals** — snap count %, target share, opportunity scores from box scores
- [ ] **Season-long projections** — ROS outlook, not just this week

---

## Phase 4 — OpenClaw / Operator Tooling

- [ ] **On-prem OpenClaw bot** (Telegram) — operator interface to `/internal` routes
  - Trigger agent runs for specific users, bump credits, check queue health
  - Runs on always-on PC; connects via `x-admin-secret` header
  - Estimated effort: 1 session once priorities are confirmed
- [ ] **Weekly operator digest** — Telegram summary of signups, runs, errors, revenue
- [ ] **Per-user OpenClaw assistant** (Phase 4+) — personal proactive agent for paid users
  - Auto-runs team eval weekly + notifies via Telegram/Discord
  - Requires: per-user agent state table + cron scheduling + notification delivery

---

## Phase 5 — Browse-Mode Agents (Orgo VMs)

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
| FantasyPros `contentLinks` are static URLs | Medium | Replace with real ContentItem DB queries in Phase 3 |
