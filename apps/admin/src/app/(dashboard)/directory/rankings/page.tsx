'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type RankingSite } from '@/lib/api'
import { Plus, Pencil, Trash2, Check, X, Globe, Star, RefreshCw } from 'lucide-react'

const CATEGORIES = ['Redraft', 'Dynasty', 'DFS', 'Best Ball', 'Tools']

const empty = (): Omit<RankingSite, 'id'> => ({
  name: '', description: '', url: '', logoUrl: null, categories: [],
  popularityScore: 5, promoCode: null, promoDesc: null,
  featured: false, isActive: true, sortOrder: 0,
})

function SiteForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: Omit<RankingSite, 'id'>
  onSave: (data: Omit<RankingSite, 'id'>) => void
  onCancel: () => void
  loading: boolean
}) {
  const [form, setForm] = useState(initial)
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))
  const toggleCat = (c: string) =>
    set('categories', form.categories.includes(c) ? form.categories.filter((x) => x !== c) : [...form.categories, c])

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-5 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">URL *</label>
          <input value={form.url} onChange={(e) => set('url', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-zinc-400">Description *</label>
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600 resize-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Logo URL (override)</label>
          <input value={form.logoUrl ?? ''} onChange={(e) => set('logoUrl', e.target.value || null)}
            placeholder="https://... (leave blank for auto Clearbit logo)"
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Popularity Score (1–10)</label>
          <input type="number" min={1} max={10} value={form.popularityScore}
            onChange={(e) => set('popularityScore', parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Promo Code</label>
          <input value={form.promoCode ?? ''} onChange={(e) => set('promoCode', e.target.value || null)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Promo Description</label>
          <input value={form.promoDesc ?? ''} onChange={(e) => set('promoDesc', e.target.value || null)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="mb-2 block text-xs font-medium text-zinc-400">Categories</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => toggleCat(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${form.categories.includes(c) ? 'bg-red-600/30 text-red-300 border border-red-600/40' : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex gap-4">
        {[
          { label: 'Featured', key: 'featured' },
          { label: 'Active', key: 'isActive' },
        ].map(({ label, key }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => set(key, e.target.checked)}
              className="h-4 w-4 accent-red-600" />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={loading || !form.name || !form.url || !form.description}
          className="flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-40">
          <Check size={14} /> Save
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/5">
          <X size={14} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function RankingSitesPage() {
  const [sites, setSites] = useState<RankingSite[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getRankingSites()
      setSites(res.sites)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleCreate = async (data: Omit<RankingSite, 'id'>) => {
    setSaving(true)
    try {
      const res = await api.createRankingSite(data)
      setSites((prev) => [...prev, res.site])
      setAdding(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string, data: Omit<RankingSite, 'id'>) => {
    setSaving(true)
    try {
      const res = await api.updateRankingSite(id, data)
      setSites((prev) => prev.map((s) => (s.id === id ? res.site : s)))
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ranking site?')) return
    try {
      await api.deleteRankingSite(id)
      setSites((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ranking Sites</h1>
          <p className="mt-1 text-sm text-zinc-400">{sites.length} sites · powers the /rankings directory page</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setAdding(true); setEditing(null) }}
            className="flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
            <Plus size={14} /> Add Site
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-3 underline">dismiss</button>
        </div>
      )}

      {adding && (
        <SiteForm initial={empty()} onSave={handleCreate} onCancel={() => setAdding(false)} loading={saving} />
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="space-y-3">
          {sites.map((site) => (
            <div key={site.id}>
              {editing === site.id ? (
                <SiteForm
                  initial={{ name: site.name, description: site.description, url: site.url, logoUrl: site.logoUrl, categories: site.categories, popularityScore: site.popularityScore, promoCode: site.promoCode, promoDesc: site.promoDesc, featured: site.featured, isActive: site.isActive, sortOrder: site.sortOrder }}
                  onSave={(data) => void handleUpdate(site.id, data)}
                  onCancel={() => setEditing(null)}
                  loading={saving}
                />
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{site.name}</span>
                      {site.featured && <Star size={12} className="text-yellow-400" />}
                      {!site.isActive && <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">Inactive</span>}
                      {site.categories.map((c) => (
                        <span key={c} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{c}</span>
                      ))}
                      <span className="text-[10px] text-zinc-500">Score: {site.popularityScore}/10</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{site.description}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-600">
                      <a href={site.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-zinc-400">
                        <Globe size={10} /> {site.url}
                      </a>
                      {site.promoCode && <span className="text-yellow-600">🎟 {site.promoCode}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => { setEditing(site.id); setAdding(false) }}
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => void handleDelete(site.id)}
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-900/20 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {sites.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-sm text-zinc-500">
              No ranking sites yet. Click "Add Site" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
