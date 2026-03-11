# Deployment

> Last updated: 2026-03-06

## Production Architecture

| Service | Platform | URL |
|---------|----------|-----|
| `apps/rostermind` | Vercel | `your-domain.vercel.app` or custom domain |
| `apps/directory` | Vercel | `your-domain.vercel.app` or custom domain |
| `apps/api` | Render Web Service | `rzf-api.onrender.com` |
| `apps/worker` | Render Background Worker | (no public URL) |
| Postgres | Render Managed Postgres | Internal Render connection string |
| Redis | Render Key Value | Internal Redis URL (`redis://...`) |

---

## Local Development Setup

### Prerequisites

- Node.js 20+ (`node --version`)
- pnpm 9+ (`pnpm --version`) — install: `npm install -g pnpm`
- Docker Desktop (for local Postgres + Redis)

### First-time setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd fantasy-workspace

# 2. Install all dependencies
pnpm install

# 3. Copy env template and fill in values
cp .env.example .env
# Edit .env with your local values (see Environment Variables section below)

# 4. Start local Postgres + Redis
docker compose up -d

# 5. Run DB migrations
pnpm db:migrate

# 6. Start all services in parallel
pnpm dev
```

### Running individual services

```bash
pnpm --filter @rzf/api dev       # Fastify API on :3001
pnpm --filter @rzf/worker dev    # BullMQ worker
pnpm --filter @rzf/rostermind dev # Next.js on :3000
pnpm --filter @rzf/directory dev  # Next.js on :3002
```

---

## Render Deployment

### Setup (one-time)

1. Create a Render account at [render.com](https://render.com)
2. Connect your GitHub repo
3. Create these services (all from the same repo):

**Postgres Database** (`rzf-db`)
- Type: PostgreSQL
- Plan: Starter ($7/mo)
- Copy the **Internal Database URL** for use in API + Worker env vars

**Web Service** (`rzf-api`)
- Type: Web Service
- Runtime: Node
- Build Command: `pnpm install && pnpm --filter @rzf/api build`
- Start Command: `node apps/api/dist/index.js`
- Plan: Starter ($7/mo)
- Set environment variables (see below)

**Background Worker** (`rzf-worker`)
- Type: Background Worker
- Runtime: Node
- Build Command: `pnpm install && pnpm --filter @rzf/worker build`
- Start Command: `node apps/worker/dist/index.js`
- Plan: Starter ($7/mo)
- Set environment variables (see below)

Alternatively, use `render.yaml` in the repo root for infrastructure-as-code setup.

---

## Vercel Deployment

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Import the GitHub repo
3. Set **Root Directory**: `apps/web`
4. Framework preset: Next.js (auto-detected)
5. Set environment variables (Vercel dashboard → Settings → Environment Variables)
6. Deploy

Vercel auto-deploys on every push to `main`.

---

## Render Key Value Setup

1. In Render, click **New +** → **Key Value**
2. Create instance in the same region as API/Worker
3. Copy the **Internal URL** (`redis://...`)
4. Set `REDIS_URL` in both `rzf-api` and `rzf-worker`

The API and worker normalize short Render Redis host IDs to `red-xxxx.internal` only when running on Render (`RENDER` is set automatically by the platform). Locally, use `REDIS_URL=redis://localhost:6379` (or your own Redis).

---

## Environment Variables

All vars are documented in `.env.example`. Below is the minimum required for each service.

### `apps/api` (Render)
```
DATABASE_URL          # Render Postgres internal URL
REDIS_URL             # Render Key Value internal URL
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
OPENAI_API_KEY
ANTHROPIC_API_KEY
ADMIN_SECRET
API_BASE_URL          # https://rzf-api.onrender.com
CORS_ORIGIN           # comma-separated frontend URLs (optional; defaults to https://rzf-web.vercel.app if unset)
NODE_ENV=production
```

### `apps/worker` (Render)
```
DATABASE_URL
REDIS_URL
OPENAI_API_KEY
ANTHROPIC_API_KEY
WORKER_CONCURRENCY=5
NODE_ENV=production
```

### `apps/rostermind` (Vercel)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_API_BASE_URL   # https://rzf-api.onrender.com
API_BASE_URL               # https://rzf-api.onrender.com
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### `apps/directory` (Vercel)
```
DATABASE_URL
```

---

## OpenClaw Operator Gateway (Local Only)

OpenClaw runs locally on your PC. It is **never deployed publicly**.

### Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather). Save the token.
2. Add `TELEGRAM_BOT_TOKEN` to your local `.env`
3. Uncomment the `openclaw` service in `docker-compose.yml`
4. Start it: `docker compose up openclaw -d`
5. ClawDeck dashboard available at `http://localhost:3002`

OpenClaw connects to production Postgres + API via HTTPS using your `.env` values.

**Example operator commands (DM your bot):**
- "Show me all users who ran agents today"
- "How many free users have 0 credits left?"
- "Grant paid tier to user@email.com"
- "What's the worker queue depth right now?"
- "Re-run team eval for user X"

---

## Developer Tooling

### Claude Code CLI + Frontend Design Plugin

Claude Code is Anthropic's terminal agentic coder — use it for design-heavy UI work.

```bash
# Install (one-time)
npm install -g @anthropic-ai/claude-code

# Install frontend design plugin
claude plugin add anthropic/frontend-design
```

**When to use:**
- Building new pages or components from scratch in `apps/web`
- The `frontend-design` plugin enforces good typography, CSS variable systems, and visual density choices before writing any UI code

### Cursor MCP Servers

Add to `.cursor/mcp.json` for live data access during Cursor sessions:

- **`@modelcontextprotocol/server-postgres`** — Query production DB directly from Cursor chat. Use read-only credentials.
- **`@modelcontextprotocol/server-github`** — Access commit history, PRs, issues from Cursor.

Config file: `.cursor/mcp.json` (in repo root)

### Recommended VS Code / Cursor Extensions

Install all at once: extensions are listed in `.vscode/extensions.json`.

| Extension | Purpose |
|-----------|---------|
| `Prisma.prisma` | Syntax highlighting + auto-format for `.prisma` files |
| `bradlc.vscode-tailwindcss` | Tailwind CSS IntelliSense autocomplete |
| `rangav.vscode-thunder-client` | API testing without leaving the IDE |
| `usernamehw.errorlens` | Inline error display |
| `eamodio.gitlens` | Enhanced git blame and history |
| `ms-azuretools.vscode-docker` | Manage Docker compose services from sidebar |
| `mikestead.dotenv` | `.env` file syntax highlighting |

### v0.dev (browser tool)

[v0.dev](https://v0.dev) by Vercel generates shadcn/ui + Tailwind components from text prompts. Output drops directly into `apps/web` — no conversion needed. Use for prototyping new pages before wiring real data.

### Stripe CLI (Phase 2)

```bash
# Install: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3001/webhooks/stripe
```

Required for testing Stripe webhook flows locally.
