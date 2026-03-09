import { NextRequest, NextResponse } from 'next/server'

function getClerkFrontendApiUrl(): string {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ''
  // Format: pk_test_<base64> — decode to get the frontend API host
  const encoded = key.replace(/^pk_(test|live)_/, '')
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8').replace(/\$$/, '')
  return `https://${decoded}`
}

async function handler(req: NextRequest) {
  const clerkBase = getClerkFrontendApiUrl()
  const { pathname, search } = new URL(req.url)
  const clerkPath = pathname.replace(/^\/api\/clerk/, '')
  const target = `${clerkBase}${clerkPath}${search}`

  const headers = new Headers(req.headers)
  headers.set('host', new URL(clerkBase).host)

  const body =
    req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body,
  })

  const resHeaders = new Headers(upstream.headers)
  resHeaders.delete('content-encoding')
  resHeaders.delete('transfer-encoding')

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
