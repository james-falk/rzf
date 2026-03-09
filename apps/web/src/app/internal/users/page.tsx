'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface User {
  id: string
  email: string
  tier: string
  role: string
  runCredits: number
  createdAt: string
  _count: { agentRuns: number }
}

export default function InternalUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [tierFilter, setTierFilter] = useState('')

  async function load(p = 1, tier = '') {
    setLoading(true)
    const secret = localStorage.getItem('admin_secret') ?? ''
    try {
      const data = await api.getInternalUsers(secret, p, tier || undefined) as { users: User[]; total: number; pages: number }
      setUsers(data.users)
      setTotal(data.total)
    } catch {
      // handle
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(page, tierFilter) }, [page, tierFilter])

  async function grantPaid(userId: string) {
    const secret = localStorage.getItem('admin_secret') ?? ''
    await api.patchUser(secret, userId, { tier: 'paid', runCredits: 50 })
    load(page, tierFilter)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users ({total})</h1>
        <select
          value={tierFilter}
          onChange={(e) => { setTierFilter(e.target.value); setPage(1) }}
          className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white"
        >
          <option value="">All tiers</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="rounded-xl border border-white/10 bg-zinc-900 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs text-zinc-400">
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Tier</th>
              <th className="px-4 py-3 font-medium">Credits</th>
              <th className="px-4 py-3 font-medium">Runs</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-zinc-400">Loading...</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="hover:bg-white/2 text-sm">
                <td className="px-4 py-3 text-white">{u.email}</td>
                <td className="px-4 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    u.tier === 'paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-700 text-zinc-400'
                  }`}>
                    {u.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-300">{u.runCredits}</td>
                <td className="px-4 py-3 text-zinc-300">{u._count.agentRuns}</td>
                <td className="px-4 py-3 text-zinc-500">{formatRelativeTime(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.tier === 'free' && (
                    <button
                      onClick={() => grantPaid(u.id)}
                      className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Grant Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
