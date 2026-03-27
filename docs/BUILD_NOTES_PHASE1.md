# Build notes — Phase 1 (social ingestion, Admin/API, tier 0)

> Working log for follow-up planning. Last updated: 2026-03-26.

## Decisions

- **Home feed pagination:** Initial page size **40**, aligned with `GET /api/feed` (`PAGE_SIZE`). “Load more” uses a global cursor (`publishedAt` + `id` desc). Client-side stream/source/search filters apply only to **loaded** pages (documented in the feed UI).
- **Player mentions:** First **20** mentions SSR; further pages via `/api/players/[id]/mentions` with the same cursor semantics.
- **Trade ledger query:** Player profile and trade-analysis recent-trades prompt use raw SQL / JSONB `?` on `trade_transactions.adds` and `drops` for the player `sleeperId`. Staging check: `docs/sql/explain-trade-transactions-by-player.sql` (EXPLAIN ANALYZE). If volume grows, revisit GIN on `adds`/`drops` or a normalized join table.

## Deferred / watch

- **Token budgets:** Measure tier-0 context blocks in production logs (`buildTierZeroContext` / agent injectors) before adding embedding retrieval.
- **SEASON_STATS_REFRESH:** Remains **manual only** in `INGESTION_JOB_CATALOG` until a safe cron cadence is chosen (heavy multi-season pull).

## Surprises

- Nitter RSS depth for X is shallow; ~2 weeks per handle is not achievable without official API or many accounts — see `docs/INGESTION_REDDIT_TWITTER.md`.

## Track A — Phase 2 hygiene (signed off 2026-03-26)

- Ingestion registry SSoT + worker scheduler parity; agents use tier-0 rankings (multi-source) in team-eval, player-compare, waiver, and trade-analysis (`buildTierZeroContext` + tool output). Admin monorepo tracing root + rostermind internal runs `useEffect` deps cleaned; trade EXPLAIN script added as above.
