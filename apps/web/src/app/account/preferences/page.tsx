'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { api } from '@/lib/api'

interface Prefs {
  leagueStyle: string
  scoringPriority: string
  playStyle: string
  reportFormat: string
  priorityPositions: string[]
  customInstructions: string | null
  notifyOnInjury: boolean
  notifyOnTrending: boolean
}

const defaultPrefs: Prefs = {
  leagueStyle: 'redraft',
  scoringPriority: 'ppr',
  playStyle: 'balanced',
  reportFormat: 'detailed',
  priorityPositions: [],
  customInstructions: '',
  notifyOnInjury: false,
  notifyOnTrending: false,
}

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF']

export default function PreferencesPage() {
  const { getToken } = useAuth()
  const [prefs, setPrefs] = useState<Prefs>(defaultPrefs)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.getPreferences(token)
        if (data.preferences) setPrefs(data.preferences as Prefs)
      } catch {
        // use defaults
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    try {
      const token = await getToken()
      if (!token) return
      await api.updatePreferences(token, {
        ...prefs,
        customInstructions: prefs.customInstructions || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // handle
    } finally {
      setSaving(false)
    }
  }

  function togglePosition(pos: string) {
    setPrefs((prev) => ({
      ...prev,
      priorityPositions: prev.priorityPositions.includes(pos)
        ? prev.priorityPositions.filter((p) => p !== pos)
        : [...prev.priorityPositions, pos],
    }))
  }

  if (loading) return <div className="text-sm text-zinc-400">Loading...</div>

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold text-white">Preferences</h1>
      <p className="mb-8 text-zinc-400">
        Customize how your reports are generated. These are injected into every agent run.
      </p>

      <form onSubmit={handleSave} className="space-y-6">
        {/* League settings */}
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="mb-5 text-base font-semibold text-white">League Settings</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <SelectField
              label="League Style"
              value={prefs.leagueStyle}
              onChange={(v) => setPrefs((p) => ({ ...p, leagueStyle: v }))}
              options={[
                { value: 'redraft', label: 'Redraft' },
                { value: 'keeper', label: 'Keeper' },
                { value: 'dynasty', label: 'Dynasty' },
              ]}
            />
            <SelectField
              label="Scoring"
              value={prefs.scoringPriority}
              onChange={(v) => setPrefs((p) => ({ ...p, scoringPriority: v }))}
              options={[
                { value: 'ppr', label: 'PPR' },
                { value: 'half_ppr', label: 'Half-PPR' },
                { value: 'standard', label: 'Standard' },
              ]}
            />
            <SelectField
              label="Play Style"
              value={prefs.playStyle}
              onChange={(v) => setPrefs((p) => ({ ...p, playStyle: v }))}
              options={[
                { value: 'safe_floor', label: 'Safe Floor' },
                { value: 'balanced', label: 'Balanced' },
                { value: 'boom_bust', label: 'Boom/Bust' },
              ]}
            />
          </div>
        </div>

        {/* Report format */}
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="mb-5 text-base font-semibold text-white">Report Format</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: 'detailed', label: 'Detailed', desc: 'Full breakdown with context and reasoning' },
              { value: 'concise', label: 'Concise', desc: 'Key bullets only — fast to read' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${
                  prefs.reportFormat === opt.value
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <input
                  type="radio"
                  name="reportFormat"
                  value={opt.value}
                  checked={prefs.reportFormat === opt.value}
                  onChange={() => setPrefs((p) => ({ ...p, reportFormat: opt.value }))}
                  className="mt-0.5 accent-red-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">{opt.label}</p>
                  <p className="text-xs text-zinc-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Priority positions */}
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="mb-2 text-base font-semibold text-white">Priority Positions</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Which positions matter most to your team strategy?
          </p>
          <div className="flex flex-wrap gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => togglePosition(pos)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  prefs.priorityPositions.includes(pos)
                    ? 'border-red-500/50 bg-red-500/20 text-red-300'
                    : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* Custom instructions */}
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6">
          <h2 className="mb-2 text-base font-semibold text-white">Custom Instructions</h2>
          <p className="mb-4 text-sm text-zinc-400">
            Free-text instructions injected into every agent prompt. Examples:
            <em className="ml-1 text-zinc-500">
              &quot;I&apos;m trying to win now&quot; or &quot;I have Kelce on IR, assume I&apos;m streaming TE&quot;
            </em>
          </p>
          <textarea
            value={prefs.customInstructions ?? ''}
            onChange={(e) => setPrefs((p) => ({ ...p, customInstructions: e.target.value }))}
            placeholder="Add any specific context about your team or strategy..."
            rows={4}
            maxLength={500}
            className="w-full rounded-lg border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500"
          />
          <p className="mt-1 text-right text-xs text-zinc-500">
            {(prefs.customInstructions ?? '').length}/500
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
          {saved && <p className="text-sm text-emerald-400">Preferences saved!</p>}
        </div>
      </form>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2.5 text-sm text-white outline-none focus:border-red-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}
