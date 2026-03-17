'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'
import type { AgentConfig } from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SlidersHorizontal, ChevronRight, RotateCcw, Save, X } from 'lucide-react'

const MODEL_OPTIONS = [
  { value: 'haiku', label: 'Claude Haiku / GPT-4o-mini', desc: 'Fast, cheap. Best for most tasks.' },
  { value: 'sonnet', label: 'Claude Sonnet / GPT-4o', desc: 'More capable. Best for complex analysis.' },
]

const AGENT_ICONS: Record<string, string> = {
  team_eval: '📊',
  injury_watch: '🏥',
  waiver: '🔄',
  lineup: '📋',
  trade_analysis: '💱',
  player_scout: '🔍',
}

const PLATFORM_OPTIONS = ['rss', 'youtube', 'twitter', 'podcast', 'reddit']

export default function AgentConfigPage() {
  const router = useRouter()
  const [configs, setConfigs] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [editingType, setEditingType] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<AgentConfig>>({})
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [agentStats, setAgentStats] = useState<Record<string, { avgConfidence: number | null; runsWithScore: number }>>({})

  useEffect(() => {
    api.getAgentStats().then((res) => {
      const map: Record<string, { avgConfidence: number | null; runsWithScore: number }> = {}
      for (const s of res.stats) map[s.agentType] = { avgConfidence: s.avgConfidence, runsWithScore: s.runsWithScore }
      setAgentStats(map)
    }).catch(() => { /* non-critical */ })
  }, [])

  const showToast = useCallback((msg: string, type: 'success' | 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const load = useCallback(async () => {
    try {
      const data = await api.getAgentConfigs()
      setConfigs(data.configs)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) router.push('/login')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { load() }, [load])

  function openEdit(config: AgentConfig) {
    setEditingType(config.agentType)
    setDraft({ ...config })
  }

  function closeEdit() {
    setEditingType(null)
    setDraft({})
  }

  async function handleSave() {
    if (!editingType) return
    setSaving(true)
    try {
      const { config } = await api.updateAgentConfig(editingType, {
        label: draft.label,
        description: draft.description,
        systemPrompt: draft.systemPrompt,
        modelTier: draft.modelTier,
        enabled: draft.enabled,
        showInAnalyze: draft.showInAnalyze,
        allowedSourceTiers: draft.allowedSourceTiers,
        allowedPlatforms: draft.allowedPlatforms,
        recencyWindowHours: draft.recencyWindowHours,
        maxContentItems: draft.maxContentItems,
        updatedBy: 'admin',
      })
      setConfigs((prev) => prev.map((c) => (c.agentType === editingType ? config : c)))
      showToast('Config saved', 'success')
      closeEdit()
    } catch {
      showToast('Failed to save config', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleReset() {
    if (!editingType) return
    if (!confirm('Reset this agent to its default system prompt? This cannot be undone.')) return
    setResetting(true)
    try {
      const { config } = await api.resetAgentConfig(editingType)
      setConfigs((prev) => prev.map((c) => (c.agentType === editingType ? config : c)))
      setDraft({ ...config })
      showToast('Config reset to defaults', 'success')
    } catch {
      showToast('Failed to reset config', 'error')
    } finally {
      setResetting(false)
    }
  }

  async function handleToggleEnabled(config: AgentConfig) {
    try {
      const { config: updated } = await api.updateAgentConfig(config.agentType, { enabled: !config.enabled, updatedBy: 'admin' })
      setConfigs((prev) => prev.map((c) => (c.agentType === config.agentType ? updated : c)))
      showToast(`${updated.label} ${updated.enabled ? 'enabled' : 'disabled'}`, 'success')
    } catch {
      showToast('Failed to update', 'error')
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-zinc-400">Loading agent configs...</div>
  }

  return (
    <div className="p-6 md:p-8">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-xl',
          toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300',
        )}>
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={20} className="text-zinc-400" />
          <h1 className="text-xl font-bold text-white">Agent Config</h1>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          Edit system prompts, model tiers, and agent availability without a code deploy.
        </p>
      </div>

      {/* Agent list */}
      <div className="space-y-3">
        {configs.map((config) => (
          <div key={config.agentType} className="rounded-xl border border-white/10 bg-zinc-900">
            <div className="flex items-center gap-4 p-4">
              <span className="text-2xl">{AGENT_ICONS[config.agentType] ?? '🤖'}</span>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">{config.label}</p>
                  <span className={cn(
                    'rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase',
                    config.modelTier === 'sonnet'
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-400'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                  )}>
                    {config.modelTier}
                  </span>
                  {config.showInAnalyze && (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                      In Analyze
                    </span>
                  )}
                  {agentStats[config.agentType] != null && (
                    <span className={cn(
                      'rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      (agentStats[config.agentType]?.avgConfidence ?? 0) < 50
                        ? 'border-red-500/30 bg-red-500/10 text-red-400'
                        : (agentStats[config.agentType]?.avgConfidence ?? 0) < 70
                          ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                          : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
                    )}>
                      {agentStats[config.agentType]?.avgConfidence != null
                        ? `confidence ${agentStats[config.agentType]!.avgConfidence}%`
                        : 'no scores yet'}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-zinc-400">{config.description}</p>
                {config.updatedBy && (
                  <p className="mt-0.5 text-[10px] text-zinc-600">
                    Last updated by {config.updatedBy} · {new Date(config.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Enabled toggle */}
                <button
                  onClick={() => handleToggleEnabled(config)}
                  className={cn(
                    'relative flex h-5 w-9 items-center rounded-full transition',
                    config.enabled ? 'bg-emerald-500' : 'bg-zinc-700',
                  )}
                  title={config.enabled ? 'Disable agent' : 'Enable agent'}
                >
                  <span className={cn(
                    'absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-all',
                    config.enabled ? 'left-[18px]' : 'left-[3px]',
                  )} />
                </button>
                <button
                  onClick={() => openEdit(config)}
                  className="flex items-center gap-1 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
                >
                  Edit <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit drawer */}
      {editingType && (
        <div className="fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/60" onClick={closeEdit} />
          <div className="relative ml-auto flex h-full w-full max-w-2xl flex-col bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">{AGENT_ICONS[editingType] ?? '🤖'}</span>
                <h2 className="font-semibold text-white">Edit: {draft.label}</h2>
              </div>
              <button onClick={closeEdit} className="text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-5 p-6">
              {/* Label */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Label (shown to users)</label>
                <input
                  value={draft.label ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Description</label>
                <input
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                  className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                />
              </div>

              {/* Model */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">Model Tier</label>
                <div className="space-y-2">
                  {MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setDraft((d) => ({ ...d, modelTier: opt.value }))}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition',
                        draft.modelTier === opt.value
                          ? 'border-red-500/40 bg-red-500/5'
                          : 'border-white/10 bg-zinc-900 hover:border-white/20',
                      )}
                    >
                      <div className={cn('mt-0.5 h-4 w-4 rounded-full border-2 shrink-0', draft.modelTier === opt.value ? 'border-red-500 bg-red-500' : 'border-zinc-600')} />
                      <div>
                        <p className="text-sm font-medium text-white">{opt.label}</p>
                        <p className="text-xs text-zinc-400">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.enabled ?? true}
                    onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
                    className="h-4 w-4 rounded accent-red-500"
                  />
                  <span className="text-sm text-zinc-300">Enabled</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.showInAnalyze ?? true}
                    onChange={(e) => setDraft((d) => ({ ...d, showInAnalyze: e.target.checked }))}
                    className="h-4 w-4 rounded accent-red-500"
                  />
                  <span className="text-sm text-zinc-300">Show in Analyze page</span>
                </label>
              </div>

              {/* Source Control */}
              <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 space-y-4">
                <p className="text-xs font-semibold text-zinc-300">Source Control</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Recency Window (hours)</label>
                    <input
                      type="number"
                      min={1}
                      max={720}
                      value={draft.recencyWindowHours ?? 168}
                      onChange={(e) => setDraft((d) => ({ ...d, recencyWindowHours: parseInt(e.target.value) || 168 }))}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-zinc-400">Max Content Items</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={draft.maxContentItems ?? 10}
                      onChange={(e) => setDraft((d) => ({ ...d, maxContentItems: parseInt(e.target.value) || 10 }))}
                      className="w-full rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-red-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">Allowed Source Tiers</label>
                  <div className="flex gap-3">
                    {[1, 2, 3].map((tier) => {
                      const checked = (draft.allowedSourceTiers ?? [1, 2, 3]).includes(tier)
                      return (
                        <label key={tier} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const current = draft.allowedSourceTiers ?? [1, 2, 3]
                              setDraft((d) => ({
                                ...d,
                                allowedSourceTiers: checked
                                  ? current.filter((t) => t !== tier)
                                  : [...current, tier].sort(),
                              }))
                            }}
                            className="h-4 w-4 rounded accent-red-500"
                          />
                          <span className="text-sm text-zinc-300">
                            T{tier} {tier === 1 ? '(Premium)' : tier === 2 ? '(Established)' : '(General)'}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-zinc-400">Allowed Platforms</label>
                  <div className="flex flex-wrap gap-3">
                    {PLATFORM_OPTIONS.map((platform) => {
                      const checked = (draft.allowedPlatforms ?? ['rss', 'youtube']).includes(platform)
                      return (
                        <label key={platform} className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const current = draft.allowedPlatforms ?? ['rss', 'youtube']
                              setDraft((d) => ({
                                ...d,
                                allowedPlatforms: checked
                                  ? current.filter((p) => p !== platform)
                                  : [...current, platform],
                              }))
                            }}
                            className="h-4 w-4 rounded accent-red-500"
                          />
                          <span className="text-sm text-zinc-300 capitalize">{platform}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* System prompt */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">
                    System Prompt
                    <span className="ml-1 text-zinc-600">(use {'{userContext}'} as a placeholder)</span>
                  </label>
                  <span className="text-xs text-zinc-600">{(draft.systemPrompt ?? '').length} chars</span>
                </div>
                <textarea
                  value={draft.systemPrompt ?? ''}
                  onChange={(e) => setDraft((d) => ({ ...d, systemPrompt: e.target.value }))}
                  rows={20}
                  className="w-full resize-y rounded-lg border border-white/10 bg-zinc-900 px-3 py-2.5 font-mono text-xs leading-relaxed text-zinc-200 outline-none focus:border-red-500/50"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-6 py-4">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                <RotateCcw size={12} />
                {resetting ? 'Resetting...' : 'Reset to Default'}
              </button>
              <div className="flex gap-2">
                <button onClick={closeEdit} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:text-white">
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-40"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
