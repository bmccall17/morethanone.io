'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { saveParticipantId } from '@/lib/host-token'
import { generateFunName } from '@/lib/fun-names'

interface PublicRound {
  id: string
  join_code: string
  prompt: string
  status: string
  options_count: number
  participant_count: number
  created_at: string
}

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [publicRounds, setPublicRounds] = useState<PublicRound[]>([])
  const [loadingRounds, setLoadingRounds] = useState(true)

  useEffect(() => {
    const prefillCode = searchParams.get('code')
    if (prefillCode) setCode(prefillCode.toUpperCase())
    const prefillName = searchParams.get('name')
    if (prefillName) setDisplayName(prefillName)
  }, [searchParams])

  useEffect(() => {
    fetch('/api/rounds/public')
      .then(res => res.json())
      .then(data => setPublicRounds(data.rounds || []))
      .catch(() => {})
      .finally(() => setLoadingRounds(false))
  }, [])

  async function handleJoin() {
    if (!code.trim() || !displayName.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rounds/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          displayName: displayName.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to join')
      }

      const data = await res.json()
      saveParticipantId(data.roundId, data.participantId)

      if (data.roundStatus === 'ranking') {
        router.push(`/round/${data.roundId}/rank`)
      } else {
        router.push(`/round/${data.roundId}/rank`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Join a round</h1>
          <p className="text-gray-500 mt-1">Enter a code or pick an open round</p>
        </div>

        <Card>
          <div className="space-y-4">
            <Input
              label="Join code"
              placeholder="ABC123"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest uppercase"
            />
            <div>
              <Input
                label="Your name"
                placeholder="Enter your display name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                maxLength={30}
              />
              <button
                type="button"
                onClick={() => setDisplayName(generateFunName())}
                className="mt-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Random name
              </button>
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <Button
          size="lg"
          className="w-full"
          onClick={handleJoin}
          loading={loading}
          disabled={!code.trim() || !displayName.trim()}
        >
          Join
        </Button>

        {loadingRounds ? (
          <p className="text-sm text-gray-400 text-center">Loading open rounds...</p>
        ) : publicRounds.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-gray-700">Open rounds</h2>
            <div className="space-y-2">
              {publicRounds.map(round => (
                <button
                  key={round.id}
                  type="button"
                  onClick={() => setCode(round.join_code)}
                  className={`w-full text-left rounded-xl border p-3 transition-colors hover:bg-gray-50 cursor-pointer ${
                    code === round.join_code
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{round.prompt}</p>
                    <Badge variant={round.status === 'ranking' ? 'success' : 'info'}>
                      {round.status === 'ranking' ? 'Ranking' : 'Open'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="font-mono">{round.join_code}</span>
                    <span>{round.options_count} options</span>
                    <span>{round.participant_count} joined</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    }>
      <JoinForm />
    </Suspense>
  )
}
