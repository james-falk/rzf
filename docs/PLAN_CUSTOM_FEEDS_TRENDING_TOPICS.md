# Plan: Custom Feeds (End-to-End) + Reddit/X Hardening + Trending Topic Hashtags

**Last updated:** 2026-03-26  
**Status:** Planning — not yet implemented in production UI/API.

This document is the execution plan for (1) full custom feeds on the Directory, (2) any extra work for Reddit and X/Twitter ingestion, (3) five trending topic chips on the main feed driven by real tags, and (4) a **Featured Content** carousel above the main feed (auto-advance every **10 seconds**, centered active slide with adjacent slides “peeking”).

---

## 1. Current state (facts)

### Custom feeds
- **DB:** `CustomFeed` exists (`userId`, `name`, `config` JSON with intended shapes: Sleeper league, player IDs, team abbr, sources, content types).
- **Directory UI:** Tab exists; **no** create/list/update/delete API, **no** builder, **no** enforcement of “2 free / 5 Pro” at the API layer.
- **Sleeper:** Account page can link Sleeper for the user; **not** wired into `CustomFeed.config` or feed queries.

### Content tagging
- **`ContentItem.topics`** is `String[]` and is **already populated** in several connectors via keyword heuristics (e.g. `packages/connectors/src/rss/index.ts` — `inferTopics()` for injury, trade, waiver, lineup, breakout, depth_chart, rankings).
- **Gaps:** No consistent tags for **seasonal narratives** (e.g. `free_agency`, `rookie_draft`, `nfl_combine`) across all platforms; Reddit uses the same RSS pipeline so it inherits RSS `inferTopics` once extended.

### Reddit & X/Twitter ingestion
- **Worker:** `REDDIT_REFRESH`, `REDDIT_SEED`, `TWITTER_INGESTION_REFRESH`, `TWITTER_SEED` in `apps/worker` (`ingestion.worker.ts`, `scheduler.ts`).
- **Reddit:** Public subreddit RSS; `RedditConnector.seedDefaultSources()` registers sources (`packages/connectors/src/reddit/index.ts`).
- **X/Twitter:** Nitter RSS + optional X API path — depends on **active `ContentSource` rows**, **scheduler running**, and **Nitter/instance availability** (operational risk, not app code only).

### Trending today
- **`TrendingPlayer`** is for **players**, not **topic hashtags**.
- There is **no** “top 5 topic hashtags” query or UI component on the home feed yet.

### Featured Content (today)
- [`apps/directory/src/app/page.tsx`](apps/directory/src/app/page.tsx) already loads **partner / featured** content into a static **grid** (`featuredContent` from sources with `featured: true`). There is **no** carousel, no auto-rotation, and styling does not match the new “FEATURED CONTENT” + peeking slides mockup.

---

## 2. Custom feeds — implementation phases

### Phase A — API & limits (foundation)
| Task | Detail |
|------|--------|
| **A1** | Add authenticated REST routes under Directory Next API or `apps/api` (prefer one place): `GET/POST/PATCH/DELETE` for `/custom-feeds` scoped to Clerk user → DB `user.id`. |
| **A2** | Enforce limits: **2** feeds for `tier === 'free'`, **5** for `pro` / `premium` (align with product; adjust if billing changes). |
| **A3** | Zod schema for `config`: `feedType: 'sleeper' \| 'players' \| 'team' \| 'sources'`, optional `sleeperLeagueId`, `playerIds[]`, `teamAbbr`, `sourceIds[]`, `contentTypes[]`. |
| **A4** | Server-side validation: max player IDs (e.g. 10), allowed teams from NFL set, source IDs must belong to active `ContentSource`. |

### Phase B — Feed resolution (what a “custom feed” returns)
| Task | Detail |
|------|--------|
| **B1** | Query helper: given `CustomFeed.config`, return `ContentItem` rows (join `ContentPlayerMention` / `Player` as needed) ordered by `publishedAt` desc, paginated (`cursor` or `page`). |
| **B2** | **`players`:** filter items that mention any of `playerIds` (existing mention graph). |
| **B3** | **`team`:** filter by team abbreviation on `Player` for mentions, or tag-driven filter if team tags exist on items. |
| **B4** | **`sleeper`:** resolve **connected** `SleeperProfile` → roster player IDs for user’s chosen league → same as multi-player filter. Requires reliable league + roster sync (may reuse RosterMind/Sleeper APIs already in monorepo). |
| **B5** | **`sources`:** restrict to `sourceIds` + optional content types (subset of main feed). |

### Phase C — Directory UI
| Task | Detail |
|------|--------|
| **C1** | Replace placeholder **Custom Feeds** tab with list of saved feeds + “Create feed” wizard (steps: type → params → name). |
| **C2** | Embedded **feed view** (cards) or navigate to `/feed/custom/[id]` reading resolved items from B1. |
| **C3** | Empty states, error states, and loading for API failures. |

