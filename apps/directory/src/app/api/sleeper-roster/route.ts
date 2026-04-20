import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { sleeperProfile: { select: { sleeperId: true } } },
  })

  if (!user?.sleeperProfile?.sleeperId) {
    return NextResponse.json({ leagues: [], playerIds: [] })
  }

  const sleeperId = user.sleeperProfile.sleeperId
  const currentYear = new Date().getFullYear()
  const seasonsToTry = [currentYear, currentYear - 1].map(String)

  try {
    const byId = new Map<string, { id: string; name: string; size: number; season: string }>()
    for (const season of seasonsToTry) {
      const res = await fetch(
        `https://api.sleeper.app/v1/user/${sleeperId}/leagues/nfl/${season}`,
        { signal: AbortSignal.timeout(10_000) },
      )
      if (!res.ok) continue
      const leagues = (await res.json()) as Array<{ league_id: string; name: string; total_rosters: number }>
      for (const l of leagues) {
        if (byId.has(l.league_id)) continue
        byId.set(l.league_id, { id: l.league_id, name: l.name, size: l.total_rosters, season })
      }
    }

    return NextResponse.json({ leagues: Array.from(byId.values()) })
  } catch {
    return NextResponse.json({ leagues: [], playerIds: [] })
  }
}
