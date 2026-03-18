'use client'

/**
 * API client for apps/api (Fastify backend).
 * Includes auth token from Clerk on every request.
 */

import { API_BASE_URL } from './client-env'

// Normalize to avoid double slash when path is e.g. /sleeper/connect
const API_BASE = API_BASE_URL.replace(/\/$/, '')

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...fetchOptions } = options

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    const err = new ApiError(res.status, (error as { error?: string }).error ?? res.statusText, error as Record<string, unknown>)
    throw err
  }

  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }

  get isPaymentRequired() {
    return this.status === 402
  }
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const api = {
  async connectSleeper(token: string, username: string, season = '2025') {
    return apiFetch<{ profile: unknown }>('/sleeper/connect', {
      method: 'POST',
      token,
      body: JSON.stringify({ username, season }),
    })
  },

  async getLeagues(token: string, season?: string) {
    const qs = season ? `?season=${season}` : ''
    return apiFetch<{ leagues: unknown[] }>(`/sleeper/leagues${qs}`, { token })
  },

  async getRoster(token: string, leagueId: string) {
    return apiFetch<{
      players: Array<{
        player_id: string
        full_name: string
        position: string
        team: string | null
        injuryStatus: string | null
      }>
    }>(`/sleeper/roster?leagueId=${encodeURIComponent(leagueId)}`, { token })
  },

  async runTeamEval(token: string, leagueId: string, focusNote?: string) {
    return apiFetch<{ agentRunId: string; status: string; deduplicated?: boolean }>('/agents/run', {
      method: 'POST',
      token,
      body: JSON.stringify({
        agentType: 'team_eval',
        input: { leagueId, ...(focusNote ? { focusNote } : {}) },
      }),
    })
  },

  async callIntent(token: string, message: string, context?: { leagueId?: string }) {
    return apiFetch<{
      agentType: string | null
      agentMeta: { type: string; label: string; description: string; available: boolean; requiredParams: string[] } | null
      gatheredParams: Record<string, string>
      missingParams: string[]
      clarifyingQuestion: string | null
      readyToRun: boolean
      availableAgents: Array<{ type: string; label: string; description: string; available: boolean; requiredParams: string[] }>
      extractedPlayers?: Array<{ name: string; playerId?: string; confidence: number }>
      needsClarification?: boolean
      extractedFocusNote?: string | null
    }>('/agents/intent', {
      method: 'POST',
      token,
      body: JSON.stringify({ message, context }),
    })
  },

  async getAvailableAgents(token: string) {
    return apiFetch<{
      agents: Array<{ type: string; label: string; description: string; available: boolean }>
    }>('/agents/available', { token })
  },

  async createCheckoutSession(token: string, successUrl: string, cancelUrl: string) {
    return apiFetch<{ url: string; sessionId: string }>('/billing/checkout', {
      method: 'POST',
      token,
      body: JSON.stringify({ successUrl, cancelUrl }),
    })
  },

  async verifyCheckout(token: string, sessionId: string) {
    return apiFetch<{ tier: string; runCredits: number; alreadyApplied?: boolean }>('/billing/verify-checkout', {
      method: 'POST',
      token,
      body: JSON.stringify({ sessionId }),
    })
  },

  async searchPlayers(token: string, q: string, position?: string) {
    const params = new URLSearchParams({ q, ...(position && position !== 'All' ? { position } : {}) })
    return apiFetch<{ players: Array<{ player_id: string; full_name: string; position: string; team: string | null; injuryStatus: string | null }> }>(
      `/players/search?${params}`,
      { token },
    )
  },

  async runAgent(token: string, agentType: string, input: Record<string, unknown>, sessionId?: string | null) {
    return apiFetch<{ agentRunId: string; status: string; deduplicated?: boolean }>('/agents/run', {
      method: 'POST',
      token,
      body: JSON.stringify({ agentType, input, ...(sessionId ? { sessionId } : {}) }),
    })
  },

  async getAgentRun(token: string, runId: string) {
    return apiFetch<{
      id: string
      agentType: string
      status: 'queued' | 'running' | 'done' | 'failed'
      output: unknown
      tokensUsed: number | null
      durationMs: number | null
      rating: 'up' | 'down' | null
      errorMessage: string | null
      createdAt: string
    }>(`/agents/${runId}`, { token })
  },

  async followUpAgentRun(token: string, runId: string, message: string) {
    return apiFetch<{
      reply: string
      suggestedAgent?: { agentType: string; label: string; reason: string }
    }>(`/agents/${runId}/followup`, {
      method: 'POST',
      token,
      body: JSON.stringify({ message }),
    })
  },

  async rateAgentRun(token: string, runId: string, rating: 'up' | 'down') {
    return apiFetch<{ success: boolean }>(`/agents/${runId}/rate`, {
      method: 'POST',
      token,
      body: JSON.stringify({ rating }),
    })
  },

  async getRunHistory(token: string) {
    return apiFetch<{
      runCredits: number
      tier: string
      monthlyTokensUsed: number
      monthlyRunsUsed: number
      recentRuns: Array<{
        id: string
        agentType: string
        status: string
        tokensUsed: number | null
        durationMs: number | null
        rating: string | null
        createdAt: string
      }>
    }>('/usage', { token })
  },

  async getUsage(token: string) {
    return apiFetch<{
      runCredits: number
      tier: string
      monthlyTokensUsed: number
      monthlyRunsUsed: number
      recentRuns: unknown[]
    }>('/usage', { token })
  },

  // Chat session routes
  async createSession(token: string) {
    return apiFetch<{ sessionId: string }>('/sessions', {
      method: 'POST',
      token,
      body: '{}',
    })
  },

  async addSessionMessage(token: string, sessionId: string, message: {
    role: 'user' | 'assistant'
    type: string
    content: string
    agentRunId?: string
  }) {
    return apiFetch<{ messageId: string }>(`/sessions/${sessionId}/messages`, {
      method: 'POST',
      token,
      body: JSON.stringify(message),
    })
  },

  async getSessionSummary(token: string, sessionId: string) {
    return apiFetch<{ summary: string }>(`/sessions/${sessionId}/summary`, {
      method: 'POST',
      token,
      body: '{}',
    })
  },

  // Internal admin routes
  async getInternalOverview(adminSecret: string) {
    return apiFetch<unknown>('/internal/overview', {
      headers: { 'x-admin-secret': adminSecret },
    })
  },

  async getInternalUsers(adminSecret: string, page = 1, tier?: string) {
    const params = new URLSearchParams({ page: String(page), ...(tier ? { tier } : {}) })
    return apiFetch<unknown>(`/internal/users?${params}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
  },

  async getInternalRuns(adminSecret: string, page = 1, status?: string, agentType?: string) {
    const params = new URLSearchParams({
      page: String(page),
      ...(status ? { status } : {}),
      ...(agentType ? { agentType } : {}),
    })
    return apiFetch<unknown>(`/internal/runs?${params}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
  },

  async getInternalEvents(adminSecret: string, page = 1, eventType?: string) {
    const params = new URLSearchParams({ page: String(page), ...(eventType ? { eventType } : {}) })
    return apiFetch<unknown>(`/internal/events?${params}`, {
      headers: { 'x-admin-secret': adminSecret },
    })
  },

  async getQueueStats(adminSecret: string) {
    return apiFetch<unknown>('/internal/queue', {
      headers: { 'x-admin-secret': adminSecret },
    })
  },

  async patchUser(adminSecret: string, userId: string, updates: Record<string, unknown>) {
    return apiFetch<unknown>(`/internal/users/${userId}`, {
      method: 'PATCH',
      headers: { 'x-admin-secret': adminSecret, 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
  },
}
