import { createClerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

export async function GET(req: NextRequest) {
  return clerk.handleOAuthCallback(req)
}

export async function POST(req: NextRequest) {
  return clerk.handleOAuthCallback(req)
}
