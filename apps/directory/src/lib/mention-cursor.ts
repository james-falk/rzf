/** Cursor for player content mentions (content.publishedAt desc, contentId desc). */

export type MentionCursorPayload = { p: string; cid: string }

export function decodeMentionCursor(raw: string | null): MentionCursorPayload | null {
  if (!raw) return null
  try {
    const j = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as { p?: string; cid?: string }
    if (j.p && j.cid) return { p: j.p, cid: j.cid }
  } catch {
    /* ignore */
  }
  return null
}

export function encodeMentionCursor(publishedAt: Date, contentId: string): string {
  return Buffer.from(JSON.stringify({ p: publishedAt.toISOString(), cid: contentId }), 'utf8').toString('base64url')
}
