# Changelog

All meaningful changes are logged here. Most recent first.

---

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
