# Architecture

> Last updated: 2026-03-26
> Source of truth for system structure. Update this file whenever apps, packages, routes, agents, ingestion jobs, or DB models change.
> Planning/roadmap items live in `docs/PLAN.md`.

---

## 1. System Overview

```mermaid
graph TD
    subgraph Clients["Clients (Vercel)"]
        RM["apps/rostermind\nNext.js 15 — AI Chat + Agent UI"]
        DIR["apps/directory\nNext.js 15 — Public Player Directory"]
        ADM["apps/admin\nNext.js 15 — Internal Dashboard"]
    end

    subgraph Render["Render (Hosted Services)"]
        API["apps/api\nFastify REST API :3001"]
        WRK["apps/worker\nBullMQ Background Worker"]
        PG[("Render Postgres\nPrimary datastore")]
        RD[("Render Key Value\nRedis — BullMQ backing")]
    end

    subgraph ExternalAuth["Auth & Billing"]
        CLK["Clerk\nAuth + User Sync"]
        STR["Stripe\nSubscriptions + Checkout"]
    end

    subgraph DataSources["External Data Sources"]
        SLP["Sleeper API\nPlayers, Rosters, Leagues\nTrending, Transactions"]
        FP["FantasyPros API\nRankings, Projections\nInjuries, News, Player IDs"]
        FC["FantasyCalc API\nTrade Values"]
        DD["Dynasty Daddy API\nKTC Values + Trade Volume"]
        FFC["FF Calculator\nADP Data"]
        YT["YouTube API\nVideo Content"]
        RSS["RSS Feeds\nNews Articles"]
        TWT["Twitter/X API\nSocial Content"]
        LLM["Anthropic\nClaude Haiku / Sonnet"]
    end

    subgraph Monitoring["Observability"]
        SNT["Sentry\nError Tracking"]
    end

    RM -->|HTTPS REST| API
    DIR -->|HTTPS REST| API
    ADM -->|HTTPS REST + x-admin-secret| API

    API -->|Prisma| PG
    API -->|BullMQ enqueue| RD
    RD -->|BullMQ consume| WRK
    WRK -->|Prisma| PG

    CLK -->|Webhook user.created/updated| API
    STR -->|Webhook checkout.completed| API
    API -->|Checkout session| STR

    WRK -->|Fetch data| SLP
    WRK -->|Fetch data| FP
    WRK -->|Fetch data| FC
    WRK -->|Fetch data| DD
    WRK -->|Fetch data| FFC
    WRK -->|Fetch data| YT
    WRK -->|Fetch data| RSS
    WRK -->|Fetch data| TWT
    WRK -->|LLM calls| LLM
    API -->|Intent + followup LLM calls| LLM

    API -.->|Error reporting| SNT
    WRK -.->|Error reporting| SNT
```

---

## 2. Monorepo Package Graph

```mermaid
graph LR
    subgraph Apps
        RM["apps/rostermind"]
        DIR["apps/directory"]
        ADM["apps/admin"]
        API["apps/api"]
        WRK["apps/worker"]
    end

    subgraph Packages
        AG["packages/agents"]
        CN["packages/connectors"]
        DB["packages/db"]
        SH["packages/shared"]
    end

    RM --> SH
    DIR --> DB
    DIR --> SH
    ADM --> SH
    API --> AG
    API --> CN
    API --> DB
    API --> SH
    WRK --> AG
    WRK --> CN
    WRK --> DB
    WRK --> SH
    AG --> CN
    AG --> DB
    AG --> SH
    CN --> SH
    DB --> SH
```

---

## 3. Agent Execution Flow

