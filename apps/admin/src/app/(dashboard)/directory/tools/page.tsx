'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, type FantasyTool } from '@/lib/api'
import { Plus, Pencil, Trash2, Check, X, Globe, Star, RefreshCw } from 'lucide-react'

const CATEGORIES = ['AI', 'Rankings', 'DFS', 'Trade Analysis', 'Roster Mgmt', 'Projections', 'Dynasty', 'News']
const PRICE_TYPES = ['free', 'freemium', 'paid']
const PARTNER_TIERS = ['', 'gold', 'silver', 'bronze']

const empty = (): Omit<FantasyTool, 'id'> => ({
  name: '', description: '', url: '', logoUrl: null, categories: [],
  priceType: 'free', price: null, promoCode: null, promoDesc: null,
  featured: false, partnerTier: null, isActive: true, sortOrder: 0,
})

function ToolForm({
  initial,
  onSave,
  onCancel,
  loading,
}: {
  initial: Omit<FantasyTool, 'id'>
  onSave: (data: Omit<FantasyTool, 'id'>) => void
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
            placeholder="https://... (blank = auto Clearbit)"
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Price Type *</label>
          <select value={form.priceType} onChange={(e) => set('priceType', e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600">
            {PRICE_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        {form.priceType !== 'free' && (
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">Price Display (e.g. $7.99/mo)</label>
            <input value={form.price ?? ''} onChange={(e) => set('price', e.target.value || null)}
              className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600" />
          </div>
        )}
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
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">Partner Tier</label>
          <select value={form.partnerTier ?? ''} onChange={(e) => set('partnerTier', e.target.value || null)}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-red-600">
            {PARTNER_TIERS.map((t) => <option key={t} value={t}>{t || '(none)'}</option>)}
          </select>
        </div>
      </div>

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

      <div className="flex gap-4">
        {[{ label: 'Featured', key: 'featured' }, { label: 'Active', key: 'isActive' }].map(({ label, key }) => (
          <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => set(key, e.target.checked)} className="h-4 w-4 accent-red-600" />
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

export default function FantasyToolsPage() {
  const [tools, setTools] = useState<FantasyTool[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.getFantasyTools()
      setTools(res.tools)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleCreate = async (data: Omit<FantasyTool, 'id'>) => {
    setSaving(true)
    try {
      const res = await api.createFantasyTool(data)
      setTools((prev) => [...prev, res.tool])
      setAdding(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async (id: string, data: Omit<FantasyTool, 'id'>) => {
    setSaving(true)
    try {
      const res = await api.updateFantasyTool(id, data)
      setTools((prev) => prev.map((t) => (t.id === id ? res.tool : t)))
      setEditing(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this fantasy tool?')) return
    try {
      await api.deleteFantasyTool(id)
      setTools((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Fantasy Tools</h1>
          <p className="mt-1 text-sm text-zinc-400">{tools.length} tools · powers the /tools directory page</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => void load()} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => { setAdding(true); setEditing(null) }}
            className="flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600">
            <Plus size={14} /> Add Tool
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          {error} <button onClick={() => setError(null)} className="ml-3 underline">dismiss</button>
        </div>
      )}

      {adding && (
        <ToolForm initial={empty()} onSave={handleCreate} onCancel={() => setAdding(false)} loading={saving} />
      )}

      {loading ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-sm text-zinc-500">Loading…</div>
      ) : (
        <div className="space-y-3">
          {tools.map((tool) => (
            <div key={tool.id}>
              {editing === tool.id ? (
                <ToolForm
                  initial={{ name: tool.name, description: tool.description, url: tool.url, logoUrl: tool.logoUrl, categories: tool.categories, priceType: tool.priceType, price: tool.price, promoCode: tool.promoCode, promoDesc: tool.promoDesc, featured: tool.featured, partnerTier: tool.partnerTier, isActive: tool.isActive, sortOrder: tool.sortOrder }}
                  onSave={(data) => void handleUpdate(tool.id, data)}
                  onCancel={() => setEditing(null)}
                  loading={saving}
                />
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{tool.name}</span>
                      {tool.featured && <Star size={12} className="text-yellow-400" />}
                      {tool.partnerTier && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tool.partnerTier === 'gold' ? 'bg-yellow-500/20 text-yellow-300' : tool.partnerTier === 'silver' ? 'bg-zinc-400/20 text-zinc-300' : 'bg-amber-700/20 text-amber-400'}`}>
                          {tool.partnerTier}
                        </span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tool.priceType === 'free' ? 'bg-green-500/20 text-green-300' : tool.priceType === 'freemium' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                        {tool.priceType}{tool.price ? ` · ${tool.price}` : ''}
                      </span>
                      {!tool.isActive && <span className="rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-400">Inactive</span>}
                      {tool.categories.map((c) => (
                        <span key={c} className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{c}</span>
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-1">{tool.description}</p>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-zinc-600">
                      <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-zinc-400">
                        <Globe size={10} /> {tool.url}
                      </a>
                      {tool.promoCode && <span className="text-yellow-600">🎟 {tool.promoCode}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => { setEditing(tool.id); setAdding(false) }}
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => void handleDelete(tool.id)}
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-red-900/20 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {tools.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-zinc-900 p-8 text-center text-sm text-zinc-500">
              No tools yet. Click "Add Tool" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
