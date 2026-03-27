import { db } from '@rzf/db'
import { TIER_ZERO_PLAYER_RANKING_SOURCES, rankingSourceMeta } from '@rzf/shared'

/**
 * Load tier-0 ranking rows for the given week/season.
 * `playerIds` are Sleeper player ids (`Player.sleeperId` / `PlayerRanking.playerId`).
 * Excludes sources not present in DB for that week (e.g. espn/yahoo until ingested).
 */
export async function loadTierZeroPlayerRankings(
  playerIds: string[],
  week: number,
  season: number,
): Promise<
  Array<{
    playerId: string
    source: string
    rankOverall: number
    rankPosition: number
    label: string
    kind: string
  }>
> {
  if (playerIds.length === 0) return []

  const sources = [...TIER_ZERO_PLAYER_RANKING_SOURCES] as string[]
  const rows = await db.playerRanking.findMany({
    where: {
      playerId: { in: playerIds },
      week,
      season,
      source: { in: sources },
    },
  })

  return rows.map((r) => {
    const meta = rankingSourceMeta(r.source)
    return {
      playerId: r.playerId,
      source: r.source,
      rankOverall: r.rankOverall,
      rankPosition: r.rankPosition,
      label: meta.label,
      kind: meta.kind,
    }
  })
}

export function formatTierZeroRankingsForPrompt(
  rankings: Awaited<ReturnType<typeof loadTierZeroPlayerRankings>>,
  maxChars = 3500,
): string {
  if (rankings.length === 0) return ''
  const byPlayer = new Map<string, typeof rankings>()
  for (const r of rankings) {
    const list = byPlayer.get(r.playerId) ?? []
    list.push(r)
    byPlayer.set(r.playerId, list)
  }
  const lines: string[] = ['Expert / platform ranks (tier 0):']
  for (const [pid, list] of byPlayer) {
    lines.push(`  ${pid}:`)
    const sorted = [...list].sort((a, b) => {
      if (a.source === 'fantasypros') return -1
      if (b.source === 'fantasypros') return 1
      return a.source.localeCompare(b.source)
    })
    for (const r of sorted) {
      const pos = r.rankPosition > 0 ? ` pos#${r.rankPosition}` : ''
      lines.push(`    ${r.label}: overall #${r.rankOverall}${pos}`)
    }
  }
  let s = lines.join('\n')
  if (s.length > maxChars) s = `${s.slice(0, maxChars)}\n…(truncated)`
  return s
}

type RankRow = Awaited<ReturnType<typeof loadTierZeroPlayerRankings>>[number]

/** One-line summary for roster lists (team-eval, waiver rows). */
export function formatCompactTierZeroForPlayer(rows: RankRow[], maxLen = 160): string {
  if (rows.length === 0) return ''
  const sorted = [...rows].sort((a, b) => {
    if (a.source === 'fantasypros') return -1
    if (b.source === 'fantasypros') return 1
    return a.source.localeCompare(b.source)
  })
  const parts = sorted.map((r) => {
    const shortLabel = r.label.includes('·') ? r.label.split('·')[0]!.trim() : r.label
    if (r.kind === 'adp') return `${shortLabel} ADP ${r.rankOverall}`
    const pos = r.rankPosition > 0 ? ` pos#${r.rankPosition}` : ''
    return `${shortLabel} #${r.rankOverall}${pos}`
  })
  let s = parts.join(' · ')
  if (s.length > maxLen) s = `${s.slice(0, maxLen)}…`
  return s
}
