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

  try {
    const currentYear = new Date().getFullYear().toString()
    const leaguesRes = await fetch(
      `https://api.sleeper.app/v1/user/${user.sleeperProfile.sleeperId}/leagues/nfl/${currentYear}`,
    )
    if (!leaguesRes.ok) return NextResponse.json({ leagues: [], playerIds: [] })

    const leagues = await leaguesRes.json() as Array<{ league_id: string; name: string; total_rosters: number }>

    // Return league list for the custom feed builder to pick from
    const leagueList = leagues.map((l) => ({
      id: l.league_id,
      name: l.name,
      size: l.total_rosters,
    }))

    return NextResponse.json({ leagues: leagueList })
  } catch {
    return NextResponse.json({ leagues: [], playerIds: [] })
  }
}
