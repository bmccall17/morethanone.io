'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import { subscribeToRound } from '@/lib/realtime'
import type { RoundSettings } from '@/types/database'

export default function WaitingPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string
  const [showProcessing, setShowProcessing] = useState(false)
  const showProcessingRef = useRef(false)

  // Keep ref in sync so the realtime callback always sees latest value
  useEffect(() => {
    showProcessingRef.current = showProcessing
  }, [showProcessing])

  useEffect(() => {
    async function fetchSettings() {
      const res = await fetch(`/api/rounds/${roundId}`)
      if (res.ok) {
        const data = await res.json()
        const settings = data.settings as RoundSettings
        const sp = settings?.show_processing ?? false
        showProcessingRef.current = sp
        setShowProcessing(sp)

        // Handle case where status already transitioned before page loaded
        if (data.status === 'processing' && sp) {
          router.push(`/round/${roundId}/processing`)
        } else if (data.status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        } else if (data.status === 'closed') {
          // Processing already finished, wait for reveal
        }
      }
    }
    fetchSettings()
  }, [roundId, router])

  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        if (status === 'processing' && showProcessingRef.current) {
          router.push(`/round/${roundId}/processing`)
        } else if (status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      },
    })
  }, [roundId, router])

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
