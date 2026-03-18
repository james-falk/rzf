/**
 * Reddit Engine — RZF
 *
 * Read-first capabilities for Reddit content monitoring.
 * Posting requires manual approval via the admin dashboard.
 *
 * Architecture mirrors x-engine:
 *  - Monitor: polls RedditMonitorRule rows and ingests new posts via RSS
 *  - Post: reads RedditPendingPost rows with status='approved' and submits
 *
 * Phase 5 implementation note:
 *  - Monitor job is already handled by the RSS connector (platform='reddit')
 *  - This engine handles the OAuth flow and post submission only
 *  - Start here when activating Reddit posting capability
 */

export const RedditEngine = {
  /**
   * Stub: Refresh OAuth token for a Reddit account.
   * Requires REDDIT_CLIENT_ID + REDDIT_CLIENT_SECRET env vars.
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const clientId = process.env['REDDIT_CLIENT_ID']
    const clientSecret = process.env['REDDIT_CLIENT_SECRET']
    if (!clientId || !clientSecret) throw new Error('REDDIT_CLIENT_ID / REDDIT_CLIENT_SECRET not configured')

    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) throw new Error(`Reddit token refresh failed: HTTP ${res.status}`)
    const body = await res.json() as { access_token: string; expires_in: number }
    return { accessToken: body.access_token, expiresIn: body.expires_in }
  },

  /**
   * Stub: Submit a text post to a subreddit.
   * Only called after a RedditPendingPost is manually approved.
   */
  async submitPost(
    accessToken: string,
    subreddit: string,
    title: string,
    body: string,
  ): Promise<{ url: string; id: string }> {
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RZF-RedditEngine/1.0',
      },
      body: new URLSearchParams({
        kind: 'self',
        sr: subreddit,
        title,
        text: body,
        resubmit: 'true',
        nsfw: 'false',
        spoiler: 'false',
      }),
    })

    if (!res.ok) throw new Error(`Reddit submit failed: HTTP ${res.status}`)
    const data = await res.json() as { json?: { data?: { url: string; id: string } } }
    const result = data.json?.data
    if (!result) throw new Error('Reddit submit: unexpected response shape')
    return result
  },
}
