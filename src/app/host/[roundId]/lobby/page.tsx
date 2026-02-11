'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Toggle from '@/components/ui/Toggle'
import JoinCodeDisplay from '@/components/JoinCodeDisplay'
import PlayerList from '@/components/PlayerList'
import DraggableRankList from '@/components/DraggableRankList'
import SubmissionCounter from '@/components/SubmissionCounter'
import { getHostToken, getHostHeaders, saveParticipantId, getParticipantId } from '@/lib/host-token'
import { subscribeToRound, subscribeToParticipants, subscribeToRankings } from '@/lib/realtime'

interface RoundData {
  id: string
  join_code: string
  prompt: string
  description: string | null
  options: string[]
  settings: { allowTies: boolean; anonymousResults: boolean; host_as_participant: boolean; show_processing: boolean; bot_count: number }
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
  const [submitLoading, setSubmitLoading] = useState(false)
  const [hostRankingSubmitted, setHostRankingSubmitted] = useState(false)
  const [removingOption, setRemovingOption] = useState<string | null>(null)
  const [error, setError] = useState('')

  const hostToken = typeof window !== 'undefined' ? getHostToken(roundId) : null

  useEffect(() => {
    async function init() {
      const [roundRes, playersRes] = await Promise.allSettled([
        fetch(`/api/rounds/${roundId}`),
        fetch(`/api/rounds/${roundId}/participants`),
      ])
      if (roundRes.status === 'fulfilled' && roundRes.value.ok) {
        const data = await roundRes.value.json()
        setRound(data)
        if (data.status === 'revealed') {
          router.push(`/host/${roundId}/reveal`)
        } else if (data.status === 'processing') {
          router.push(`/host/${roundId}/processing`)
        }
      }
      if (playersRes.status === 'fulfilled' && playersRes.value.ok) {
        setPlayers(await playersRes.value.json())
      }
      setLoading(false)
    }
    init()
  }, [roundId, router])

  // Realtime subscription for participants
  useEffect(() => {
    return subscribeToParticipants(roundId, {
      onPlayerJoined: (participant) => {
        setPlayers((prev) => {
          if (prev.some((p) => p.id === participant.id)) return prev
          return [...prev, { id: participant.id, display_name: participant.display_name }]
        })
      },
      onPlayerRemoved: (participant) => {
        setPlayers((prev) => prev.filter((p) => p.id !== participant.id))
      },
    })
  }, [roundId])

  // Realtime subscription for rankings: fetch initial count then increment on each submission
  useEffect(() => {
    if (round?.status !== 'ranking' && round?.status !== 'closed') return

    async function fetchInitialCount() {
      try {
        const res = await fetch(`/api/rounds/${roundId}/rankings`)
        if (res.ok) {
          const data = await res.json()
          setSubmissionCount(data.count)
        }
      } catch { /* ignore */ }
    }
    fetchInitialCount()

    return subscribeToRankings(roundId, {
      onRankingSubmitted: () => {
        setSubmissionCount((prev) => prev + 1)
      },
    })
  }, [roundId, round?.status])