### Phase D — Sleeper linkage (explicit)
| Task | Detail |
|------|--------|
| **D1** | Ensure Directory user has **same** `User` / `SleeperProfile` model as RosterMind if sharing DB (already true in monorepo). |
| **D2** | Document required env + cron: roster refresh so `sleeper` feeds are not stale. |
| **D3** | Optional: “Sync now” button calling existing Sleeper profile refresh if present. |

---

## 3. Reddit & X/Twitter — additional work (beyond “it runs”)

These are **operational and product** items to make feeds dependable and complete.

### Reddit
| Item | Why |
|------|-----|
| **R1 — Monitoring** | Alert if `REDDIT_REFRESH` fails or returns 0 new items for N consecutive runs (dead RSS, Reddit blocking, URL change). |
| **R2 — Source hygiene** | Admin can toggle subreddits; document how to add `/r/.rss` URLs; rate-limit friendly `limit=` on feeds. |
| **R3 — Topic parity** | Extend shared `inferTopics()` so Reddit posts get same **new** tags as RSS (see §4). |

### X / Twitter
| Item | Why |
|------|-----|
| **X1 — Nitter fragility** | Public Nitter instances change or block; maintain **list of RSS base URLs** or fallback host in config; health check job. |
| **X2 — X API path** | If using official API, ensure keys, quotas, and **compliance** with posting/read scopes; document cost. |
| **X3 — Source seeding** | Run `TWITTER_SEED` in each env after deploy; verify `ContentSource` rows in DB. |
| **X4 — Topic parity** | If Twitter items go through RSS text, same `inferTopics()` applies once unified. |

---

## 4. Trending topic hashtags (five slots) + tagging

### 4.1 Product behavior
- Show **five** clickable chips (e.g. `#FreeAgency`, `#RookieDraft`) **above** the main feed on the Directory home page.
- Chips reflect **what’s hot across all ingested sources** in a rolling window (e.g. last **48–72 hours**).
- Clicking a chip **filters** the feed to items whose `topics` array **contains** that slug (or a mapped key).

### 4.2 Computing “trending”
**Recommended v1 (simple, explainable):**
1. Normalize topic slugs to lowercase snake_case: `free_agency`, `rookie_draft`, `nfl_combine`, etc.
2. SQL or Prisma aggregation: unnest `topics` on `ContentItem` where `publishedAt >= now() - interval '72 hours'`, `GROUP BY topic`, `ORDER BY COUNT(*) DESC`, `LIMIT 5`.
3. Optionally **merge synonyms** in app code (`fa` → `free_agency`) before display.
4. Cache result in **Redis** or **Next `unstable_cache`** with TTL **15–30 min** to avoid heavy queries per page view.

**v2 (smoothing):** Weight by `importanceScore`, recency decay, or boost tier-1 sources.

### 4.3 Extending tags (so trending is meaningful)
Extend **shared** `inferTopics()` (RSS baseline, reused by Reddit via same pipeline; mirror in YouTube/ESPN helpers where duplicated):

| Tag slug | Example patterns |
|----------|------------------|
| `free_agency` | free agency, signing, re-sign, contract, cap space |
| `rookie_draft` | rookie, draft class, combine, pro day, nfl draft |
| `playoffs` | playoff, wild card, divisional, super bowl |
| `injury` | (already) |
| `trade` | (already) |

Add **team** tags only if we introduce a controlled vocabulary (e.g. normalize `KC` → `team_kc`) to avoid explosion of tokens — **phase 2**.

**Player tags:** Already represented via **`ContentPlayerMention`**; optional denormalized `playerIds[]` on `ContentItem` for faster filters (denormalization job).

### 4.4 UI wiring
- **`FeedWithFilters`:** Add state `selectedTopic: string | null` and filter `items` where `item.topics?.includes(selectedTopic)` (items must serialize `topics` from server — confirm `page.tsx` mapping includes `topics`).
- **Home `page.tsx`:** Run trending query (or fetch from small API route) and pass **top 5** topic keys + display labels into the client.

### 4.5 Schema changes
- **None required** if `topics` on `ContentItem` is sufficient.
- Optional: `TrendingTopicSnapshot` table for analytics/history (not required for v1).

### 4.6 Player page — remove Pro subscription gate (temporary / testing)

**Goal:** While testing, users should be able to scroll the player profile and **see all ingested content** (not only the first three mentions). Today, additional items are behind a paid wall.

**Current behavior:** [`apps/directory/src/app/players/[id]/page.tsx`](apps/directory/src/app/players/[id]/page.tsx) splits `contentMentions` into `freeMentions` (first 3) and `proMentions` (rest). The **“More coverage”** block wraps `proMentions` in [`ProGate`](apps/directory/src/components/ProGate.tsx), which blurs content and requires a Pro subscription.

