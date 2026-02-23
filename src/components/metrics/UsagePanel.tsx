'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import StatCard from '@/components/metrics/StatCard'
import BarChart from '@/components/metrics/BarChart'

interface UsageData {
  gemini: {
    total_calls: number
    total_tokens: number
    total_tokens_in: number
    total_tokens_out: number
    est_cost_usd: number
    by_day: Record<string, { calls: number; tokens: number }>
  }
  functions: {
    events_7d: number
    events_30d: number
    events_total: number
    by_day: Record<string, number>
    by_type: Record<string, number>
  }
  supabase: {
    total_bytes: number
    limit_bytes: number
    tables: { name: string; bytes: number }[]
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

function last14DaysData(byDay: Record<string, { calls: number; tokens: number }>): { label: string; value: number }[] {
  const days: { label: string; value: number }[] = []
  const now = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    const label = `${d.getMonth() + 1}/${d.getDate()}`
    days.push({ label, value: byDay[key]?.calls || 0 })
  }
  return days
}

interface UsagePanelProps {
  fetcher: (url: string, options?: RequestInit) => Promise<Response>
}

export default function UsagePanel({ fetcher }: UsagePanelProps) {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetcher('/api/admin/usage')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load usage data')
        return res.json()
      })
      .then(d => setData(d))
      .catch(err => setError(err instanceof Error ? err.message : 'Something went wrong'))
      .finally(() => setLoading(false))
  }, [fetcher])

  if (loading) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-4">Loading usage data...</p>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <p className="text-red-600 text-center py-4">{error || 'Failed to load usage data'}</p>
      </Card>
    )
  }

  const { gemini, functions, supabase: db } = data
  const tokensPerCall = gemini.total_calls > 0 ? Math.round(gemini.total_tokens / gemini.total_calls) : 0
  const dbPct = db.limit_bytes > 0 ? ((db.total_bytes / db.limit_bytes) * 100).toFixed(1) : '0'

  // Sort event types by count descending, take top 8
  const eventTypeData = Object.entries(functions.by_type)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }))

  // Table sizes for bar chart
  const tableSizeData = db.tables
    .filter(t => t.bytes > 0)
    .slice(0, 10)
    .map(t => ({ label: t.name, value: t.bytes }))

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Usage &amp; Costs</h2>

      {/* Gemini API */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gemini API</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <StatCard label="Total Calls" value={gemini.total_calls} />
          <StatCard label="Total Tokens" value={formatNumber(gemini.total_tokens)} />
          <StatCard label="Est. Cost" value={`$${gemini.est_cost_usd.toFixed(4)}`} />
          <StatCard label="Tokens/Call" value={formatNumber(tokensPerCall)} />
        </div>
        {gemini.total_calls > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-2">Gemini calls per day (last 14 days)</p>
            <BarChart data={last14DaysData(gemini.by_day)} />
          </>
        )}
      </Card>

      {/* Function Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Function Activity (tracked events as proxy)</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <StatCard label="Last 7d" value={formatNumber(functions.events_7d)} />
          <StatCard label="Last 30d" value={formatNumber(functions.events_30d)} />
          <StatCard label="All-time" value={formatNumber(functions.events_total)} />
        </div>
        {eventTypeData.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-2">Events by type (last 30d)</p>
            <BarChart data={eventTypeData} />
          </>
        )}
      </Card>

      {/* Supabase Database */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Supabase Database</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <StatCard label="DB Size" value={formatBytes(db.total_bytes)} />
          <StatCard label="% of Limit" value={`${dbPct}%`} detail="of 500 MB Hobby limit" />
        </div>
        {tableSizeData.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-2">Table sizes</p>
            <BarChart
              data={tableSizeData.map(t => ({
                label: t.label,
                value: Math.round(t.value / 1024),
              }))}
            />
            <p className="text-xs text-gray-400 mt-1">Values in KB</p>
          </>
        )}
      </Card>
    </div>
  )
}
