import type { Context } from 'grammy'
import { isMemoryCommand, handleMemoryCommand } from './memory.js'
import { handleFantasy, FANTASY_COMMANDS } from './handlers/fantasy.js'
import { handleDevops, DEVOPS_COMMANDS } from './handlers/devops.js'
import { handleCode } from './handlers/code.js'

export async function router(ctx: Context): Promise<void> {
  const text = ctx.message?.text?.trim()
  if (!text) return

  // Memory commands always take priority
  if (isMemoryCommand(text)) {
    const reply = await handleMemoryCommand(text)
    await ctx.reply(reply, { parse_mode: 'Markdown' })
    return
  }

  const firstWord = text.split(/\s+/)[0]?.toLowerCase() ?? ''

  if (firstWord === '/help' || firstWord === '/start') {
    await ctx.reply(helpText(), { parse_mode: 'Markdown' })
    return
  }

  if (FANTASY_COMMANDS.some((cmd) => firstWord === cmd)) {
    await handleFantasy(ctx, text)
    return
  }

  if (DEVOPS_COMMANDS.some((cmd) => firstWord === cmd)) {
    await handleDevops(ctx, text)
    return
  }

  // Everything else → AI coding agent
  await handleCode(ctx, text)
}

function helpText(): string {
  return `*Telegram Agent — Command Reference*

*Fantasy Agents*
\`/eval [leagueId]\` — Team evaluation
\`/waiver [leagueId]\` — Waiver recommendations
\`/injury [leagueId]\` — Injury risk check
\`/lineup [leagueId]\` — Lineup optimizer
\`/trade give:PlayerA receive:PlayerB\` — Trade analysis
\`/scout PlayerName\` — Player deep-dive

*DevOps*
\`/status\` — Render service health
\`/logs [api|worker]\` — Recent service logs
\`/deploy [api|worker]\` — Trigger a Render deploy
\`/prs\` — Open GitHub pull requests

*Memory*
\`remember [X]\` — Save something
\`forget [X]\` — Remove a memory
\`show memory\` — See everything I know
\`talk to me like [X]\` — Update my tone
\`my default league is [ID]\` — Save league so you can omit it

*Everything else* is sent to the AI coding agent (Claude Sonnet). It can read/write code and make commits with your approval.`
}
