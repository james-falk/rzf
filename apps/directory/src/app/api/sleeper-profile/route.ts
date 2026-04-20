import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@rzf/db'

export async function GET() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({
    where: { clerkId },
    include: { sleeperProfile: true },
  })

  if (!user) return NextResponse.json({ sleeperId: null, username: null })

  return NextResponse.json({
    sleeperId: user.sleeperProfile?.sleeperId ?? null,
    username: user.sleeperProfile?.displayName ?? null,
  })
}

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { username } = await req.json() as { username?: string }
  if (!username?.trim()) return NextResponse.json({ error: 'username required' }, { status: 400 })

  // Resolve Sleeper user ID from username
  const sleeperRes = await fetch(`https://api.sleeper.app/v1/user/${username}`)
  if (!sleeperRes.ok) {
    return NextResponse.json({ error: 'Sleeper user not found' }, { status: 404 })
  }
  const sleeperUser = await sleeperRes.json() as { user_id: string; display_name: string }

  // Fetch leagues snapshot (current + previous season, best-effort).
  const currentYear = new Date().getFullYear()
  const leaguesSnapshot: Array<{ league_id: string; name: string; total_rosters: number; season: string }> = []
  const seenLeagueIds = new Set<string>()
  for (const season of [currentYear, currentYear - 1].map(String)) {
    try {
      const r = await fetch(
        `https://api.sleeper.app/v1/user/${sleeperUser.user_id}/leagues/nfl/${season}`,
        { signal: AbortSignal.timeout(10_000) },
      )
      if (!r.ok) continue
      const rows = (await r.json()) as Array<{ league_id: string; name: string; total_rosters: number }>
      for (const l of rows) {
        if (seenLeagueIds.has(l.league_id)) continue
        seenLeagueIds.add(l.league_id)
        leaguesSnapshot.push({ ...l, season })
      }
    } catch { /* ignore; snapshot is best-effort */ }
  }

  // Ensure our user exists (auto-create from Clerk ID)
  const user = await db.user.upsert({
    where: { clerkId },
    create: { clerkId, email: '', tier: 'free' },
    update: {},
  })

  await db.sleeperProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      sleeperId: sleeperUser.user_id,
      displayName: sleeperUser.display_name,
      leagues: leaguesSnapshot as object,
    },
    update: {
      sleeperId: sleeperUser.user_id,
      displayName: sleeperUser.display_name,
      leagues: leaguesSnapshot as object,
    },
  })

  return NextResponse.json({
    sleeperId: sleeperUser.user_id,
    username: sleeperUser.display_name,
  })
}

export async function DELETE() {
  const { userId: clerkId } = await auth()
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await db.user.findUnique({ where: { clerkId } })
  if (user) {
    await db.sleeperProfile.deleteMany({ where: { userId: user.id } })
  }
  return NextResponse.json({ success: true })
}
