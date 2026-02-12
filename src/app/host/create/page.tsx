'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import Toggle from '@/components/ui/Toggle'
import OptionEditor from '@/components/OptionEditor'
import { saveHostToken } from '@/lib/host-token'

const POLL_TEMPLATES = [
  {
    label: 'Games You Love',
    prompt: 'Games you love to play',
    options: ['Settlers of Catan', 'Wingspan', 'The Legend of Zelda: Tears of the Kingdom', 'Baldur\'s Gate 3', 'Minecraft', 'Ticket to Ride', 'Elden Ring'],
  },
  {
    label: 'Best Movie of All Time',
    prompt: 'What is the greatest movie ever made?',
    options: ['The Shawshank Redemption', 'The Godfather', 'Spirited Away', 'The Dark Knight', 'Parasite', 'Pulp Fiction', 'The Lord of the Rings: Return of the King'],
  },
  {
    label: 'Team Lunch',
    prompt: 'Where should we go for team lunch?',
    options: ['Thai', 'Pizza', 'Sushi', 'Tacos', 'Indian', 'Burgers', 'Mediterranean'],
  },
]

function CreateRoundForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const prefillPrompt = searchParams.get('prompt') || ''
  const prefillDescription = searchParams.get('description') || ''
  const prefillOptions = (() => {
    try { return JSON.parse(searchParams.get('options') || '[]') }
    catch { return [] }
  })()

  const [prompt, setPrompt] = useState(prefillPrompt)
  const [description, setDescription] = useState(prefillDescription)
  const [options, setOptions] = useState<string[]>(prefillOptions)
  const [allowTies, setAllowTies] = useState(false)
  const [anonymousResults, setAnonymousResults] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState('')
  const [maxRanks, setMaxRanks] = useState('')
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
          is_private: isPrivate,
          settings: {
            allowTies,
            anonymousResults,
            ...(timerMinutes ? { timer_minutes: Number(timerMinutes) } : {}),
            ...(maxRanks ? { max_ranks: Number(maxRanks) } : {}),
          },
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

        {!prompt && options.length === 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Start from a template</p>
            <div className="flex flex-wrap gap-2">
              {POLL_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => {
                    setPrompt(t.prompt)
                    setOptions(t.options)
                  }}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

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
              description="Hide participant names from results"
              checked={anonymousResults}
              onChange={setAnonymousResults}
            />
            <Toggle
              label="Private round"
              description="Only accessible via code or QR"
              checked={isPrivate}
              onChange={setIsPrivate}
            />
            <div>
              <label htmlFor="timer-minutes" className="block text-sm font-medium text-gray-700">
                Ranking timer (optional)
              </label>
              <p className="text-xs text-gray-500 mb-1">Set a time limit for ranking in minutes</p>
              <input
                id="timer-minutes"
                type="number"
                min={1}
                max={60}
                placeholder="No timer"
                value={timerMinutes}
                onChange={e => setTimerMinutes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label htmlFor="max-ranks" className="block text-sm font-medium text-gray-700">
                Max ranks (optional)
              </label>
              <p className="text-xs text-gray-500 mb-1">Limit how many options participants can rank (default: rank all)</p>
              <input
                id="max-ranks"
                type="number"
                min={1}
                max={options.length || undefined}
                placeholder="Rank all"
                value={maxRanks}
                onChange={e => setMaxRanks(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
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

export default function CreateRound() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    }>
      <CreateRoundForm />
    </Suspense>
  )
}
