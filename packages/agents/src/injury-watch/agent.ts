import { db } from '@rzf/db'
import { SleeperConnector } from '@rzf/connectors/sleeper'
import type { InjuryWatchInput, InjuryWatchOutput } from '@rzf/shared/types'

function toSeverity(injuryStatus: string | null, status: string | null): 'high' | 'medium' | 'low' {
  const injury = (injuryStatus ?? '').toLowerCase()
  const playerStatus = (status ?? '').toLowerCase()

  if (
    injury.includes('out') ||
    injury.includes('doubtful') ||
    injury.includes('ir') ||
    playerStatus.includes('inactive')
  ) {
    return 'high'
  }
  if (injury.includes('questionable') || injury.includes('limited')) {
    return 'medium'
  }
  return 'low'
}

export async function runInjuryWatchAgent(input: InjuryWatchInput): Promise<InjuryWatchOutput> {
  const { userId, leagueId } = input

  const sleeperProfile = await db.sleeperProfile.findUnique({ where: { userId } })
  if (!sleeperProfile) {
    throw new Error('No Sleeper account connected. Visit /account/sleeper to link your account.')
  }

  const userRoster = await SleeperConnector.getUserRoster(leagueId, sleeperProfile.sleeperId)
  if (!userRoster) {
    throw new Error(`No roster found for user ${sleeperProfile.sleeperId} in league ${leagueId}`)
  }

  const starterIds = new Set(userRoster.starters ?? [])
  const rosterPlayerIds = (userRoster.players ?? []).filter((id) => !id.match(/^[A-Z]{2,3}$/) && id !== 'DEF')

  const players = await db.player.findMany({
    where: { sleeperId: { in: rosterPlayerIds } },
  })

  const alerts = players
    .filter((p) => starterIds.has(p.sleeperId))
    .map((p) => {
      const severity = toSeverity(p.injuryStatus, p.status)
      return {
        playerId: p.sleeperId,
        playerName: `${p.firstName} ${p.lastName}`.trim(),
        position: p.position,
        team: p.team ?? null,
        status: p.status ?? null,
        injuryStatus: p.injuryStatus ?? null,
        severity,
        summary: p.injuryStatus
          ? `${p.firstName} ${p.lastName} is listed as ${p.injuryStatus}.`
          : `${p.firstName} ${p.lastName} has no listed injury status.`,
        recommendation:
          severity === 'high'
            ? 'Prepare a backup option immediately and monitor final game-day inactive reports.'
            : severity === 'medium'
              ? 'Track final practice reports and be ready with a contingency starter.'
              : 'No immediate action required; continue normal lineup planning.',
      }
    })
    .filter((a) => a.severity !== 'low')
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 }
      return rank[a.severity] - rank[b.severity]
    })

  const starterCount = players.filter((p) => starterIds.has(p.sleeperId)).length

  return {
    alerts,
    riskyStarters: alerts.length,
    healthyStarters: Math.max(0, starterCount - alerts.length),
    tokensUsed: 0,
  }
}
