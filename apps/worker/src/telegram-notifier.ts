/**
 * Telegram Notifier — sends proactive alerts via the Telegram Bot API.
 * Used by the agent worker to notify the owner when high-severity injury
 * alerts are detected. Fire-and-forget; never throws.
 */

const TELEGRAM_API = 'https://api.telegram.org'

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env['TELEGRAM_BOT_TOKEN']
  const chatId = process.env['TELEGRAM_ALLOWED_USER_ID']

  if (!token || !chatId) return

  try {
    const url = `${TELEGRAM_API}/bot${token}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    })
    if (!res.ok) {
      console.warn(`[telegram] sendMessage failed: ${res.status}`)
    }
  } catch (err) {
    console.warn('[telegram] sendMessage error:', err)
  }
}

/**
 * Format and send injury alerts from a completed InjuryWatchAgent run.
 * Only sends if there are high-severity own-starter alerts.
 */
export function sendInjuryAlerts(output: {
  alerts?: Array<{
    playerName: string
    position: string
    team: string | null
    severity: string
    context: string
    injuryStatus: string | null
    recommendation: string
  }>
}): void {
  const highAlerts = (output.alerts ?? []).filter(
    (a) => a.severity === 'high' && a.context === 'own_starter',
  )
  if (highAlerts.length === 0) return

  const lines = ['🚨 *Injury Alert — High Severity Starters*\n']
  for (const a of highAlerts.slice(0, 5)) {
    lines.push(`*${a.playerName}* (${a.position}, ${a.team ?? 'FA'})`)
    lines.push(`Status: ${a.injuryStatus ?? 'Unknown'}`)
    lines.push(`→ ${a.recommendation}`)
    lines.push('')
  }
  if (highAlerts.length > 5) {
    lines.push(`_...and ${highAlerts.length - 5} more high-severity alerts_`)
  }

  sendTelegramMessage(lines.join('\n')).catch(() => {})
}