```mermaid
sequenceDiagram
    actor User
    participant RM as apps/rostermind
    participant API as apps/api
    participant Redis
    participant WRK as apps/worker
    participant DB as Postgres
    participant LLM as Anthropic

    User->>RM: Submits agent query
    RM->>API: POST /agents/intent (classify)
    API-->>RM: { agentType, gatheredParams }
    RM->>API: POST /agents/run
    API->>DB: Check runCredits > 0
    API->>Redis: BullMQ enqueue { agentType, userId, params }
    API-->>RM: { jobId, status: "queued" }

    loop Poll
        RM->>API: GET /agents/:jobId
        API-->>RM: { status: "running" }
    end

    Redis->>WRK: Dequeue job
    WRK->>DB: Load AgentConfig (systemPrompt, modelTier)
    WRK->>DB: Load UserPreferences → buildUserContext()
    WRK->>DB: Enrich players (rankings, trade values, injuries)
    WRK->>DB: Inject ContentItems (content mentions for key players)

    alt Live roster required
        WRK->>+Sleeper API: GET /league/:id/rosters
        Sleeper API-->>-WRK: Roster data
    end

    WRK->>LLM: Claude Haiku/Sonnet structured JSON prompt
    LLM-->>WRK: Typed JSON output
    WRK->>DB: Write AgentRun.outputJson, decrement runCredits
    WRK->>DB: track("agent.run.completed")

    RM->>API: GET /agents/:jobId
    API-->>RM: { status: "done", result }
    RM-->>User: Renders agent-specific result component

    opt Follow-up question (no credit cost)
        User->>RM: Follow-up message
        RM->>API: POST /agents/:id/followup
        API->>LLM: Prior result as context + new question
        LLM-->>API: Response
        API-->>RM: Follow-up reply
    end
```

---

## 4. Data Ingestion Pipeline

```mermaid
graph TD
    SCHED["Scheduler\n(Worker startup — BullMQ cron)"]

    SCHED -->|Daily 6am ET| PR["PlayerRefreshJob\nSleeper /players/nfl"]
    SCHED -->|Every 30 min| IR["InjuryRefreshJob\nSleeper injury statuses"]
    SCHED -->|Hourly| TR["TrendingRefreshJob\nSleeper trending add/drop"]
    SCHED -->|Every 30 min| CR["ContentRefreshJob\nRSS feeds → articles"]
    SCHED -->|Every 2h| RED["RedditRefreshJob\n+ on-demand RedditBackfillJob"]
    SCHED -->|Every 2 hours| YR["YouTubeRefreshJob\nYouTube channel videos"]
    SCHED -->|Every 6 hours| FPN["FP News RefreshJob\nFantasyPros news + blurbs"]
    SCHED -->|Every 12 hours| FPI["FP Injuries RefreshJob\nFantasyPros injury probability"]
    SCHED -->|Daily 8am ET| TRX["TradeRefreshJob\nSleeper league transactions"]
    SCHED -->|Tue 9am ET| RR["RankingsRefreshJob\nSleeper searchRank proxy"]
    SCHED -->|Tue 9am ET| FPS["FP Player ID Sync\nFantasyPros player ID mappings"]
    SCHED -->|Tue+Fri 2:30pm UTC| ESR["ESPN Rankings RefreshJob\nPlayerRanking espn"]
    SCHED -->|Tue+Fri 2:45pm UTC| YAR["Yahoo Rankings RefreshJob\nPlayerRanking yahoo"]
    SCHED -->|Tue+Fri 9am ET| FPR["FP Rankings RefreshJob\nECR tiers, ownership, per-format"]
    SCHED -->|Tue+Fri 10am ET| FPP["FP Projections RefreshJob\nWeekly + ROS projected pts"]
    SCHED -->|Tue 10:30am ET| ADP["ADPRefreshJob\nFantasy Football Calculator ADP"]
    SCHED -->|Tue 10am ET| TVC["TradeValuesRefreshJob\nFantasyCalc dynasty/redraft values"]
    SCHED -->|Tue 11am ET| DDR["DynastyDaddyRefreshJob\nKTC + DD trade values + volume"]
    SCHED -->|Monthly 1st| CRF["CreditsRefillJob\nReset paid users to 50 credits"]

    PR --> Player["Player\nPlayerAlias\nPlayerExternalId"]
    IR --> Player
    TR --> TrendingPlayer["TrendingPlayer"]
    CR --> Content["ContentItem\nContentPlayerMention\nContentSource"]
    RED --> Content
    YR --> Content
    FPN --> Content
    FPI --> Player
    TRX --> TradeTransaction["TradeTransaction"]
    RR --> PlayerRanking["PlayerRanking"]
    FPS --> PlayerExternalId["PlayerExternalId"]
    ESR --> PlayerRanking
    YAR --> PlayerRanking
    FPR --> PlayerRanking
    FPP --> PlayerProjection["PlayerProjection"]
    ADP --> PlayerRanking
    TVC --> PlayerTradeValue["PlayerTradeValue\nsource=fantasycalc"]
    DDR --> PlayerTradeValue2["PlayerTradeValue\nsource=ktc / dynastydaddy\nPlayerTradeVolume"]
    CRF --> User["User.runCredits"]
```

