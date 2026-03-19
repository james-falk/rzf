import type { Context } from 'grammy'

export const FANTASY_COMMANDS = [
  '/eval',
  '/waiver',
  '/injury',
  '/lineup',
  '/trade',
  '/scout',
]

const AGENT_TYPE_MAP: Record<string, string> = {
  '/eval': 'team_eval',
  '/waiver': 'waiver',
  '/injury': 'injury_watch',
  '/lineup': 'lineup',
  '/trade': 'trade_analysis',
  '/scout': 'player_scout',
}

export async function handleFantasy(ctx: Context, text: string): Promise<void> {
  const parts = text.trim().split(/\s+/)
  const command = parts[0]?.toLowerCase() ?? ''
  const args = parts.slice(1)
  const agentType = AGENT_TYPE_MAP[command]

  if (!agentType) {
    await ctx.reply(`Unknown fantasy command: ${command}`)
    return
  }

  const API_BASE = process.env.TELEGRAM_API_BASE_URL ?? 'http://localhost:3001'
  const ADMIN_SECRET = process.env.ADMIN_SECRET ?? ''
  const OWNER_USER_ID = process.env.TELEGRAM_OWNER_USER_ID ?? ''

  if (!OWNER_USER_ID) {
    await ctx.reply('❌ TELEGRAM_OWNER_USER_ID not set in .env')
    return
  }

  // Resolve league ID: from args, or saved default
  const leagueId =
    args[0] ?? process.env.TELEGRAM_DEFAULT_LEAGUE_ID ?? ''

  // Build agent-specific input
  let input: Record<string, unknown> = { userId: OWNER_USER_ID, leagueId }

  if (agentType === 'trade_analysis') {
    // /trade give:PlayerA,PlayerB receive:PlayerC
    const givingArg = args.find((a) => a.toLowerCase().startsWith('give:'))
    const receivingArg = args.find((a) => a.toLowerCase().startsWith('receive:'))
    input = {
      userId: OWNER_USER_ID,
      leagueId,
      giving: givingArg?.replace(/^give:/i, '').split(',').map((s) => s.trim()) ?? [],
      receiving: receivingArg?.replace(/^receive:/i, '').split(',').map((s) => s.trim()) ?? [],
    }
  } else if (agentType === 'player_scout') {
    // /scout Justin Jefferson  →  args = ['Justin', 'Jefferson']
    input = { userId: OWNER_USER_ID, playerId: args.join(' ') }
  }

  await ctx.reply(`⏳ Running ${agentType.replace('_', ' ')}...`)

  try {
    // Enqueue via internal API (admin-secret auth, bypasses Clerk)
    const runRes = await fetch(`${API_BASE}/internal/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({ userId: OWNER_USER_ID, agentType, input }),
    })

    if (!runRes.ok) {
      const err = (await runRes.json().catch(() => ({ error: runRes.statusText }))) as Record<
        string,
        unknown
      >
      await ctx.reply(`❌ API error ${runRes.status}: ${err['error'] ?? JSON.stringify(err)}`)
      return
    }

    const { agentRunId } = (await runRes.json()) as { agentRunId: string }
    await ctx.reply(`⏳ Queued (run \`${agentRunId.slice(0, 8)}\`). Waiting for result...`, {
      parse_mode: 'Markdown',
    })

    // Poll until done or timeout (~60s)
    const output = await pollAgentRun(agentRunId, API_BASE, ADMIN_SECRET)

    if (!output) {
      await ctx.reply('⏰ Agent timed out. Use /status to check services.')
      return
    }

    const formatted = formatAgentOutput(agentType, output)
    await sendLong(ctx, formatted)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await ctx.reply(`❌ Error: ${msg}`)
  }
}

async function pollAgentRun(
  agentRunId: string,
  apiBase: string,
  adminSecret: string,
  maxAttempts = 30,
): Promise<unknown | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(2000)

    const res = await fetch(`${apiBase}/internal/agents/${agentRunId}`, {
      headers: { 'x-admin-secret': adminSecret },
    })

    if (!res.ok) continue

    const run = (await res.json()) as {
      status: string
      output: unknown
      errorMessage?: string
    }

    if (run.status === 'done') return run.output
    if (run.status === 'failed') throw new Error(run.errorMessage ?? 'Agent failed')
  }

  return null
}

function formatAgentOutput(agentType: string, output: unknown): string {
  const o = output as Record<string, unknown>

  switch (agentType) {
    case 'team_eval': {
      const grade = o['overallGrade'] as string
      const strengths = ((o['strengths'] as string[]) ?? []).map((s) => `• ${s}`).join('\n')
      const weaknesses = ((o['weaknesses'] as string[]) ?? []).map((s) => `• ${s}`).join('\n')
      const insights = ((o['keyInsights'] as string[]) ?? []).map((s) => `• ${s}`).join('\n')
      return `📊 *Team Grade: ${grade}*\n\n✅ *Strengths:*\n${strengths}\n\n⚠️ *Weaknesses:*\n${weaknesses}\n\n💡 *Insights:*\n${insights}`
    }

    case 'waiver': {
      const recs = ((o['recommendations'] as Array<Record<string, unknown>>) ?? [])
        .slice(0, 5)
        .map(
          (r) =>
            `• *${r['playerName']}* (${r['position']}) — ${r['reason']}\n  Drop: ${r['dropSuggestion'] ?? 'N/A'}`,
        )
        .join('\n\n')
      return `📋 *Waiver Recommendations:*\n\n${recs}\n\n_${o['summary'] as string}_`
    }

    case 'injury_watch': {
      const alerts = ((o['alerts'] as Array<Record<string, unknown>>) ?? [])
        .map(
          (a) =>
            `• *${a['playerName']}* — ${a['status']}: ${a['recommendation']}`,
        )
        .join('\n')
      return `🏥 *Injury Watch:*\n${alerts || 'No risky starters found. ✅'}`
    }

    case 'lineup': {
      const lineup = ((o['recommendedLineup'] as Array<Record<string, unknown>>) ?? [])
        .map(
          (p) =>
            `• ${p['position']}: *${p['playerName']}* (${p['confidence']}% confidence)`,
        )
        .join('\n')
      const warnings = ((o['warnings'] as string[]) ?? []).map((w) => `⚠️ ${w}`).join('\n')
      return `📋 *Recommended Lineup:*\n${lineup}${warnings ? `\n\n${warnings}` : ''}`
    }

    case 'trade_analysis': {
      const verdict = o['verdict'] as string
      const score = o['valueScore'] as number
      return `🔄 *Trade Analysis: ${verdict}*\nValue score: ${score}/100\n\n${o['summary'] as string}`
    }

    case 'player_scout': {
      const insights = ((o['keyInsights'] as string[]) ?? []).map((i) => `• ${i}`).join('\n')
      return `🔍 *${o['playerName'] as string}* — ${o['trend'] as string}\n\n${o['summary'] as string}\n\n${insights}`
    }

    default:
      return JSON.stringify(output, null, 2).slice(0, 3800)
  }
}

async function sendLong(ctx: Context, text: string): Promise<void> {
  const MAX = 4000
  if (text.length <= MAX) {
    await ctx.reply(text, { parse_mode: 'Markdown' })
    return
  }
  for (let i = 0; i < text.length; i += MAX) {
    await ctx.reply(text.slice(i, i + MAX), { parse_mode: 'Markdown' })
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
