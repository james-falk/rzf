/**
 * Client-safe env vars — only NEXT_PUBLIC_* values that Next.js inlines at build time.
 * Server-side code should use @rzf/shared/env instead.
 */

// eslint-disable-next-line no-restricted-syntax
export const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:3001'

// eslint-disable-next-line no-restricted-syntax
export const CLERK_PUBLISHABLE_KEY = process.env['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY'] ?? ''

// eslint-disable-next-line no-restricted-syntax
export const CLERK_PROXY_URL = process.env['NEXT_PUBLIC_CLERK_PROXY_URL'] as string | undefined
