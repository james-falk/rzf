import { db, Prisma } from '@rzf/db'

export interface RecentTradeRow {
  id: string
  week: number
  season: string
  leagueId: string
  createdAt: Date
}

function sanitizeSleeperIds(ids: string[]): string[] {
  return ids.filter((id) => /^\d+$/.test(id))
}

/** Recent league-agnostic trades where any listed Sleeper player id appears in adds or drops JSON keys. */
export async function findRecentTradesForPlayers(
  sleeperIds: string[],
  take: number,
): Promise<RecentTradeRow[]> {
  const ids = sanitizeSleeperIds(sleeperIds)
  if (ids.length === 0) return []

  const parts = ids.map((id) => Prisma.sql`(adds::jsonb ? ${id} OR drops::jsonb ? ${id})`)
  const where =
    parts.length === 1
      ? parts[0]!
      : parts.slice(1).reduce((acc, p) => Prisma.sql`${acc} OR ${p}`, parts[0]!)

  return db.$queryRaw<RecentTradeRow[]>`
    SELECT id, week, season, "leagueId", "createdAt"
    FROM trade_transactions
    WHERE ${where}
    ORDER BY "createdAt" DESC
    LIMIT ${take}
  `
}

export function formatRecentTradesForPrompt(rows: RecentTradeRow[], maxLines: number): string {
  if (rows.length === 0) return ''
  const lines = rows.slice(0, maxLines).map(
    (r) =>
      `- W${r.week} ${r.season} · league ${r.leagueId.slice(0, 8)}… · ${r.createdAt.toISOString().slice(0, 10)}`,
  )
  return ['Recent observed trades (aggregate, anonymized):', ...lines].join('\n')
}
