'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Toggle from '@/components/ui/Toggle'
import OptionEditor from '@/components/OptionEditor'
import { saveHostToken } from '@/lib/host-token'

export default function CreateRound() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [description, setDescription] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [allowTies, setAllowTies] = useState(false)
  const [anonymousResults, setAnonymousResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!prompt.trim()) {
      setError('Enter a question or prompt')
      return
    }
    if (options.length < 2) {
      setError('Add at least 2 options')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/rounds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          description: description.trim() || null,
          options,
          settings: { allowTies, anonymousResults },
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create round')
      }

      const data = await res.json()
      saveHostToken(data.id, data.host_token)
      router.push(`/host/${data.id}/lobby`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create a round</h1>
          <p className="text-gray-500 mt-1">Set up a question and options for your group.</p>
        </div>

        <Card>
          <div className="space-y-4">
            <Input
              label="Question or prompt"
              placeholder="What should we have for dinner?"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
            />

            <Input
              label="Description (optional)"
              placeholder="Any extra context..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <OptionEditor options={options} onChange={setOptions} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">Settings</h3>
            <Toggle
              label="Allow ties"
              description="Participants can rank options equally"
              checked={allowTies}
              onChange={setAllowTies}
            />
            <Toggle
              label="Anonymous results"
              description="Don't show who voted for what"
              checked={anonymousResults}
              onChange={setAnonymousResults}
            />
          </div>
        </Card>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={handleCreate}
          loading={loading}
          disabled={!prompt.trim() || options.length < 2}
        >
          Create round
        </Button>
      </div>
    </main>
  )
}
