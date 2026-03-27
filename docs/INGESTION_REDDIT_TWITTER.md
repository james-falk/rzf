# Reddit & X/Twitter (Nitter) ingestion — runbook

## Reddit

1. **Seed sources (once per environment)**  
   Run the worker job `REDDIT_SEED` (or call `RedditConnector.seedDefaultSources()` from a script).  
   Confirm rows exist: `content_sources` with `platform = 'reddit'` and `is_active = true`.

2. **Scheduler**  
   `REDDIT_REFRESH` runs on a 2-hour schedule (`reddit-refresh-2h` in `apps/worker/src/scheduler.ts`).  
   Items flow through `RSSConnector.run('reddit')` — same pipeline as RSS, including shared `inferContentTopics()`.

3. **Monitoring**  
   After each refresh, if there is at least one active Reddit source but **zero inserts** for **three consecutive runs**, the worker logs a warning. Investigate: dead RSS URL, Reddit blocking, or subreddit URL changes. Toggle sources in Admin if needed.

## X / Twitter (Nitter RSS)

1. **Seed (once per environment)**  
   Run `TWITTER_SEED` — registers default handles via `seedNitterSources()` in `packages/connectors/src/twitter/nitter.ts`.

2. **Ingestion**  
   `TWITTER_INGESTION_REFRESH` calls `RSSConnector.run('twitter')` for all active `platform = 'twitter'` sources.  
   Nitter RSS URLs are built from configurable base URLs (see below).

3. **Nitter base URLs**  
   Set optional env **`NITTER_BASE_URLS`** (comma-separated, no trailing slashes), e.g.  
   `https://nitter.cz,https://nitter.privacydev.net`  
   When unset, built-in public instances from `nitter.ts` are used. Swap instances when a host goes offline without code changes.

4. **Official X API path**  
   If `TweetMonitorRule` + X account tokens exist, the worker also ingests search results and applies `inferContentTopics()` to tweet text (`apps/worker/src/workers/ingestion.worker.ts`).

## Verification checklist

- [ ] `REDDIT_SEED` / `TWITTER_SEED` run after deploy  
- [ ] `content_sources` rows for reddit + twitter  
- [ ] Worker logs show non-zero inserts after a full news cycle (or acceptable zeros if feeds are deduped)  
- [ ] New `ContentItem.topics` include extended tags (`free_agency`, `rookie_draft`, etc.) for new RSS/API items  
