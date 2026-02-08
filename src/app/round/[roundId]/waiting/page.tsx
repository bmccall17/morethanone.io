'use client'

import { useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'

export default function WaitingPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      }
    } catch { /* ignore */ }
  }, [roundId, router])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 3000)
    return () => clearInterval(interval)
  }, [checkStatus])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-sm w-full text-center space-y-4">
        <Card padding="lg">
          <div className="space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">You&apos;re locked in!</h2>
            <p className="text-sm text-gray-500">
              Waiting for the host to reveal the result...
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
