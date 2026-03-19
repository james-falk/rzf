import { db } from '@rzf/db'

// ─── Summary Builders ─────────────────────────────────────────────────────────

function summarizeRun(agentType: string, output: unknown): string {
  if (!output || typeof output !== 'object') return ''
  const o = output as Record<string, unknown>

  switch (agentType) {
    case 'team_eval': {
      const strengths = (o.strengths as string[] | undefined)?.slice(0, 2).join(', ') ?? 'N/A'
      const weaknesses = (o.weaknesses as string[] | undefined)?.slice(0, 2).join(', ') ?? 'N/A'
      return `Team Eval: ${o.overallGrade ?? '?'} overall. Strengths: ${strengths}. Weaknesses: ${weaknesses}.`
    }
    case 'injury_watch': {
      const alerts = o.alerts as Array<{ playerName: string; severity: string }> | undefined
      if (!alerts?.length) return 'Injury Watch: No active injury alerts.'
      const high = alerts.filter((a) => a.severity === 'high').map((a) => a.playerName)
      const med = alerts.filter((a) => a.severity === 'medium').map((a) => a.playerName)
      const parts: string[] = []
      if (high.length) parts.push(`${high.length} high-severity (${high.join(', ')})`)
      if (med.length) parts.push(`${med.length} medium (${med.join(', ')})`)
      return `Injury Watch: ${parts.join('; ') || 'All clear'}.`
    }
    case 'waiver': {
      const recs = o.recommendations as Array<{ playerName: string }> | undefined
      const top = recs?.[0]?.playerName ?? 'N/A'
      const summary = typeof o.summary === 'string' ? ` ${o.summary.slice(0, 120)}` : ''
      return `Waiver Wire: Top pickup — ${top}.${summary}`
    }
    case 'lineup': {
      const matchups = (o.keyMatchups as string[] | undefined)?.slice(0, 2).join('; ') ?? ''
      const warnings = (o.warnings as string[] | undefined)?.slice(0, 2).join('; ')
      const warnStr = warnings ? ` Warnings: ${warnings}` : ''
      return `Lineup: ${matchups}${warnStr}`
    }
    case 'trade_analysis': {
      const summary = typeof o.summary === 'string' ? o.summary.slice(0, 150) : ''
      return `Trade Analysis: Verdict — ${o.verdict ?? '?'}. ${summary}`
    }
    case 'player_scout': {
      const summary = typeof o.summary === 'string' ? o.summary.slice(0, 120) : ''
      return `Player Scout (${o.playerName ?? '?'}): trend=${o.trend ?? '?'}. ${summary}`
    }
    case 'player_compare': {
      const winner = o.winnerName ?? 'even'
      const verdict = typeof o.verdict === 'string' ? ` ${o.verdict.slice(0, 100)}` : ''
      return `Player Compare: Winner — ${winner}.${verdict}`
    }
    default:
      return ''
  }
}

// ─── Main Export ──────────────────────────────────────────────────────────────

/**
 * Build a session context block from recent completed agent runs in this session.
 *
 * Injected into every agent's user prompt to enable cross-agent awareness.
 * Non-critical — returns empty string on any failure so agents always run.
 *
 * Requires AgentRun.sessionId to be set on the job input. When sessionId is
 * absent (legacy runs, direct API calls), context is silently skipped.
 */
export async function buildSessionContext(
  userId: string,
  sessionId: string | null | undefined,
): Promise<string> {
  if (!sessionId) return ''

  try {
    const recentRuns = await db.agentRun.findMany({
      where: {
        userId,
        sessionId,
        status: 'done',
      },
      orderBy: { createdAt: 'asc' },
      take: 5,
      select: {
        agentType: true,
        outputJson: true,
        createdAt: true,
      },
    })

    if (recentRuns.length === 0) return ''

    const lines: string[] = ['[Session Context — Earlier This Session]']
    for (const run of recentRuns) {
      const summary = summarizeRun(run.agentType, run.outputJson)
      if (summary) lines.push(`• ${summary}`)
    }

    return lines.length > 1 ? lines.join('\n') : ''
  } catch {
    return ''
  }
}
