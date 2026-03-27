/** Default public Nitter instances — same order as legacy `NITTER_INSTANCES` in connectors */
export const DEFAULT_NITTER_BASE_URLS = [
  'https://nitter.cz',
  'https://nitter.privacydev.net',
  'https://nitter.poast.org',
  'https://lightbrd.com',
] as const

export function parseNitterBaseUrls(envCsv: string | undefined | null): string[] {
  const fromEnv = envCsv
    ?.split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter(Boolean)
  if (fromEnv && fromEnv.length > 0) return fromEnv
  return [...DEFAULT_NITTER_BASE_URLS]
}

/**
 * Normalize Twitter / X / Nitter input to a single Nitter RSS URL using `bases[0]`.
 * Server should pass `parseNitterBaseUrls(process.env.NITTER_BASE_URLS)`; Admin client uses defaults.
 */
export function normalizeTwitterFeedUrl(input: string, bases: string[]): string {
  const trimmed = input.trim()
  if (!bases.length) return trimmed

  const base0 = bases[0]!.replace(/\/$/, '')

  if (trimmed.startsWith('http')) {
    const nitterPath = trimmed.match(/https?:\/\/[^/]+\/([^/]+)\/rss\/?$/i)
    if (nitterPath) {
      return `${base0}/${nitterPath[1]}/rss`
    }
    const xm = trimmed.match(/(?:twitter\.com|x\.com)\/(?:@)?([\w]+)/i)
    if (xm) {
      return `${base0}/${xm[1]}/rss`
    }
    return trimmed
  }

  const handle = trimmed.replace(/^@/, '').replace(/\/$/, '').split('/')[0]?.trim()
  if (!handle) return trimmed
  return `${base0}/${handle}/rss`
}
