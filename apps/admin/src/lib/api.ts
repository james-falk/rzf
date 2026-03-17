// eslint-disable-next-line no-restricted-syntax
const API_BASE = (process.env['NEXT_PUBLIC_API_BASE_URL'] ?? 'http://localhost:3001').replace(/\/$/, '')

function getSecret(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('rzf_admin_secret') ?? ''
}

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': getSecret(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new ApiError(res.status, (err as { error?: string }).error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
  get isUnauthorized() { return this.status === 401 || this.status === 403 }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Overview {
  users: { total: number; today: number; week: number; free: number; paid: number }
  runs: { total: number; today: number; failed: number }
  analytics: { totalEvents: number }
}

export interface RunStats {
  summary: {
    totalLast30Days: number
    today: number
    week: number
    successRate: number
    avgTokens: number
    avgDurationMs: number
    failed: number
    avgConfidence: number | null
  }
  daily: Array<{ date: string; done: number; failed: number; queued: number; running: number; tokens: number }>
  byAgentType: Array<{ agentType: string; total: number; done: number; failed: number; avgTokens: number; avgDurationMs: number }>
}

export interface AgentRun {
  id: string
  agentType: string
  status: string
  tokensUsed: number | null
  durationMs: number | null
  rating: string | null
  errorMessage: string | null
  confidenceScore: number | null
  inputJson: Record<string, unknown>
  outputJson: Record<string, unknown> | null
  createdAt: string
  user: { email: string; tier: string }
}

export interface SourceSummary {
  id: string
  name: string
  platform: string
  feedUrl: string
  avatarUrl: string | null
  isActive: boolean
  tier: number
  refreshIntervalMins: number
  lastFetchedAt: string | null
  itemCount: number
  health: 'healthy' | 'stale' | 'inactive'
}

export interface SourcesResponse {
  sources: SourceSummary[]
  summary: { total: number; active: number; stale: number; totalItems: number }
}

export interface ContentStats {
  summary: {
    totalItems: number
    itemsThisWeek: number
    totalSources: number
    activeSources: number
    avgItemsPerSource: number
    uniquePlayersMentioned: number
  }
  daily: Array<Record<string, number | string> & { date: string }>
  byContentType: Array<{ type: string; count: number }>
  byPlatform: Array<{ platform: string; count: number }>
  topics: Array<{ topic: string; count: number }>
  topPlayers: Array<{ playerId: string; name: string; position: string; team: string; mentions: number }>
}

export interface SourceItem {
  id: string
  title: string
  contentType: string
  sourceUrl: string
  publishedAt: string | null
  fetchedAt: string
  topics: string[]
  importanceScore: number | null
  _count: { playerMentions: number }
}

export interface QueueStats {
  agents: { waiting: number; active: number; completed: number; failed: number; delayed: number; error?: string }
  ingestion: { waiting: number; active: number; completed: number; failed: number; delayed: number; error?: string }
}

export type ContentPlatform = 'rss' | 'youtube' | 'twitter' | 'podcast' | 'reddit' | 'api' | 'manual'

export interface SourceCreateInput {
  name: string
  platform: ContentPlatform
  feedUrl: string
  refreshIntervalMins?: number
  isActive?: boolean
  avatarUrl?: string
  platformConfig?: Record<string, unknown>
}

export interface SourceUpdateInput {
  name?: string
  feedUrl?: string
  refreshIntervalMins?: number
  isActive?: boolean
  avatarUrl?: string | null
  platformConfig?: Record<string, unknown>
}

