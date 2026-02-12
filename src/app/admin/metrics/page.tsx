'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import StatCard from '@/components/metrics/StatCard'
import BarChart from '@/components/metrics/BarChart'

interface Metrics {
  overview: {
    total_rounds: number
    completed_rounds: number
    total_participants: number
    total_ballots: number
  }
  completion_buckets: number[]
  converge_distribution: number[]
  tie_break_pct: number
  avg_time_seconds: number
  recent_rounds: {
    id: string
    prompt: string
    players: number
    ballots: number
    completion_pct: number
    rounds_count: number
    tie_break: boolean
    winner: string | null
    created_at: string
  }[]
}

export default function MetricsPage() {
  const [secret, setSecret] = useState('')
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchMetrics() {
    const token = secret || sessionStorage.getItem('metrics_secret') || ''
    if (!token) {
      setError('Enter a secret token')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error(res.status === 401 ? 'Invalid secret' : 'Failed to load metrics')
      }

      sessionStorage.setItem('metrics_secret', token)
      setMetrics(await res.json())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (!metrics) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h1>
            <p className="text-gray-500 mt-1">Enter the admin secret to view metrics.</p>
          </div>
          <Card>
            <div className="space-y-4">
              <Input
                label="Secret token"
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Enter METRICS_SECRET"
              />
            </div>
          </Card>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Button size="lg" className="w-full" onClick={fetchMetrics} loading={loading}>
            View Metrics
          </Button>
        </div>
      </main>
    )
  }

  const { overview, completion_buckets, converge_distribution, tie_break_pct, avg_time_seconds, recent_rounds } = metrics

  const formatTime = (s: number) => {
    if (s < 60) return `${s}s`
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}m ${sec}s`
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Metrics Dashboard</h1>

        {/* Overview stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Rounds" value={overview.total_rounds} />
          <StatCard label="Completed" value={overview.completed_rounds} />
          <StatCard label="Total Participants" value={overview.total_participants} />
          <StatCard label="Total Ballots" value={overview.total_ballots} />
        </div>

        {/* Completion rate distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ballot Completion Rate</h2>
          <BarChart
            data={[
              { label: '0-25%', value: completion_buckets[0] },
              { label: '26-50%', value: completion_buckets[1] },
              { label: '51-75%', value: completion_buckets[2] },
              { label: '76-100%', value: completion_buckets[3] },
            ]}
          />
        </Card>

        {/* Rounds to converge */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Rounds to Converge</h2>
          <BarChart
            data={[
              { label: '1 round', value: converge_distribution[0] },
              { label: '2 rounds', value: converge_distribution[1] },
              { label: '3 rounds', value: converge_distribution[2] },
              { label: '4+ rounds', value: converge_distribution[3] },
            ]}
          />
        </Card>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Tie-break Frequency" value={`${tie_break_pct}%`} detail="of completed rounds" />
          <StatCard label="Avg Time to Converge" value={formatTime(avg_time_seconds)} detail="ranking start to result" />
        </div>

        {/* Recent rounds table */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Rounds</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-2 font-medium text-gray-500">Prompt</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Players</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Ballots</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Completion</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Rounds</th>
                  <th className="pb-2 font-medium text-gray-500 text-center">Tie-break</th>
                  <th className="pb-2 font-medium text-gray-500">Winner</th>
                </tr>
              </thead>
              <tbody>
                {recent_rounds.map(r => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 max-w-[200px] truncate text-gray-900">{r.prompt}</td>
                    <td className="py-2 text-center text-gray-700">{r.players}</td>
                    <td className="py-2 text-center text-gray-700">{r.ballots}</td>
                    <td className="py-2 text-center text-gray-700">{r.completion_pct}%</td>
                    <td className="py-2 text-center text-gray-700">{r.rounds_count}</td>
                    <td className="py-2 text-center text-gray-700">{r.tie_break ? 'Yes' : ''}</td>
                    <td className="py-2 text-gray-700 max-w-[150px] truncate">{r.winner}</td>
                  </tr>
                ))}
                {recent_rounds.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-400">No completed rounds yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  )
}
