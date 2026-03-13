/**
 * Client-safe env vars — only NEXT_PUBLIC_* values that Next.js inlines at build time.
 * Server-side code should use @rzf/shared/env instead.
 */

export const API_BASE_URL = process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:3001'
