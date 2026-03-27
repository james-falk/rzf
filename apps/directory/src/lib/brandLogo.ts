/**
 * Site logo URL derived from a hostname.
 * Clearbit's public logo.clearbit host is deprecated / often fails DNS (ERR_NAME_NOT_RESOLVED).
 * Google's favicon endpoint is widely available and good enough for small UI marks.
 */
export function brandLogoUrlFromDomain(domain: string): string {
  const d = domain.replace(/^www\./i, '').trim()
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=128`
}

/** Logo URL from a feed or page URL (RSS, YouTube channel URL, etc.). */
export function brandLogoUrlFromFeedUrl(feedUrl: string | null): string | null {
  if (!feedUrl) return null
  try {
    const url = feedUrl.startsWith('http') ? feedUrl : `https://${feedUrl}`
    const domain = new URL(url).hostname.replace(/^www\./, '')
    if (!domain.includes('.')) return null
    return brandLogoUrlFromDomain(domain)
  } catch {
    return null
  }
}
