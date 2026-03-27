/** Cursor for home feed pagination (publishedAt desc, id desc). Shared by `/api/feed` and the home page. */

/** First page + “Load more” batch size — keep in sync with `getData()` on the home page. */
export const FEED_PAGE_SIZE = 500

export type FeedCursorPayload = { p: string; id: string }

export function decodeFeedCursor(raw: string | null): FeedCursorPayload | null {
  if (!raw) return null
  try {
    const j = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as { p?: string; id?: string }
    if (j.p && j.id) return { p: j.p, id: j.id }
  } catch {
    /* ignore */
  }
  return null
}

export function encodeFeedCursor(publishedAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ p: publishedAt.toISOString(), id }), 'utf8').toString('base64url')
}
