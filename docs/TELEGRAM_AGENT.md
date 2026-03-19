# Telegram Agent

> Last updated: 2026-03-18
> Standalone doc for the always-on Telegram bot daemon. Source lives in `tools/telegram-agent/`.

---

## Purpose

A 24/7 local daemon that bridges your Telegram account to the RZF project. Send a message from your phone → the bot processes it → replies back on Telegram. Requires no Cursor session to be open. Locked to a single whitelisted Telegram user ID.

---

## Architecture

```
Your phone (Telegram app)
      │ Bot API long-poll
      ▼
Telegram servers
      │ Grammy bot
      ▼
tools/telegram-agent/ (Node.js, PM2, always-on PC)
      │
      ├─ Memory commands ──────────► memory/agent-memory.md (read/write)
      │
      ├─ Fantasy commands ─────────► POST /internal/agents/run  (Render API)
      │   /eval /waiver /injury         GET /internal/agents/:id (poll)
      │   /lineup /trade /scout
      │
      ├─ DevOps commands ──────────► Render API (logs, deploys, status)
      │   /status /logs /deploy /prs    GitHub API (PRs)
      │
      └─ Everything else ──────────► Claude Sonnet (file read → code gen)
              │                         ► Approval gate (inline keyboard)
              └─ On approval ──────────► git add + commit + push
```

---

## File Layout

```
tools/telegram-agent/
├── ecosystem.config.cjs     PM2 process config
├── package.json             Standalone package (not in pnpm workspace)
├── tsconfig.json
├── memory/
│   └── agent-memory.md      ⚠️ Gitignored — personal user data
└── src/
    ├── index.ts             Bot init, whitelist guard, startup
    ├── router.ts            Message routing (memory → fantasy → devops → code)
    ├── memory.ts            Read/write agent-memory.md, inject into Claude calls
    ├── approval.ts          Inline keyboard approval gate + git commit/push
    └── handlers/
        ├── fantasy.ts       Fantasy agent slash commands
        ├── devops.ts        Render/GitHub DevOps commands
        └── code.ts          AI coding handler (Claude Sonnet + filesystem)
```

---

## Command Reference

### Fantasy Agents

| Command | Agent | Required params |
|---------|-------|----------------|
| `/eval [leagueId]` | TeamEvalAgent | leagueId (or default) |
| `/waiver [leagueId]` | WaiverAgent | leagueId (or default) |
| `/injury [leagueId]` | InjuryWatchAgent | leagueId (or default) |
| `/lineup [leagueId]` | LineupAgent | leagueId (or default) |
| `/trade give:A receive:B` | TradeAnalysisAgent | player names |
| `/scout PlayerName` | PlayerScoutAgent | player name or ID |

Fantasy commands call `POST /internal/agents/run` on the deployed Render API using `x-admin-secret` auth, then poll `GET /internal/agents/:id` every 2 seconds (max 60s).

### DevOps

| Command | Action |
|---------|--------|
| `/status` | Render service health for API + Worker |
| `/logs [api\|worker]` | Last 30 log lines from Render |
| `/deploy [api\|worker]` | Trigger a Render manual deploy |
| `/prs` | List open GitHub pull requests |

### Memory

| Command | Effect |
|---------|--------|
| `remember [X]` | Saves X to `agent-memory.md` |
| `save [X]` | Alias for remember |
| `forget [X]` | Removes matching entry |
| `show memory` | Displays full memory file |
| `what do you know?` | Alias for show memory |
| `talk to me like [X]` | Updates Response style |
| `my default league is [ID]` | Sets default leagueId for agent commands |

### Code Agent (free-form text)

Any message not matching a command is sent to Claude Sonnet as a coding task. The agent:
1. Builds a workspace file tree (ignoring node_modules, dist, etc.)
2. Asks Claude Haiku which files are relevant
3. Reads those files
4. Calls Claude Sonnet to generate the changes
5. Sends the result to the approval gate

---

## Approval Workflow

When code changes are generated, the bot sends:
```
✏️ Here's what I did:
Added Reddit ingestion job to apps/worker

Files changed:
• apps/worker/src/jobs/reddit.ts
• apps/worker/src/index.ts

📝 Commit: feat(worker): add Reddit ingestion job

[✅ Approve & Push]   [❌ Discard]
```

- **Approve**: writes files to disk → `git add .` → `git commit` → `git push` → replies with commit SHA
- **Discard**: removes pending state, replies "Changes discarded"

---

## Security Model

- All messages from non-whitelisted Telegram user IDs are **silently ignored**
- Whitelisted via `TELEGRAM_ALLOWED_USER_ID` env var (numeric Telegram ID)
- Fantasy API calls use `x-admin-secret` (not user Clerk tokens)
- `agent-memory.md` is gitignored — never committed to version control
- The daemon only pushes to git after explicit Telegram button approval

---

## Setup & Operation

### One-time setup

1. Create bot via [@BotFather](https://t.me/BotFather) → `/newbot` → copy `BOT_TOKEN`
2. Get your Telegram user ID → message [@userinfobot](https://t.me/userinfobot)
3. Find your RZF user ID in the admin dashboard → Users
4. Fill in `.env` vars (see `.env.example` Telegram Agent section)
5. Install dependencies:
   ```
   cd tools/telegram-agent
   npm install
   ```

### Starting with PM2

```bash
cd tools/telegram-agent
npm run pm2:start

# Make it start on Windows boot (run printed command as admin):
npm run pm2:save
```

### Manual start (dev/test)

```bash
cd tools/telegram-agent
npm run dev
```

### PM2 management

```bash
npm run pm2:logs      # Stream logs
npm run pm2:restart   # Restart daemon
npm run pm2:stop      # Stop daemon
```

---

## Required Env Vars

| Var | Source | Required |
|-----|--------|----------|
| `TELEGRAM_BOT_TOKEN` | @BotFather | Yes |
| `TELEGRAM_ALLOWED_USER_ID` | @userinfobot | Yes |
| `TELEGRAM_OWNER_USER_ID` | Admin dashboard → Users | Yes |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Yes |
| `ADMIN_SECRET` | Already in .env | Yes |
| `TELEGRAM_API_BASE_URL` | Your Render API URL | Yes (prod) |
| `RENDER_API_KEY` | Render Dashboard | Yes for /status /logs /deploy |
| `RENDER_SERVICE_ID_API` | Render Dashboard | Yes for /logs /deploy api |
| `RENDER_SERVICE_ID_WORKER` | Render Dashboard | Yes for /logs /deploy worker |
| `GITHUB_REPO` | `owner/repo` | Yes for /prs |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub → Settings → PATs | Yes for /prs |
| `TELEGRAM_DEFAULT_LEAGUE_ID` | Your Sleeper league ID | Optional |
| `WORKSPACE_PATH` | Absolute path to repo root | Optional (auto-detected) |