**Planned change (temporary for QA):**
- **Remove** the `<ProGate>` wrapper (or short-circuit `ProGate` to always render children when `process.env.NEXT_PUBLIC_PLAYER_PRO_GATE === 'false'`).
- Render **all** mention rows with the same card component as the free section (`PlayerNewsMentionCard`), either:
  - **Option A:** Single combined “Recent news & analysis” list (all mentions, one column), or
  - **Option B:** Keep two subsections but both fully visible (no blur/paywall).
- **Before production:** Re-enable monetization — restore `ProGate` or default env to gate on in production.

**Optional env flag:** `NEXT_PUBLIC_PLAYER_PRO_GATE` — when `false`, show full content; when `true` or unset, preserve current Pro behavior (lets you test in preview without flipping code).

### 4.7 Infinite scroll — main feed + player mentions

**Goal:** Avoid loading huge lists up front; load an initial window (e.g. **20 items**), then **append more** as the user scrolls near the bottom (infinite scroll).

#### Main feed (Directory home)

**Current behavior:** [`apps/directory/src/app/page.tsx`](apps/directory/src/app/page.tsx) loads a large batch in one query (`HOME_FEED_ITEM_LIMIT`, currently **500**; `take` matches that). [`FeedWithFilters`](apps/directory/src/components/FeedWithFilters.tsx) receives the full array client-side.

**Planned behavior:**
- **Initial load:** Server component (or first fetch) returns only the **first page** (e.g. `take: 20`–`50` — align with player mentions page size for consistency).
- **Pagination:** **Cursor-based** preferred: order by `publishedAt` desc, then stable tie-breaker (`id`); pass `cursor` = last item’s `(publishedAt, id)` (or opaque cursor string) to the next request. Offset/`skip` is acceptable for v1 if simpler, at the cost of consistency if data shifts during scroll.
- **API:** New route e.g. `GET /api/feed` or `GET /api/content` with query params: `cursor`, `limit`, and later **topic filter** / source filters that mirror `FeedWithFilters` state (or POST with JSON body if filters are heavy).
- **Client:** A **client wrapper** around the feed list (or extend `FeedWithFilters`) uses **`IntersectionObserver`** (sentinel div at bottom) or a small hook library to trigger `fetch(nextPage)` and **append** items to state. Show **loading** row / skeleton at bottom; **“No more items”** when the API returns empty.
- **Filters / trending chips:** Changing filters should **reset** the list and cursor to page 1 (same as a new search). Document edge cases when topic filter + infinite scroll combine (§4.4).

#### Player page — mentions list

**Current behavior:** [`apps/directory/src/app/players/[id]/page.tsx`](apps/directory/src/app/players/[id]/page.tsx) loads `contentMentions` with **`take: 20`** in the `findUnique` `include`. Everything beyond 20 is never shown until pagination exists.

**Planned behavior:**
- **Initial SSR:** Keep first **20** mentions in the server query for fast first paint (or reduce to 10–20 consistently with main feed).
- **Load more:** Either:
  - **Option A:** Move mentions into a **client island** that calls `GET /api/players/[sleeperId]/mentions?cursor=&limit=20` (Prisma `findMany` on `ContentPlayerMention` where `playerId` matches, same `orderBy` as today), or
  - **Option B:** **Server Actions** + `useTransition` for “Load more” (simpler than observer; true infinite scroll still needs client observer calling the action or route).
- **Infinite scroll UX:** Same sentinel + append pattern as the main feed; optional compact “Load more” button for accessibility / reduced motion.

#### Shared concerns

- **Deduping:** Ensure appended pages don’t duplicate if the user scrolls fast (ignore duplicate `id`s in client state).
- **Errors:** Retry or toast on fetch failure; don’t clear already-loaded items.
- **SEO / player page:** First page stays in SSR HTML; extra pages are client-only (acceptable for app-like directory).

---

## 5. Featured Content carousel (Directory home)

**Placement:** Immediately **above** the main “All Feed” / `FeedWithFilters` block (and logically **after** hero/trending ticker if present). Replace or refactor the current **Featured** static grid on [`page.tsx`](apps/directory/src/app/page.tsx) so this section is the primary showcase for partner / hand-picked items.

