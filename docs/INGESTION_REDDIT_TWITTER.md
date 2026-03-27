# Reddit & X/Twitter (Nitter) ingestion — runbook

## Bootstrap (new environment)

**Bootstrap** means having active `ContentSource` rows for social platforms and optionally an initial pull, without hand-written SQL.

1. **Manual / Admin (recommended for production)**  
   Run **Reddit seed** and **Twitter seed** from the Admin Sources job catalog (or `POST /internal/ingestion/trigger` with `reddit_seed` / `twitter_seed`).  
   Then run **Reddit refresh** / **Twitter ingestion** at least once.

2. **Optional auto-seed (dev/staging)**  
   If `AUTO_SEED_SOCIAL_SOURCES=true` on the worker, startup enqueues Reddit/Twitter seed jobs when there are **zero** active sources for that platform. Production should leave this off unless you explicitly want it.

3. **Verify**  
   - Rows in `content_sources` with `platform in ('reddit','twitter')` and `is_active = true`.  
   - Directory **Social** stream (`?stream=social`) shows items after refresh.  
   - Worker env: `NITTER_BASE_URLS` set where Nitter is used (comma-separated bases, no trailing slashes).

## Reddit

1. **Seed sources (once per environment)**  
   Job `REDDIT_SEED` (or `RedditConnector.seedDefaultSources()`).  
   Confirm: `content_sources` with `platform = 'reddit'` and `is_active = true`.

2. **Scheduler**  
   `REDDIT_REFRESH` runs on a 2-hour schedule (`reddit-refresh-2h` in `apps/worker/src/scheduler.ts`).  
   Items flow through `RSSConnector.run('reddit')` — same pipeline as RSS, including shared `inferContentTopics()`.

3. **~2 weeks of history (backfill)**  
   Subreddit RSS only returns a small recent window; repeating refresh does not walk backward in time. Use the **`REDDIT_BACKFILL`** job (one-shot or occasional): paginates `new.json` up to ~14 days per active Reddit source, idempotent on `sourceUrl`. Trigger from Admin catalog or `POST /internal/ingestion/trigger` with `reddit_backfill`.

4. **Monitoring**  
   If there is at least one active Reddit source but **zero inserts** for **three consecutive runs**, the worker logs a warning. Investigate: dead RSS URL, Reddit blocking, or subreddit URL changes.

## X / Twitter (Nitter RSS)

1. **Seed (once per environment)**  
   `TWITTER_SEED` — registers default handles via `seedNitterSources()` in `packages/connectors/src/twitter/nitter.ts`.

2. **Ingestion**  
   `TWITTER_INGESTION_REFRESH` calls `RSSConnector.run('twitter')` for all active `platform = 'twitter'` sources.  
   Admin Source Manager normalizes `@handle` / `x.com/...` to a Nitter RSS URL using shared helpers in `@rzf/shared`.

3. **Nitter base URLs**  
   Env **`NITTER_BASE_URLS`** (comma-separated, no trailing slashes), e.g.  
   `https://nitter.cz,https://nitter.privacydev.net`  
   When unset, built-in public instances are used. Instances often break — swap without code changes.

4. **~2 weeks on X**  
   Nitter RSS exposes only a **small recent window** per handle. You will **not** get two weeks of depth without official X API ingestion, many accounts, or new scraping work. Expectations for operators are documented here and in Admin copy.

5. **Official X API path**  
   If `TweetMonitorRule` + X account tokens exist, the worker also ingests search results and applies `inferContentTopics()` to tweet text (`apps/worker/src/workers/ingestion.worker.ts`).

## Related docs

- ESPN/Yahoo rankings: [INGESTION_ESPN_YAHOO.md](./INGESTION_ESPN_YAHOO.md)  
- Tier 0 vs content tiers: [DATA.md](./DATA.md)  
- Full job list: `packages/shared/src/types/ingestion-catalog.ts` (`INGESTION_JOB_CATALOG`)

## Verification checklist

- [ ] `REDDIT_SEED` / `TWITTER_SEED` run after deploy (or auto-seed if enabled)  
- [ ] `content_sources` rows for reddit + twitter  
- [ ] `REDDIT_REFRESH` + Twitter ingestion have run; optional `REDDIT_BACKFILL` once  
- [ ] Worker logs / `IngestionJobRun` show expected outcomes  
- [ ] Directory **Social** stream shows items (`?stream=social`)  
- [ ] `NITTER_BASE_URLS` set in environments that use Nitter  
