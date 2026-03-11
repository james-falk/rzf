import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// eslint-disable-next-line no-restricted-syntax
const API_BASE = process.env['API_BASE_URL'] ?? 'http://localhost:3001'

export async function GET() {
  const { getToken } = await auth()
  const token = await getToken()

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return NextResponse.json({}, { status: 200 })

    const data = await res.json() as { user: { sleeperProfile?: { sleeperId?: string } } }
    return NextResponse.json({ sleeperId: data.user?.sleeperProfile?.sleeperId ?? null })
  } catch {
    return NextResponse.json({ sleeperId: null })
  }
}
