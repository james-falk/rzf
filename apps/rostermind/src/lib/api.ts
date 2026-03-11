'use client'

/**
 * API client for apps/api (Fastify backend).
 * Includes auth token from Clerk on every request.
 */

import type {
  TeamEvalOutput,
} from '@rzf/shared/types'
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

  async getLeagues(token: string) {
    return apiFetch<{ leagues: unknown[] }>('/sleeper/leagues', { token })
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

  async getAgentRun(token: string, runId: string) {
    return apiFetch<{
      id: string
      agentType: string
      status: 'queued' | 'running' | 'done' | 'failed'
      output: TeamEvalOutput | null
      tokensUsed: number | null
      durationMs: number | null
      rating: 'up' | 'down' | null
      errorMessage: string | null
      createdAt: string
    }>(`/agents/${runId}`, { token })
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

  async getPreferences(token: string) {
    return apiFetch<{ preferences: unknown }>('/preferences', { token })
  },

  async updatePreferences(token: string, prefs: Record<string, unknown>) {
    return apiFetch<{ preferences: unknown }>('/preferences', {
      method: 'PUT',
      token,
      body: JSON.stringify(prefs),
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
