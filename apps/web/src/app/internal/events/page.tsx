'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface AnalyticsEvent {
  id: string
  eventType: string
  userId: string | null
  payload: Record<string, unknown>
  createdAt: string
}

const EVENT_TYPES = [
  'user.signup', 'user.upgrade.prompted', 'user.upgraded',
  'agent.run.started', 'agent.run.completed', 'agent.run.failed',
  'agent.result.rated', 'feature.used',
]

export default function InternalEventsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const secret = localStorage.getItem('admin_secret') ?? ''
      try {
        const data = await api.getInternalEvents(secret, 1, typeFilter || undefined) as { events: AnalyticsEvent[]; total: number }
        setEvents(data.events)
        setTotal(data.total)
      } catch {
        // handle
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [typeFilter])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Events ({total})</h1>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All event types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm text-zinc-400">Loading...</div>
        ) : events.map((e) => (
          <div key={e.id} className="rounded-lg border border-white/10 bg-zinc-900 px-4 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-white">{e.eventType}</span>
                  {e.userId && <span className="text-xs text-zinc-500">uid:{e.userId.slice(0, 8)}...</span>}
                </div>
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap break-all">
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              </div>
              <span className="shrink-0 text-xs text-zinc-500">{formatRelativeTime(e.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
