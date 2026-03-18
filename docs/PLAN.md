# Plan

> Last updated: 2026-03-18
> Canonical planning document. Keep roadmap and future implementation plans here only.

---

## Near-Term Roadmap

### Social Ingestion Expansion
- Add a **Reddit ingestion feed** into the existing `ContentSource` -> `ContentItem` -> `ContentPlayerMention` pipeline.
- Initial target source: `r/fantasyfootball` (expand to curated subreddit allowlist after validation).
- Keep existing RSS and YouTube ingestion unchanged unless a blocker is found.

### Twitter/X Split Strategy
- Keep **official X API** for write actions only (scheduled posts, replies, account auth/token lifecycle via `x-engine`).
- Add a separate **Twitter/X ingestion feed** for curated account monitoring (watcher/scraper path) as read-only source ingestion.
- Ingest tweet URLs and post metadata as source content for downstream agent/news consumption.

### Reddit Engine (Stub)
- Add a `reddit_engine` scaffold parallel to `x-engine` with read-first capabilities.
- Posting should start as manual-approval workflow (no autonomous posting behavior in initial phase).
