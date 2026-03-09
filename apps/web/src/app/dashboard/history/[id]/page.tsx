'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { TeamEvalResults } from '@/components/TeamEvalResults'
import type { AgentRunResult } from '@/components/TeamEvalResults'
import type { TeamEvalOutput } from '@rzf/shared/types'

export default function HistoryDetailPage() {
  const { getToken } = useAuth()
  const { id } = useParams<{ id: string }>()
  const [run, setRun] = useState<AgentRunResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()
        if (!token) return
        const data = await api.getAgentRun(token, id)
        setRun(data)
      } catch {
        setError('Could not load this report.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken, id])

  async function handleRate(rating: 'up' | 'down') {
    if (!run) return
    try {
      const token = await getToken()
      if (!token) return
      await api.rateAgentRun(token, run.id, rating)
      setRun((prev) => (prev ? { ...prev, rating } : null))
    } catch {
      // non-critical
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/dashboard/history"
          className="text-sm text-zinc-400 hover:text-white"
        >
          ← History
        </Link>
        <h1 className="text-3xl font-bold text-white">Team Evaluation Report</h1>
      </div>

      {loading ? (
        <div className="text-sm text-zinc-400">Loading report...</div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-sm text-red-400">
          {error}
        </div>
      ) : !run ? null : run.status !== 'done' || !run.output ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900 p-6 text-sm text-zinc-400">
          This run did not complete successfully (status: {run.status}).
          {run.errorMessage && <p className="mt-2 text-red-400">{run.errorMessage}</p>}
        </div>
      ) : (
        <TeamEvalResults
          result={run as AgentRunResult & { output: TeamEvalOutput }}
          onRate={handleRate}
        />
      )}
    </div>
  )
}
