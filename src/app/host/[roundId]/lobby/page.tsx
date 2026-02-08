'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import JoinCodeDisplay from '@/components/JoinCodeDisplay'
import PlayerList from '@/components/PlayerList'
import SubmissionCounter from '@/components/SubmissionCounter'
import { getHostToken, getHostHeaders } from '@/lib/host-token'
import { subscribeToParticipants } from '@/lib/realtime'

interface RoundData {
  id: string
  join_code: string
  prompt: string
  description: string | null
  options: string[]
  settings: { allowTies: boolean; anonymousResults: boolean }
  status: string
}

interface Player {
  id: string
  display_name: string
}

export default function HostLobby() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const [round, setRound] = useState<RoundData | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [submissionCount, setSubmissionCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const hostToken = typeof window !== 'undefined' ? getHostToken(roundId) : null

  const fetchRound = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}`)
      if (res.ok) {
        const data = await res.json()
        setRound(data)
        if (data.status === 'revealed') {
          router.push(`/host/${roundId}/reveal`)
        }
      }
    } catch { /* ignore polling errors */ }
  }, [roundId, router])

  const fetchPlayers = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}/participants`)
      if (res.ok) {
        setPlayers(await res.json())
      }
    } catch { /* ignore */ }
  }, [roundId])

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch(`/api/rounds/${roundId}/rankings`)
      if (res.ok) {
        const data = await res.json()
        setSubmissionCount(data.count)
      }
    } catch { /* ignore */ }
  }, [roundId])

  useEffect(() => {
    async function init() {
      await Promise.all([fetchRound(), fetchPlayers()])
      setLoading(false)
    }
    init()
  }, [fetchRound, fetchPlayers])

  // Realtime subscription for participants
  useEffect(() => {
    return subscribeToParticipants(roundId, {
      onPlayerJoined: (participant) => {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === participant.id)) return prev
          return [...prev, { id: participant.id, display_name: participant.display_name }]
        })
      },
    })
  }, [roundId])

  // Poll round status and submissions
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRound()
      if (round?.status === 'ranking' || round?.status === 'closed') {
        fetchSubmissions()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [fetchRound, fetchSubmissions, round?.status])

  async function handleStart() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/start`, {
        method: 'POST',
        headers: getHostHeaders(roundId),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await fetchRound()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleClose() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/close`, {
        method: 'POST',
        headers: getHostHeaders(roundId),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      await fetchRound()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReveal() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/reveal`, {
        method: 'POST',
        headers: getHostHeaders(roundId),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      router.push(`/host/${roundId}/reveal`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActionLoading(false)
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

  if (!hostToken) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <Card className="text-center max-w-sm">
          <p className="text-gray-700">You don&apos;t have host access to this round.</p>
        </Card>
      </main>
    )
  }

  const statusBadge = {
    setup: <Badge variant="info">Setup</Badge>,
    ranking: <Badge variant="warning">Ranking</Badge>,
    closed: <Badge variant="default">Closed</Badge>,
    revealed: <Badge variant="success">Revealed</Badge>,
  }[round.status] || <Badge>{round.status}</Badge>

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{round.prompt}</h1>
            {round.description && (
              <p className="text-gray-500 mt-1">{round.description}</p>
            )}
          </div>
          {statusBadge}
        </div>

        {(round.status === 'setup' || round.status === 'ranking') && (
          <JoinCodeDisplay code={round.join_code} roundId={roundId} />
        )}

        <Card>
          {round.settings?.anonymousResults ? (
            <div className="text-center py-4">
              <p className="text-2xl font-bold text-gray-900">{players.length}</p>
              <p className="text-sm text-gray-500">participant{players.length !== 1 ? 's' : ''} joined</p>
            </div>
          ) : (
            <PlayerList players={players} />
          )}
        </Card>

        {(round.status === 'ranking' || round.status === 'closed') && (
          <Card>
            <SubmissionCounter submitted={submissionCount} total={players.length} />
          </Card>
        )}

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="space-y-2">
          {round.status === 'setup' && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleStart}
              loading={actionLoading}
              disabled={players.length === 0}
            >
              Start ranking
            </Button>
          )}
          {round.status === 'ranking' && (
            <Button
              size="lg"
              className="w-full"
              variant="secondary"
              onClick={handleClose}
              loading={actionLoading}
            >
              Close ranking
            </Button>
          )}
          {round.status === 'closed' && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleReveal}
              loading={actionLoading}
              disabled={submissionCount === 0}
            >
              Reveal result
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}
