'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, SignInButton } from '@clerk/nextjs'

type FeedType = 'sources' | 'players' | 'team' | 'sleeper'

interface SourceRow {
  id: string
  name: string
  platform: string
  avatarUrl: string | null
  feedUrl: string | null
}

interface FeedRow {
  id: string
  name: string
  config: unknown
  createdAt: string
}

const NFL_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN', 'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LAC', 'LAR',
  'LV', 'MIA', 'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SEA', 'SF', 'TB', 'TEN', 'WAS',
]

export function CustomFeedsManager({
  userTier,
  sources,
}: {
  userTier: string | null
  sources: SourceRow[]
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const isPaid = userTier === 'paid'
  const freeFeedLimit = 2
  const paidFeedLimit = 5
  const maxFeeds = isPaid ? paidFeedLimit : freeFeedLimit

  const [feeds, setFeeds] = useState<FeedRow[]>([])
  const [limit, setLimit] = useState(maxFeeds)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [feedType, setFeedType] = useState<FeedType>('sources')
  const [name, setName] = useState('')
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set())
  const [playerIdsRaw, setPlayerIdsRaw] = useState('')
  const [teamAbbr, setTeamAbbr] = useState('KC')
  const [sleeperLeagueId, setSleeperLeagueId] = useState('')
  const [leagues, setLeagues] = useState<Array<{ id: string; name: string; size: number }>>([])
  const [saving, setSaving] = useState(false)

  const loadFeeds = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/custom-feeds', { credentials: 'same-origin' })
      if (!res.ok) throw new Error('Failed to load feeds')
      const data = (await res.json()) as { feeds: FeedRow[]; limit: number }
      setFeeds(data.feeds)
      setLimit(data.limit)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSignedIn) return
    void loadFeeds()
  }, [isSignedIn, loadFeeds])

  useEffect(() => {
    if (!wizardOpen || feedType !== 'sleeper') return
    void (async () => {
      try {
        const res = await fetch('/api/sleeper-roster', { credentials: 'same-origin' })
        const data = (await res.json()) as { leagues?: Array<{ id: string; name: string; size: number }> }
        setLeagues(data.leagues ?? [])
      } catch {
        setLeagues([])
      }
    })()
  }, [wizardOpen, feedType])

  if (!isLoaded) {
    return (
      <div className="rounded-xl border py-12 text-center text-sm" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)', color: 'rgb(115,115,115)' }}>
        Loading…
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border p-10 text-center"
        style={{ borderColor: 'rgba(220,38,38,0.25)', background: 'rgba(220,38,38,0.04)' }}
      >
        <div className="relative">
          <h3 className="text-lg font-bold text-white">Sign in to use custom feeds</h3>
          <p className="mx-auto mt-2 max-w-md text-sm" style={{ color: 'rgb(115,115,115)' }}>
            Free accounts get {freeFeedLimit} saved feeds; paid accounts get {paidFeedLimit}.
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'rgb(220,38,38)' }}
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  const toggleSource = (id: string) => {
    setSelectedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const resetWizard = () => {
    setStep(1)
    setFeedType('sources')
    setName('')
    setSelectedSources(new Set())
    setPlayerIdsRaw('')
    setTeamAbbr('KC')
    setSleeperLeagueId('')
  }

  const submitCreate = async () => {
    setSaving(true)
    setError(null)
    try {
      let config: Record<string, unknown>
      if (feedType === 'sources') {
        if (selectedSources.size === 0) {
          setError('Select at least one source.')
          setSaving(false)
          return
        }
        config = { feedType: 'sources', sourceIds: Array.from(selectedSources) }
      } else if (feedType === 'players') {
        const ids = playerIdsRaw
          .split(/[\s,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
        if (ids.length === 0) {
          setError('Enter at least one Sleeper player ID.')
          setSaving(false)
          return
        }
        config = { feedType: 'players', playerIds: ids.slice(0, 10) }
      } else if (feedType === 'team') {
        config = { feedType: 'team', teamAbbr }
      } else {
        if (!sleeperLeagueId.trim()) {
          setError('Select a Sleeper league.')
          setSaving(false)
          return
        }
        config = { feedType: 'sleeper', sleeperLeagueId: sleeperLeagueId.trim() }
      }

      const res = await fetch('/api/custom-feeds', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || 'My feed', config }),
      })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
        throw new Error(j.message ?? j.error ?? 'Could not create feed')
      }
      setWizardOpen(false)
      resetWizard()
      await loadFeeds()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const deleteFeed = async (id: string) => {
    if (!confirm('Delete this feed?')) return
    try {
      const res = await fetch(`/api/custom-feeds/${id}`, { method: 'DELETE', credentials: 'same-origin' })
      if (!res.ok) throw new Error('Delete failed')
      await loadFeeds()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-white">Your custom feeds</h3>
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
            {feeds.length} / {limit} feeds · {isPaid ? 'Paid' : 'Free'} plan
          </p>
        </div>
        <button
          type="button"
          disabled={feeds.length >= limit}
          onClick={() => {
            resetWizard()
            setWizardOpen(true)
          }}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: 'rgb(220,38,38)' }}
        >
          + Create feed
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border px-3 py-2 text-sm" style={{ borderColor: 'rgba(239,68,68,0.4)', color: 'rgb(252,165,165)' }}>
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
          Loading feeds…
        </p>
      ) : feeds.length === 0 ? (
        <div className="rounded-xl border py-12 text-center" style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}>
          <p className="text-sm" style={{ color: 'rgb(115,115,115)' }}>
            No saved feeds yet. Create one from sources, players, an NFL team, or your Sleeper roster.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {feeds.map((f) => (
            <li
              key={f.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
              style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(14,14,14)' }}
            >
              <div>
                <p className="font-medium text-white">{f.name}</p>
                <p className="text-xs" style={{ color: 'rgb(115,115,115)' }}>
                  {typeof f.config === 'object' && f.config && 'feedType' in f.config ? String((f.config as { feedType: string }).feedType) : 'feed'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/feed/custom/${f.id}`}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
                  style={{ background: 'rgb(38,38,38)' }}
                >
                  Open
                </Link>
                <button
                  type="button"
                  onClick={() => void deleteFeed(f.id)}
                  className="text-xs"
                  style={{ color: 'rgb(239,68,68)' }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {wizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6"
            style={{ borderColor: 'rgb(38,38,38)', background: 'rgb(18,18,18)' }}
            role="dialog"
            aria-modal
          >
            <h4 className="text-lg font-bold text-white">Create custom feed</h4>
            <p className="mt-1 text-xs" style={{ color: 'rgb(115,115,115)' }}>
              Step {step} of 3
            </p>

            {step === 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm" style={{ color: 'rgb(163,163,163)' }}>
                  Choose what to follow:
                </p>
                {(
                  [
                    ['sources', 'Specific sources'],
                    ['players', 'Player mentions (Sleeper IDs)'],
                    ['team', 'NFL team'],
                    ['sleeper', 'My Sleeper league roster'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedType(value)}
                    className="flex w-full rounded-lg border px-3 py-2 text-left text-sm transition"
                    style={
                      feedType === value
                        ? { borderColor: 'rgb(220,38,38)', background: 'rgba(220,38,38,0.12)', color: 'white' }
                        : { borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }
                    }
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-4 w-full rounded-lg py-2 text-sm font-semibold text-white"
                  style={{ background: 'rgb(220,38,38)' }}
                >
                  Next
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="mt-4 space-y-3">
                {feedType === 'sources' && (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded border p-2" style={{ borderColor: 'rgb(38,38,38)' }}>
                    {sources.map((s) => (
                      <label key={s.id} className="flex cursor-pointer items-center gap-2 text-xs" style={{ color: 'rgb(163,163,163)' }}>
                        <input
                          type="checkbox"
                          checked={selectedSources.has(s.id)}
                          onChange={() => toggleSource(s.id)}
                        />
                        <span className="truncate">{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {feedType === 'players' && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'rgb(115,115,115)' }}>
                      Sleeper player IDs (comma or space separated, max 10)
                    </label>
                    <textarea
                      value={playerIdsRaw}
                      onChange={(e) => setPlayerIdsRaw(e.target.value)}
                      rows={4}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white"
                      style={{ background: 'rgb(10,10,10)', borderColor: 'rgb(38,38,38)' }}
                      placeholder="e.g. 4881 4034 6786"
                    />
                  </div>
                )}
                {feedType === 'team' && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'rgb(115,115,115)' }}>
                      NFL team
                    </label>
                    <select
                      value={teamAbbr}
                      onChange={(e) => setTeamAbbr(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white"
                      style={{ background: 'rgb(10,10,10)', borderColor: 'rgb(38,38,38)' }}
                    >
                      {NFL_TEAMS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {feedType === 'sleeper' && (
                  <div>
                    <label className="text-xs font-medium" style={{ color: 'rgb(115,115,115)' }}>
                      League
                    </label>
                    <select
                      value={sleeperLeagueId}
                      onChange={(e) => setSleeperLeagueId(e.target.value)}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white"
                      style={{ background: 'rgb(10,10,10)', borderColor: 'rgb(38,38,38)' }}
                    >
                      <option value="">Select league…</option>
                      {leagues.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} ({l.size} teams)
                        </option>
                      ))}
                    </select>
                    {leagues.length === 0 && (
                      <p className="mt-2 text-xs" style={{ color: 'rgb(239,68,68)' }}>
                        Connect Sleeper and ensure leagues load — see Account.
                      </p>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-lg border py-2 text-sm"
                    style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold text-white"
                    style={{ background: 'rgb(220,38,38)' }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-medium" style={{ color: 'rgb(115,115,115)' }}>
                    Feed name
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm text-white"
                    style={{ background: 'rgb(10,10,10)', borderColor: 'rgb(38,38,38)' }}
                    placeholder="e.g. Waiver wire — my guys"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 rounded-lg border py-2 text-sm"
                    style={{ borderColor: 'rgb(38,38,38)', color: 'rgb(163,163,163)' }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void submitCreate()}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'rgb(220,38,38)' }}
                  >
                    {saving ? 'Saving…' : 'Save feed'}
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setWizardOpen(false)
                resetWizard()
              }}
              className="mt-4 w-full text-xs"
              style={{ color: 'rgb(115,115,115)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
