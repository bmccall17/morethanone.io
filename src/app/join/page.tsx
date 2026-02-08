'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { saveParticipantId } from '@/lib/host-token'

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [code, setCode] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const prefillCode = searchParams.get('code')
    if (prefillCode) setCode(prefillCode.toUpperCase())
  }, [searchParams])

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
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Join a round</h1>
          <p className="text-gray-500 mt-1">Enter the code from your host.</p>
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
            <Input
              label="Your name"
              placeholder="Enter your display name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={30}
            />
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
