'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

interface KeepaliveEntry {
  id: string
  pinged_at: string
  status: string
}

export default function KeepaliveAdminPage() {
  const { fetcher } = useAdminAuth()
  const [entries, setEntries] = useState<KeepaliveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [pinging, setPinging] = useState(false)

  const load = useCallback(async () => {
    const res = await fetcher('/api/admin/keepalive')
    if (res.ok) setEntries(await res.json())
    setLoading(false)
  }, [fetcher])

  useEffect(() => { load() }, [load])

  async function pingNow() {
    setPinging(true)
    const token = sessionStorage.getItem('metrics_secret') || ''
    await fetch('/api/keepalive', {
      headers: { Authorization: `Bearer ${token}` },
    })
    await load()
    setPinging(false)
  }

  const lastPing = entries.length > 0 ? entries[0] : null
  const timeSincePing = lastPing
    ? Math.round((Date.now() - new Date(lastPing.pinged_at).getTime()) / (1000 * 60 * 60))
    : null

  if (loading) {
    return <main className="px-4 py-8"><p className="text-gray-500 text-center">Loading...</p></main>
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Keepalive</h1>
          <Button onClick={pingNow} loading={pinging}>
            Ping Now
          </Button>
        </div>

        <Card>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Status</h2>
            {lastPing ? (
              <div className="space-y-1">
                <p className="text-sm text-gray-700">
                  Last ping: <span className="font-medium">{new Date(lastPing.pinged_at).toLocaleString()}</span>
                </p>
                <p className="text-sm text-gray-500">
                  {timeSincePing !== null && timeSincePing < 24
                    ? `${timeSincePing} hours ago`
                    : timeSincePing !== null
                      ? `${Math.round(timeSincePing / 24)} days ago`
                      : ''}
                </p>
                <Badge variant={timeSincePing !== null && timeSincePing < 96 ? 'success' : 'warning'}>
                  {timeSincePing !== null && timeSincePing < 96 ? 'Healthy' : 'Stale — ping soon'}
                </Badge>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No pings recorded yet. Hit &quot;Ping Now&quot; or wait for cron.</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Cron schedule: Monday + Thursday at 9:00 UTC
            </p>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Ping History</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-400">No entries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-2 font-medium text-gray-500">Time</th>
                    <th className="pb-2 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100">
                      <td className="py-2 text-gray-700">{new Date(entry.pinged_at).toLocaleString()}</td>
                      <td className="py-2">
                        <Badge variant={entry.status === 'ok' ? 'success' : 'error'}>{entry.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}
