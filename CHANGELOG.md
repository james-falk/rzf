# Changelog

All meaningful changes are logged here. Most recent first.

---

## 2026-03-09

### Report history + OpenClaw operator endpoint

- Added `/dashboard/history` page listing a user's last 20 agent runs
- Added `/dashboard/history/[id]` page for full report replay (reuses shared `TeamEvalResults` component)
- Extracted `TeamEvalResults` to `apps/web/src/components/TeamEvalResults.tsx` (shared by team-eval and history pages)
- Added "Report History" nav link to dashboard sidebar
- Added `POST /internal/agents/run` — operator-triggered agent run that bypasses credit check (for OpenClaw/on-prem use)

### OpenAI provider support + CORS fix

- Added OpenAI as a fallback LLM provider in `packages/connectors/src/llm/client.ts`
- `haiku` tier maps to `gpt-4o-mini`, `sonnet` maps to `gpt-4o`
- Provider auto-selected at runtime: Anthropic preferred, OpenAI fallback (whichever key is present)
- Fixed CORS origin in `apps/api/src/index.ts` — replaced placeholder with `https://rzf-web.vercel.app`

## 2026-03-06

### Lint & typecheck fixes — initial green build

- Added `PORT` to shared env schema (Zod-validated, used by API server at startup)
- Replaced all direct `process.env` accesses in `apps/api` and `apps/web` with proper `@rzf/shared/env` imports
- Added `apps/web/src/lib/client-env.ts` as the designated wrapper for `NEXT_PUBLIC_*` client-side vars
- Removed unused `track` import in `apps/api/src/routes/users.ts`
- Removed unused `clerkUserId` in team-eval page
- All 7 packages now pass `typecheck` and `lint` with zero errors

### Initial scaffold

- Initialized pnpm monorepo with Turborepo
- Created workspace structure: `apps/api`, `apps/web`, `apps/worker`, `packages/db`, `packages/shared`, `packages/connectors`, `packages/agents`
- Root config: `tsconfig.base.json`, `eslint.config.js` (with `no-process-env` rule), `prettier.config.js`, `turbo.json`
- `docker-compose.yml` for local Postgres + Redis dev environment
- `.env.example` with full variable catalog for all services
- Created living docs: `docs/ARCHITECTURE.md`, `docs/AGENTS.md`, `docs/DATA.md`, `docs/DEPLOYMENT.md`
- Created `.cursor/rules/living-docs.mdc` (alwaysApply rule for doc auto-updates)
- Created `scripts/sync-docs.ts` for mechanical doc regeneration
- Added `.cursor/mcp.json` (Postgres + GitHub MCP servers)
- Added `.vscode/extensions.json` with recommended extensions
