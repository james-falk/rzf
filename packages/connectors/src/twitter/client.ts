/**
 * X / Twitter v2 API Connector
 *
 * This connector wraps the X API v2 using OAuth 2.0 PKCE (user-context).
 * All methods return a typed result object so callers can handle the
 * "no credentials" / "rate-limited" state gracefully without throwing.
 *
 * Tier notes:
 *  - Free: 500 posts/month write, 100 reads/month (extremely limited)
 *  - Basic ($100/mo): 10,000 reads + writes — required for real ingestion
 *
 * To activate: set X_CLIENT_ID and X_CLIENT_SECRET in your environment.
 * Token storage is handled by the XAccount DB model.
 */

const X_API_BASE = 'https://api.twitter.com/2'

export interface XResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  rateLimited?: boolean
}

export interface Tweet {
  id: string
  text: string
  authorId: string
  authorHandle?: string
  createdAt?: string
  publicMetrics?: {
    likeCount: number
    retweetCount: number
    replyCount: number
  }
}

export interface TweetSearchResponse {
  tweets: Tweet[]
  nextToken?: string
  resultCount: number
}

async function xFetch<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<XResult<T>> {
  try {
    const res = await fetch(`${X_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (res.status === 429) {
      return { success: false, rateLimited: true, error: 'Rate limit exceeded' }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { title?: string; detail?: string }
      return { success: false, error: body.detail ?? body.title ?? `HTTP ${res.status}` }
    }

    const data = await res.json() as T
    return { success: true, data }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' }
  }
}

export const XConnector = {
  /**
   * Post a tweet on behalf of the authenticated user.
   * Returns the new tweet ID on success.
   */
  async postTweet(accessToken: string, content: string): Promise<XResult<{ id: string; text: string }>> {
    if (!accessToken) return { success: false, error: 'No access token provided' }
    return xFetch<{ data: { id: string; text: string } }>(
      '/tweets',
      accessToken,
      { method: 'POST', body: JSON.stringify({ text: content }) },
    ).then((r) => r.success && r.data
      ? { success: true, data: r.data.data }
      : { success: false, error: r.error, rateLimited: r.rateLimited },
    )
  },

  /**
   * Reply to an existing tweet.
   */
  async replyToTweet(
    accessToken: string,
    inReplyToId: string,
    content: string,
  ): Promise<XResult<{ id: string; text: string }>> {
    if (!accessToken) return { success: false, error: 'No access token provided' }
    return xFetch<{ data: { id: string; text: string } }>(
      '/tweets',
      accessToken,
      {
        method: 'POST',
        body: JSON.stringify({ text: content, reply: { in_reply_to_tweet_id: inReplyToId } }),
      },
    ).then((r) => r.success && r.data
      ? { success: true, data: r.data.data }
      : { success: false, error: r.error, rateLimited: r.rateLimited },
    )
  },

  /**
   * Search recent tweets (last 7 days on Basic; last 7 days on Free but very limited).
   * Requires Basic tier for meaningful volume.
   */
  async searchTweets(
    accessToken: string,
    query: string,
    maxResults = 10,
    nextToken?: string,
  ): Promise<XResult<TweetSearchResponse>> {
    if (!accessToken) return { success: false, error: 'No access token provided' }

    const params = new URLSearchParams({
      query,
      max_results: String(Math.min(maxResults, 100)),
      'tweet.fields': 'created_at,public_metrics,author_id',
      expansions: 'author_id',
      'user.fields': 'username',
    })
    if (nextToken) params.set('next_token', nextToken)

    const result = await xFetch<{
      data?: Array<{ id: string; text: string; author_id: string; created_at?: string; public_metrics?: { like_count: number; retweet_count: number; reply_count: number } }>
      includes?: { users?: Array<{ id: string; username: string }> }
      meta?: { result_count: number; next_token?: string }
    }>(`/tweets/search/recent?${params}`, accessToken)

    if (!result.success || !result.data) return { success: false, error: result.error }

    const userMap = new Map((result.data.includes?.users ?? []).map((u) => [u.id, u.username]))

    return {
      success: true,
      data: {
        tweets: (result.data.data ?? []).map((t) => ({
          id: t.id,
          text: t.text,
          authorId: t.author_id,
          authorHandle: userMap.get(t.author_id),
          createdAt: t.created_at,
          publicMetrics: t.public_metrics
            ? {
                likeCount: t.public_metrics.like_count,
                retweetCount: t.public_metrics.retweet_count,
                replyCount: t.public_metrics.reply_count,
              }
            : undefined,
        })),
        nextToken: result.data.meta?.next_token,
        resultCount: result.data.meta?.result_count ?? 0,
      },
    }
  },

  /**
   * Get recent @mentions for the authenticated user.
   * Requires the user's X userId (returned during OAuth).
   */
  async getMentions(
    accessToken: string,
    xUserId: string,
    maxResults = 10,
  ): Promise<XResult<TweetSearchResponse>> {
    if (!accessToken) return { success: false, error: 'No access token provided' }

    const params = new URLSearchParams({
      max_results: String(Math.min(maxResults, 100)),
      'tweet.fields': 'created_at,public_metrics,author_id',
      expansions: 'author_id',
      'user.fields': 'username',
    })

    const result = await xFetch<{
      data?: Array<{ id: string; text: string; author_id: string; created_at?: string; public_metrics?: { like_count: number; retweet_count: number; reply_count: number } }>
      includes?: { users?: Array<{ id: string; username: string }> }
      meta?: { result_count: number }
    }>(`/users/${xUserId}/mentions?${params}`, accessToken)

    if (!result.success || !result.data) return { success: false, error: result.error }

    const userMap = new Map((result.data.includes?.users ?? []).map((u) => [u.id, u.username]))

    return {
      success: true,
      data: {
        tweets: (result.data.data ?? []).map((t) => ({
          id: t.id,
          text: t.text,
          authorId: t.author_id,
          authorHandle: userMap.get(t.author_id),
          createdAt: t.created_at,
          publicMetrics: t.public_metrics
            ? {
                likeCount: t.public_metrics.like_count,
                retweetCount: t.public_metrics.retweet_count,
                replyCount: t.public_metrics.reply_count,
              }
            : undefined,
        })),
        resultCount: result.data.meta?.result_count ?? 0,
      },
    }
  },

  /**
   * Verify that a stored access token is still valid.
   * Returns the authenticated user's handle + X user ID.
   */
  async verifyCredentials(accessToken: string): Promise<XResult<{ id: string; username: string; name: string }>> {
    if (!accessToken) return { success: false, error: 'No access token provided' }
    return xFetch<{ data: { id: string; username: string; name: string } }>(
      '/users/me',
      accessToken,
    ).then((r) => r.success && r.data
      ? { success: true, data: r.data.data }
      : { success: false, error: r.error },
    )
  },

  /**
   * Exchange a refresh token for a new access token via OAuth 2.0.
   * Requires X_CLIENT_ID and X_CLIENT_SECRET env vars.
   */
  async refreshAccessToken(refreshToken: string): Promise<XResult<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
    const clientId = process.env['X_CLIENT_ID']
    const clientSecret = process.env['X_CLIENT_SECRET']
    if (!clientId || !clientSecret) return { success: false, error: 'X_CLIENT_ID / X_CLIENT_SECRET not configured' }

    try {
      const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      })

      if (!res.ok) return { success: false, error: `Token refresh failed: HTTP ${res.status}` }

      const body = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
      return {
        success: true,
        data: {
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          expiresIn: body.expires_in,
        },
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Token refresh failed' }
    }
  },

  /**
   * Generate an OAuth 2.0 authorization URL for the admin to visit.
   * After authorizing, X redirects to callbackUrl with a ?code= parameter.
   */
  buildAuthUrl(callbackUrl: string, state: string): string {
    const clientId = process.env['X_CLIENT_ID'] ?? ''
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: 'challenge',
      code_challenge_method: 'plain',
    })
    return `https://twitter.com/i/oauth2/authorize?${params}`
  },

  /**
   * Exchange the OAuth ?code= for access + refresh tokens.
   */
  async exchangeCodeForTokens(
    code: string,
    callbackUrl: string,
  ): Promise<XResult<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
    const clientId = process.env['X_CLIENT_ID']
    const clientSecret = process.env['X_CLIENT_SECRET']
    if (!clientId || !clientSecret) return { success: false, error: 'X_CLIENT_ID / X_CLIENT_SECRET not configured' }

    try {
      const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          code,
          grant_type: 'authorization_code',
          redirect_uri: callbackUrl,
          code_verifier: 'challenge',
        }),
      })

      if (!res.ok) return { success: false, error: `Token exchange failed: HTTP ${res.status}` }

      const body = await res.json() as { access_token: string; refresh_token: string; expires_in: number }
      return {
        success: true,
        data: {
          accessToken: body.access_token,
          refreshToken: body.refresh_token,
          expiresIn: body.expires_in,
        },
      }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Token exchange failed' }
    }
  },
}