export interface RefreshJobResult {
  success: boolean
  jobId: string
  sourceId: string
  sourceName: string
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const api = {
  getOverview: () => adminFetch<Overview>('/internal/overview'),

  getRunStats: () => adminFetch<RunStats>('/internal/runs/stats'),

  getRuns: (page = 1, status?: string, agentType?: string) => {
    const params = new URLSearchParams({ page: String(page), ...(status ? { status } : {}), ...(agentType ? { agentType } : {}) })
    return adminFetch<{ runs: AgentRun[]; total: number; pages: number }>(`/internal/runs?${params}`)
  },

  getSources: () => adminFetch<SourcesResponse>('/internal/sources'),

  getSourceItems: (id: string, page = 1) => {
    const params = new URLSearchParams({ page: String(page) })
    return adminFetch<{ items: SourceItem[]; total: number; pages: number }>(`/internal/sources/${id}/items?${params}`)
  },

  getContentStats: () => adminFetch<ContentStats>('/internal/content/stats'),

  getQueueStats: () => adminFetch<QueueStats>('/internal/queue'),

  triggerIngestion: (type: string) =>
    adminFetch<{ jobId: string; type: string; status: string }>('/internal/ingestion/trigger', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),

  createSource: (data: SourceCreateInput) =>
    adminFetch<SourceSummary>('/internal/sources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateSource: (id: string, data: SourceUpdateInput) =>
    adminFetch<SourceSummary>(`/internal/sources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteSource: (id: string) =>
    adminFetch<{ success: boolean; deleted: string }>(`/internal/sources/${id}`, {
      method: 'DELETE',
    }),

  refreshSource: (id: string) =>
    adminFetch<RefreshJobResult>(`/internal/sources/${id}/refresh`, {
      method: 'POST',
      body: '{}',
    }),

  getAgentConfigs: () =>
    adminFetch<{ configs: AgentConfig[] }>('/internal/agents/configs'),

  updateAgentConfig: (agentType: string, data: Partial<AgentConfig>) =>
    adminFetch<{ config: AgentConfig }>(`/internal/agents/configs/${agentType}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  resetAgentConfig: (agentType: string) =>
    adminFetch<{ config: AgentConfig; reset: boolean }>(`/internal/agents/configs/${agentType}/reset`, {
      method: 'POST',
    }),

  pingHealth: () =>
    fetch(`${API_BASE}/health`).then((r) => r.json() as Promise<{ status: string; ts: string }>),

  getTokenUsage: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams()
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    const qs = params.toString()
    return adminFetch<TokenUsageResponse>(`/internal/usage/tokens${qs ? `?${qs}` : ''}`)
  },

  cleanupMentions: () =>
    adminFetch<{ success: boolean; deletedDuplicateMentions: number; deletedInactiveMentions: number }>(
      '/internal/maintenance/cleanup-mentions',
      { method: 'POST' },
    ),

  getQueueJobs: (queue: 'agents' | 'ingestion', limit = 20) =>
    adminFetch<{ jobs: QueueJob[] }>(`/internal/queue/jobs?queue=${queue}&limit=${limit}`),

  getFeedback: (app: 'rostermind' | 'directory' | 'all' = 'all', page = 1) =>
    adminFetch<FeedbackResponse>(`/internal/feedback?app=${app}&page=${page}`),

  getRankingSites: () =>
    adminFetch<{ sites: RankingSite[] }>('/internal/ranking-sites'),

  createRankingSite: (data: Omit<RankingSite, 'id'>) =>
    adminFetch<{ site: RankingSite }>('/internal/ranking-sites', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRankingSite: (id: string, data: Partial<Omit<RankingSite, 'id'>>) =>
    adminFetch<{ site: RankingSite }>(`/internal/ranking-sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRankingSite: (id: string) =>
    adminFetch<{ success: boolean }>(`/internal/ranking-sites/${id}`, { method: 'DELETE' }),

  getFantasyTools: () =>
    adminFetch<{ tools: FantasyTool[] }>('/internal/fantasy-tools'),

  createFantasyTool: (data: Omit<FantasyTool, 'id'>) =>
    adminFetch<{ tool: FantasyTool }>('/internal/fantasy-tools', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFantasyTool: (id: string, data: Partial<Omit<FantasyTool, 'id'>>) =>
    adminFetch<{ tool: FantasyTool }>(`/internal/fantasy-tools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFantasyTool: (id: string) =>
    adminFetch<{ success: boolean }>(`/internal/fantasy-tools/${id}`, { method: 'DELETE' }),

  updateSourceLogo: (id: string, logoUrl: string | null) =>
    adminFetch<{ source: SourceSummary }>(`/internal/sources/${id}/logo`, {
      method: 'PATCH',
      body: JSON.stringify({ logoUrl }),
    }),
}

export interface TokenUsageRow {
  userId: string
  email: string
  tier: string
  runs: number
  tokens: number
  costUsd: number
}

export interface AgentUsageRow {
  agentType: string
  runs: number
  tokensUsed: number
  costUsd: number
  avgTokensPerRun: number
}

export interface TokenUsageResponse {
  rows: TokenUsageRow[]
  byAgent: AgentUsageRow[]
  totalTokens: number
  totalCostUsd: number
  since: string
  until: string
}

export interface QueueJob {
  id: string | undefined
  name: string
  status: string
  agentType: string | null
  timestamp: number
  processedOn: number | null
  finishedOn: number | null
  failedReason: string | null
}

export interface AgentConfig {
  id: string
  agentType: string
  label: string
  description: string
  systemPrompt: string
  modelTier: string
  maxTokens: number | null
  enabled: boolean
  showInAnalyze: boolean
  sortOrder: number
  allowedSourceTiers: number[]
  allowedPlatforms: string[]
  recencyWindowHours: number
  maxContentItems: number
  updatedAt: string
  updatedBy: string | null
}

export interface FeedbackItem {
  id: string
  app: string
  message: string
  userId: string | null
  userEmail: string | null
  userTier: string | null
  pageUrl: string | null
  createdAt: string
}

export interface FeedbackResponse {
  items: FeedbackItem[]
  total: number
  rostermindCount: number
  directoryCount: number
  page: number
  pages: number
}

export interface RankingSite {
  id: string
  name: string
  description: string
  url: string
  logoUrl: string | null
  categories: string[]
  popularityScore: number
  promoCode: string | null
  promoDesc: string | null
  featured: boolean
  isActive: boolean
  sortOrder: number
}

export interface FantasyTool {
  id: string
  name: string
  description: string
  url: string
  logoUrl: string | null
  categories: string[]
  priceType: string
  price: string | null
  promoCode: string | null
  promoDesc: string | null
  featured: boolean
  partnerTier: string | null
  isActive: boolean
  sortOrder: number
}


