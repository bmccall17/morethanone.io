'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import DraggableRankList from '@/components/DraggableRankList'
import { getParticipantId } from '@/lib/host-token'
import { subscribeToRound } from '@/lib/realtime'

export default function RankPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const [round, setRound] = useState<{ prompt: string; options: string[]; status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState('')

  const participantId = typeof window !== 'undefined' ? getParticipantId(roundId) : null

  useEffect(() => {
    async function fetchRound() {
      try {
        const res = await fetch(`/api/rounds/${roundId}`)
        if (res.ok) {
          const data = await res.json()
          setRound(data)
          if (data.status === 'revealed') {
            router.push(`/round/${roundId}/reveal`)
          }
        }
      } catch { /* ignore */ }
      setLoading(false)
    }
    fetchRound()
  }, [roundId, router])

  // Realtime subscription for round status changes
  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        setRound((prev) => (prev ? { ...prev, status } : prev))
        if (status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      },
    })
  }, [roundId, router])

  async function handleSubmit(ranking: string[]) {
    if (!participantId) {
      setError('No participant ID found. Try joining again.')
      return
    }

    setSubmitLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/rounds/${roundId}/rankings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, ranking }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }

      router.push(`/round/${roundId}/waiting`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (!round) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Round not found</p>
      </main>
    )
  }

  if (round.status === 'setup') {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <Card className="text-center max-w-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{round.prompt}</h2>
          <p className="text-gray-500">Waiting for the host to start ranking...</p>
        </Card>
      </main>
    )
  }

  if (!participantId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center max-w-sm">
          <p className="text-gray-700">Session not found. Please join the round again.</p>
          <a href="/join" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
            Go to join page
          </a>
        </Card>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{round.prompt}</h1>
          <p className="text-sm text-gray-500 mt-1">Your next choices matter. Rank sincerely.</p>
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <DraggableRankList
          options={round.options}
          onSubmit={handleSubmit}
          loading={submitLoading}
        />
      </div>
    </main>
  )
}
