import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@rzf/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const pos = searchParams.get('pos')?.trim().toUpperCase() ?? ''

  const players = await db.player.findMany({
    where: {
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

  return NextResponse.json({ players })
}
