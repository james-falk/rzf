# Red Zone Fantasy

> NFL RedZone for fantasy — a real-time AI fantasy assistant with a freemium model.

## Monorepo Structure

```
fantasy-workspace/
├── apps/
│   ├── api/        — Fastify REST API (Render Web Service)
│   ├── rostermind/ — Next.js 15 frontend app (Vercel)
│   ├── directory/  — Next.js 15 data directory app (Vercel)
│   └── worker/     — BullMQ job consumer (Render Background Worker)
├── packages/
│   ├── agents/     — Agent logic with strict I/O schemas
│   ├── connectors/ — External API adapters (Sleeper, Anthropic)
│   ├── db/         — Prisma schema, migrations, typed client
│   └── shared/     — Shared types, env validation (Zod)
├── docs/           — Living documentation (auto-updated)
└── scripts/        — Build + maintenance scripts
```

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker Desktop

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start local Postgres + Redis
docker compose up -d

# 3. Copy env vars and fill in your values
cp .env.example .env

# 4. Run database migrations
pnpm db:migrate

# 5. Start all services
pnpm dev
```

### Individual services

```bash
pnpm --filter @rzf/api dev       # API on :3001
pnpm --filter @rzf/worker dev    # Worker
pnpm --filter @rzf/rostermind dev # RosterMind on :3000
pnpm --filter @rzf/directory dev  # Directory on :3002
```

## Documentation

| Doc | Contents |
|-----|----------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System diagram, data flow, service map |
| [docs/AGENTS.md](docs/AGENTS.md) | Agent catalog, I/O contracts, token budgets |
| [docs/DATA.md](docs/DATA.md) | DB schema reference, analytics events |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Render + Vercel setup, env vars, dev tooling |
| [CHANGELOG.md](CHANGELOG.md) | Running change log |

## Tech Stack

- **Frontend**: Next.js 15 + Tailwind CSS + shadcn/ui
- **API**: Fastify
- **Queue**: BullMQ on Redis (Render Key Value in prod)
- **DB**: Postgres via Prisma (Render managed in prod)
- **Auth**: Clerk
- **LLM**: Anthropic Claude (Haiku primary)
- **Deployment**: Render (API + Worker + Redis) + Vercel (RosterMind + Directory)
