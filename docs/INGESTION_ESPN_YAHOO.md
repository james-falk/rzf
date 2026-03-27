# ESPN & Yahoo fantasy rankings ingestion

## ESPN (`ESPN_RANKINGS_REFRESH`)

- **Schedule:** Tuesday and Friday (see `espn-rankings-refresh` in `apps/worker/src/scheduler.ts`).
- **Storage:** `PlayerRanking` rows with `source = 'espn'`, mapped via `PlayerExternalId` (`source = 'espn'`) from FantasyPros ID sync.
- **Env:** `ESPN_FANTASY_COOKIE` — session cookie string for `fantasy.espn.com` JSON endpoints. If unset or invalid, the worker logs a warning and skips the job.
- **Trigger:** Admin Sources job catalog, or `POST /internal/ingestion/trigger` with `{ "type": "espn_rankings_refresh" }`.

## Yahoo (`YAHOO_RANKINGS_REFRESH`)

- **Schedule:** Tuesday and Friday (see `yahoo-rankings-refresh` in `apps/worker/src/scheduler.ts`).
- **Storage:** `PlayerRanking` with `source = 'yahoo'`, mapped via `PlayerExternalId` (`source = 'yahoo'`).
- **Env:** Yahoo Fantasy API OAuth — `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`, `YAHOO_REFRESH_TOKEN` in `packages/shared/src/env.ts`. Without these, the worker skips with a warning.
- **Trigger:** Same as ESPN via Admin or internal API.

## Operations

- After deploy, confirm `IngestionJobRun` rows for these types in Admin **Queue → Ingestion** (DB audit table).
- On failure, use **Retry** on the run row or re-trigger the job type; jobs are idempotent for a given week/season upsert key.