**Operator surface:** `packages/shared/src/ingestion-registry.ts` (`INGESTION_JOB_REGISTRY`) is the single source of truth for every `IngestionJobType`: labels, schedules, and which jobs register BullMQ repeat schedulers. On startup the worker calls `assertIngestionRegistryComplete()` then registers cron from `INGESTION_SCHEDULED_JOB_ENTRIES`. Admin’s `INGESTION_JOB_CATALOG` is derived from the same registry (not hand-maintained). `POST /internal/ingestion/trigger` accepts any `IngestionJobType` from `@rzf/shared` (same allowlist as the worker). Each ingestion execution writes a row to `IngestionJobRun` (audit); Admin **Queue → Ingestion** lists BullMQ jobs and paginates DB runs with **Retry**. **On-demand** jobs (e.g. `reddit_backfill`, `season_stats_refresh`) have no repeat scheduler — trigger via API or Admin. Directory home feed uses cursor pagination (`/api/feed`) with client “Load more”; player profiles paginate mentions via `/api/players/[id]/mentions`.

---

## 5. Agent Roster

```mermaid
graph LR
    subgraph Live["Live Agents (Phase 1)"]
        TE["TeamEvalAgent\nRoster grade + position grades\n+ content links"]
        IW["InjuryWatchAgent\nDeterministic — no LLM\nRisk flags for starters"]
        WV["WaiverAgent\nRanked pickup/drop recs\ntailored to roster gaps"]
        LN["LineupAgent\nWeekly lineup optimizer\nwith matchup analysis"]
        TA["TradeAnalysisAgent\nAccept/reject/counter\n+ value score (Sonnet)"]
        PS["PlayerScoutAgent\nDeep per-player eval\n+ trade value context"]
        PC["PlayerCompareAgent\nSide-by-side player comparison\n+ buy/sell/hold verdict"]
    end

    subgraph Routing["Intent Routing (Synchronous)"]
        INT["IntentAgent\nPOST /agents/intent\nClassifies free-text → agentType + params"]
    end

    subgraph Future["Future (see docs/PLAN.md)"]
        ND["NewsDigestAgent\nPlanned in docs/PLAN.md"]
    end

    INT --> TE & IW & WV & LN & TA & PS & PC
```

---

## 6. Key Database Models

```mermaid
erDiagram
    User ||--o| SleeperProfile : has
    User ||--o| UserPreferences : has
    User ||--o{ AgentRun : runs
    User ||--o{ TokenBudget : tracks
    User ||--o{ AnalyticsEvent : generates
    User ||--o{ CustomFeed : saves
    User ||--o{ ChatSession : has

    ChatSession ||--o{ ChatMessage : contains

    AgentRun {
        string agentType
        enum status
        json inputJson
        json outputJson
        int tokensUsed
        int confidenceScore
        json sourcesUsed
    }

    Player ||--o{ PlayerRanking : has
    Player ||--o{ PlayerProjection : has
    Player ||--o{ TrendingPlayer : has
    Player ||--o{ PlayerAlias : has
    Player ||--o{ PlayerExternalId : has
    Player ||--o{ ContentPlayerMention : mentioned_in
    Player ||--o{ PlayerTradeValue : has
    Player ||--o| PlayerTradeVolume : has
    Player ||--o{ PlayerSeasonStats : has

    ContentSource ||--o{ ContentItem : produces
    ContentItem ||--o{ ContentPlayerMention : tags
    ContentItem ||--o{ ContentItem : chunks

    XAccount ||--o{ ScheduledPost : queues
    XAccount ||--o{ TweetMonitorRule : monitors
    XAccount ||--o{ PendingReply : captures
```

---

## 7. Deployment

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

### Directory app API routes (Next.js Route Handlers)

Authenticated custom feeds (Clerk): `GET`/`POST` `/api/custom-feeds`, `PATCH`/`DELETE` `/api/custom-feeds/[id]`, `GET` `/api/custom-feeds/[id]/items` (cursor pagination). Trending topic chips use server-side aggregation + `unstable_cache` on the home page (`getTrendingTopics`).

---

## 8. Security Notes

- All secrets validated at startup via Zod (`packages/shared/src/env.ts`) — no raw `process.env` access
- Clerk JWTs verified on all protected API routes
- Admin routes (`/internal/*`) require `User.role === "admin"` checked server-side
- Admin dashboard (`apps/admin`) uses `ADMIN_SECRET` header — no Clerk dependency
- Stripe webhook signatures verified via Svix before processing
- Clerk webhook signatures verified via Svix before processing
