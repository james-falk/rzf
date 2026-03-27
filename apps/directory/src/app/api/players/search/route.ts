import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@rzf/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const pos = searchParams.get('pos')?.trim().toUpperCase() ?? ''

  const players = await db.player.findMany({
    where: {
      // Exclude inactive players and players without a team
      status: { not: 'Inactive' },
      team: { not: null },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: 'insensitive' } },
              { lastName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(pos && pos !== 'ALL' ? { position: pos } : {}),
    },
    select: {
      sleeperId: true,
      firstName: true,
      lastName: true,
      position: true,
      team: true,
      status: true,
    },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    take: 50,
  })

  const latestMeta = await db.playerRanking.findFirst({
    orderBy: [{ season: 'desc' }, { week: 'desc' }],
    select: { week: true, season: true },
  })
  const week = latestMeta?.week ?? 1
  const season = latestMeta?.season ?? new Date().getFullYear()

  const ids = players.map((p) => p.sleeperId)
  const rankRows =
    ids.length === 0
      ? []
      : await db.playerRanking.findMany({
          where: {
            playerId: { in: ids },
            week,
            season,
            source: { in: ['fantasypros', 'espn', 'yahoo'] },
          },
          select: {
            playerId: true,
            source: true,
            rankOverall: true,
            rankPosition: true,
          },
        })

  const rankByPlayer = new Map<string, typeof rankRows>()
  for (const r of rankRows) {
    const arr = rankByPlayer.get(r.playerId) ?? []
    arr.push(r)
    rankByPlayer.set(r.playerId, arr)
  }

  const enriched = players.map((p) => ({
    ...p,
    rankSummary: (rankByPlayer.get(p.sleeperId) ?? []).map((r) => ({
      source: r.source,
      overall: r.rankOverall,
      position: r.rankPosition,
    })),
  }))

  return NextResponse.json({ players: enriched, rankWeek: week, rankSeason: season })
}