  // Realtime subscription for round status changes
  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        setRound((prev) => (prev ? { ...prev, status } : prev))
        if (status === 'revealed') {
          router.push(`/host/${roundId}/reveal`)
        } else if (status === 'processing') {
          router.push(`/host/${roundId}/processing`)
        }
      },
    })
  }, [roundId, router])

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
      const data = await res.json()
      if (data.hostParticipantId) {
        saveParticipantId(roundId, data.hostParticipantId)
      }
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleStartProcessing() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/rounds/${roundId}/start-processing`, {
        method: 'POST',
        headers: getHostHeaders(roundId),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      router.push(`/host/${roundId}/processing`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleToggleParticipate(checked: boolean) {
    try {
      const res = await fetch(`/api/rounds/${roundId}/settings`, {
        method: 'PATCH',
        headers: { ...getHostHeaders(roundId), 'Content-Type': 'application/json' },
        body: JSON.stringify({ host_as_participant: checked }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setRound((prev) => prev ? { ...prev, settings: { ...prev.settings, host_as_participant: checked } } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    }
  }

  async function handleBotCountChange(count: number) {
    try {
      const res = await fetch(`/api/rounds/${roundId}/settings`, {
        method: 'PATCH',
        headers: { ...getHostHeaders(roundId), 'Content-Type': 'application/json' },
        body: JSON.stringify({ bot_count: count }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setRound((prev) => prev ? { ...prev, settings: { ...prev.settings, bot_count: count } } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    }
  }

  async function handleToggleShowProcessing(checked: boolean) {
    try {
      const res = await fetch(`/api/rounds/${roundId}/settings`, {
        method: 'PATCH',
        headers: { ...getHostHeaders(roundId), 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_processing: checked }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      setRound((prev) => prev ? { ...prev, settings: { ...prev.settings, show_processing: checked } } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
    }
  }

  async function handleHostSubmitRanking(ranking: string[]) {
    const participantId = getParticipantId(roundId)
    if (!participantId) {
      setError('No participant ID found.')
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
        throw new Error(data.error || 'Failed to submit ranking')
      }
      setHostRankingSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit ranking')
    } finally {
      setSubmitLoading(false)
    }
  }

  async function handleRemoveOption(option: string) {
    setRemovingOption(option)
    try {
      const res = await fetch(`/api/rounds/${roundId}/options/remove`, {
        method: 'POST',
        headers: { ...getHostHeaders(roundId), 'Content-Type': 'application/json' },
        body: JSON.stringify({ option }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to remove option')
        return
      }
      const data = await res.json()
      setRound((prev) => prev ? { ...prev, options: data.options } : prev)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove option')
    } finally {
      setRemovingOption(null)
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
    processing: <Badge variant="warning">Processing</Badge>,
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
            <PlayerList
              players={players}
              roundId={roundId}
              isHost={!!hostToken}
              roundStatus={round.status}
            />
          )}
        </Card>

        {round.status === 'setup' && round.options.length > 0 && (
          <Card>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Options</h3>
              <ul className="space-y-1">
                {round.options.map((option) => (
                  <li
                    key={option}
                    className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-100"
                  >
                    <span className="text-sm text-gray-900">{option}</span>
                    <button
                      onClick={() => handleRemoveOption(option)}
                      disabled={removingOption === option}
                      className="ml-2 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                      aria-label={`Remove ${option}`}
                    >
                      {removingOption === option ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        )}

        {round.status === 'ranking' && round.settings?.host_as_participant && getParticipantId(roundId) && (
          <Card>
            {hostRankingSubmitted ? (
              <p className="text-center text-green-600 font-medium py-2">Ranking submitted</p>
            ) : (
              <DraggableRankList
                options={round.options}
                onSubmit={handleHostSubmitRanking}
                loading={submitLoading}
              />
            )}
          </Card>
        )}

        {(round.status === 'ranking' || round.status === 'closed') && (
          <Card>
            <SubmissionCounter submitted={submissionCount} total={players.length} />
          </Card>
        )}

        {round.status === 'setup' && (
          <Card>
            <div className="space-y-4">
              <Toggle
                label="Participate in this round"
                description="Join as a participant and submit your own ranking"
                checked={round.settings?.host_as_participant ?? false}
                onChange={handleToggleParticipate}
                disabled={round.status !== 'setup'}
              />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Bot voters</p>
                  <p className="text-xs text-gray-500">Add bots with wacky names and random rankings</p>
                </div>
                <select
                  value={round.settings?.bot_count ?? 0}
                  onChange={(e) => handleBotCountChange(Number(e.target.value))}
                  className="rounded-md border border-gray-300 text-sm py-1 px-2 text-gray-700"
                >
                  <option value={0}>None</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {round.status === 'closed' && (
          <Card>
            <Toggle
              label="Show live processing to participants"
              description="Let participants see results as they are calculated"
              checked={round.settings?.show_processing ?? false}
              onChange={handleToggleShowProcessing}
            />
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
              disabled={players.length === 0 && !round.settings?.bot_count && !round.settings?.host_as_participant}
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
          {round.status === 'closed' && round.settings?.show_processing && (
            <Button
              size="lg"
              className="w-full"
              onClick={handleStartProcessing}
              loading={actionLoading}
              disabled={submissionCount === 0}
            >
              Start live processing
            </Button>
          )}
          {round.status === 'closed' && !round.settings?.show_processing && (
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