**Visual / UX (from mockup):**
- Section title: **FEATURED CONTENT** (uppercase, accent yellow — align with existing red/yellow directory tokens in [`globals.css`](apps/directory/src/app/globals.css) / [`DESIGN.md`](apps/directory/DESIGN.md)).
- Subtitle: e.g. “Hand-picked fantasy football insights and analysis.”
- **Carousel:** horizontal; **active slide centered** with a **highlight border** (yellow); **previous/next slides partially visible** (“peek”) on left/right.
- **Cards:** large background image (thumbnail or Clearbit/fallback pattern per [`ContentCard`](apps/directory/src/components/ContentCard.tsx)); rounded corners.
- **Badges:** top-left **FEATURED** (pill); top-right content-type pill (e.g. **NEWS** vs **VIDEO**) derived from `contentType` or `topics`.
- **Auto-play:** advance every **10 seconds** (`10000` ms). Pause on hover (optional, recommended for accessibility). Respect `prefers-reduced-motion` (disable autoplay or lengthen interval).

**Library choice (researched):**

| Option | Pros | Cons |
|--------|------|------|
| **[Swiper](https://swiperjs.com/)** (`swiper` + `swiper/react`) | Battle-tested; **centeredSlides**, **slidesPerView** / breakpoints, **loop**, **Autoplay** module with `delay: 10000`, pagination/navigation modules; many demos for “center + peek”. | Larger bundle; **Next.js App Router** often needs **client-only** render (`dynamic(..., { ssr: false })`) or strict client wrapper to avoid hydration mismatches. |
| **[Embla Carousel](https://www.embla-carousel.com/)** (`embla-carousel-react`) | Small, headless; **embla-carousel-autoplay** plugin; good a11y story. | “Peek” layout needs explicit slide width / CSS; more manual than Swiper for the exact mockup. |
| **react-slick** | Familiar API. | Depends on jQuery for full feature set in some setups; less ideal for modern Next 15. |

**Recommendation:** Use **Swiper 11** for fastest match to **centered + peek + autoplay**. Install `swiper` in [`apps/directory`](apps/directory/package.json). Import CSS modules (`swiper/css`, `swiper/css/autoplay`, etc.). Configure roughly:

- `modules={[Autoplay]}` (add `Navigation`, `Pagination` if desired).
- `centeredSlides={true}`, `loop={true}` (if enough slides; hide carousel or don’t loop if &lt; 3 items).
- `slidesPerView` — use a fractional value or `"auto"` with fixed slide widths so neighbors peek (tune with `spaceBetween`, `breakpoints` for mobile vs desktop).
- `autoplay={{ delay: 10000, disableOnInteraction: false, pauseOnMouseEnter: true }}`.
- Wrap in a **client component** e.g. `FeaturedContentCarousel.tsx`; load Swiper only on client.

**Data:** Reuse the same query logic as today: items from **featured / partner** sources (`featuredContent` pipeline). Cap slide count (e.g. 6–12) to avoid huge loops.

**Accessibility:** Keyboard focus on slide links; visible focus ring; `aria-live="polite"` optional for slide changes; reduce motion per `prefers-reduced-motion`.

**Testing:** Manual + optional smoke test that autoplay interval is 10s; mobile swipe still works (Swiper touch).

---

## 6. Suggested order of execution

1. **Player page — ungate Pro content** — remove or env-toggle [`ProGate`](apps/directory/src/components/ProGate.tsx) on [`players/[id]/page.tsx`](apps/directory/src/app/players/[id]/page.tsx) for testing (see §4.6).  
2. **Infinite scroll** — main feed + player mentions: paginated API + client append (see §4.7); reduces initial payload and unlocks “beyond 20” mentions on player pages.  
3. **Featured carousel** — Swiper-based UI + replace featured grid on [`page.tsx`](apps/directory/src/app/page.tsx); 10s autoplay + peek layout.  
4. **Tagging** — extend `inferTopics` + verify `topics` passed to Directory feed props.  
5. **Trending** — aggregation query + 5 chips + filter in `FeedWithFilters`.  
6. **Custom feeds API** — limits + CRUD + config validation.  
7. **Custom feeds query layer** — players → team → sources → Sleeper.  
8. **Custom feeds UI** — wizard + list + feed view.  
9. **Reddit/X hardening** — monitoring, Nitter fallback, documentation.

---

## 7. References (code)

- Custom feed model: `packages/db/prisma/schema.prisma` — `CustomFeed`
- Topic inference (RSS): `packages/connectors/src/rss/index.ts` — `inferTopics`
- Worker jobs: `apps/worker/src/workers/ingestion.worker.ts`, `apps/worker/src/scheduler.ts`
- Reddit seed: `packages/connectors/src/reddit/index.ts`
- Directory feed UI: `apps/directory/src/components/FeedWithFilters.tsx`, `apps/directory/src/app/page.tsx`
- Infinite scroll (planned): paginated feed + player mentions API; see §4.7
- Player Pro gate: `apps/directory/src/app/players/[id]/page.tsx`, `apps/directory/src/components/ProGate.tsx`
- Featured carousel (planned): new client component under `apps/directory/src/components/FeaturedContentCarousel.tsx` (or similar), used by `page.tsx`
