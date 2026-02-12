'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import ReplayNotification from '@/components/ReplayNotification'
import { subscribeToRound } from '@/lib/realtime'

export default function WaitingPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string
  const [nextRoundJoinCode, setNextRoundJoinCode] = useState<string | null>(null)
  const [participantName, setParticipantName] = useState<string | undefined>(undefined)

  // Check current status on mount (for late arrivals)
  useEffect(() => {
    async function checkStatus() {
      const res = await fetch(`/api/rounds/${roundId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.status === 'processing') {
          router.push(`/round/${roundId}/processing`)
        } else if (data.status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      }
    }
    checkStatus()
  }, [roundId, router])

  // Get participant display name
  useEffect(() => {
    const participantId = localStorage.getItem(`morethanone:participant:${roundId}`)
    if (participantId) {
      fetch(`/api/rounds/${roundId}/participants`)
        .then(r => r.ok ? r.json() : [])
        .then(participants => {
          const me = participants.find?.((p: { id: string }) => p.id === participantId)
          if (me) setParticipantName(me.display_name)
        })
        .catch(() => {})
    }
  }, [roundId])

  // Subscribe to status changes + replay
  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        if (status === 'processing') {
          router.push(`/round/${roundId}/processing`)
        } else if (status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      },
      onNextRound: async (nextRoundId) => {
        try {
          const res = await fetch(`/api/rounds/${nextRoundId}`)
          if (res.ok) {
            const data = await res.json()
            setNextRoundJoinCode(data.join_code)
          }
        } catch { /* ignore */ }
      },
    })
  }, [roundId, router])

  // Polling fallback — safety net in case realtime misses a status change
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/rounds/${roundId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === 'processing') {
            router.push(`/round/${roundId}/processing`)
          } else if (data.status === 'revealed') {
            router.push(`/round/${roundId}/reveal`)
          }
        }
      } catch { /* ignore polling errors */ }
    }, 3000)
    return () => clearInterval(interval)
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

        {nextRoundJoinCode && (
          <ReplayNotification joinCode={nextRoundJoinCode} displayName={participantName} />
        )}
      </div>
    </main>
  )
}
