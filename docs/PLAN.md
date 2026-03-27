# Plan

> Last updated: 2026-03-27
> Canonical planning document. Keep roadmap and future implementation plans here only.

---

## Review backlog — 2026-03-27

Capture follow-ups while reviewing the latest pushed work. When something is ready to schedule, move it into **Near-Term Roadmap** or a focused doc (e.g. `docs/PLAN_*.md`).

- _(add items as you review)_

**Recent commits for context** (newest first): ingestion SSoT & tier-0 agents, directory feed APIs & ESPN/Yahoo jobs, directory trending/custom feeds, learning pipeline & chat continuity, agentic loop & chat UI, Reddit/ESPN/Odds connectors, Telegram agent daemon.

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
