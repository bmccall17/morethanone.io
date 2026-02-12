'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import WinnerCard from '@/components/WinnerCard'
import RevealCountdown from '@/components/RevealCountdown'
import RevealViewSwitcher from '@/components/reveal/RevealViewSwitcher'
import DemoTallyView from '@/components/demo/DemoTallyView'
import SelectionGridView from '@/components/reveal/SelectionGridView'
import FullResultsTableView from '@/components/reveal/FullResultsTableView'
import { saveHostToken } from '@/lib/host-token'
import { RoundData as EliminationRound } from '@/types/database'
import type { RevealViewType, RevealViewState } from '@/types/database'
import type { ConvergeResult } from '@/lib/engine/types'

interface ResultData {
  winner: string
  majority_threshold: number
  total_active: number
  rounds_data: EliminationRound[]
  summary: {
    text: string
    total_rounds: number
    winner: string
    runner_up: string | null
    winning_percentage: number
  }
  tie_break_info: string | null
  share_url?: string
}

interface BallotData {
  displayName: string
  ranking: string[]
}

export default function HostReveal() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const [result, setResult] = useState<ResultData | null>(null)
  const [round, setRound] = useState<{ prompt: string; options: string[]; description: string | null } | null>(null)
  const [ballots, setBallots] = useState<BallotData[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [countdownComplete, setCountdownComplete] = useState(false)
  const [viewState, setViewState] = useState<RevealViewState>({ view: 'animation', animationRound: 1 })
  const [replayLoading, setReplayLoading] = useState(false)

  const shareUrl = result?.share_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${roundId}`

  const handleCopyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hostToken = typeof window !== 'undefined' ? localStorage.getItem(`host_token_${roundId}`) : null

  const broadcastViewState = useCallback(async (newState: RevealViewState) => {
    if (!hostToken) return
    await fetch(`/api/rounds/${roundId}/reveal-view`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Host-Token': hostToken,
      },
      body: JSON.stringify(newState),
    })
  }, [roundId, hostToken])

  const handleViewChange = (view: RevealViewType) => {
    const newState = { ...viewState, view }
    setViewState(newState)
    broadcastViewState(newState)
  }

  const handleAnimationRoundChange = (animationRound: number) => {
    const newState = { ...viewState, animationRound }
    setViewState(newState)
    broadcastViewState(newState)
  }

  useEffect(() => {
    async function fetchData() {
      const [resultRes, roundRes, ballotsRes] = await Promise.all([
        fetch(`/api/rounds/${roundId}/result`),
        fetch(`/api/rounds/${roundId}`),
        fetch(`/api/rounds/${roundId}/ballots`),
      ])

      if (resultRes.ok) setResult(await resultRes.json())
      if (roundRes.ok) {
        const roundData = await roundRes.json()
        setRound(roundData)
        if (roundData.reveal_view_state) {
          setViewState(roundData.reveal_view_state)
        }
      }
      if (ballotsRes.ok) setBallots(await ballotsRes.json())
      setLoading(false)
    }
    fetchData()
  }, [roundId])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading results...</p>
      </main>
    )
  }

  if (!result) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Results not found</p>
      </main>
    )
  }

  const convergeResult: ConvergeResult = {
    winner: result.winner,
    rounds: result.rounds_data,
    majority_threshold: result.majority_threshold,
    total_active: result.total_active,
    tie_breaks: [],
    summary: result.summary,
  }

  const options = round?.options || []

  if (!countdownComplete) {
    return <RevealCountdown onComplete={() => setCountdownComplete(true)} />
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        {round && (
          <h1 className="text-xl font-bold text-gray-900 text-center">{round.prompt}</h1>
        )}

        <RevealViewSwitcher activeView={viewState.view === 'selection' ? 'animation' : viewState.view} onViewChange={handleViewChange} />

        {(viewState.view === 'animation' || viewState.view === 'selection') && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Tally bars + round controls */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <DemoTallyView result={convergeResult} roundNumber={viewState.animationRound} options={options} />
              </Card>

              {/* Step controls (hidden for single-round results) */}
              {convergeResult.rounds.length > 1 && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAnimationRoundChange(Math.max(1, viewState.animationRound - 1))}
                    disabled={viewState.animationRound <= 1}
                    className="flex-1"
                  >
                    &larr; Previous
                  </Button>
                  <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                    {viewState.animationRound} / {convergeResult.rounds.length}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAnimationRoundChange(Math.min(convergeResult.rounds.length, viewState.animationRound + 1))}
                    disabled={viewState.animationRound >= convergeResult.rounds.length}
                    className="flex-1"
                  >
                    Next &rarr;
                  </Button>
                </div>
              )}
            </div>

            {/* Right: Selection grid */}
            <div className="lg:col-span-3">
              <SelectionGridView
                ballots={ballots}
                options={options}
                rounds={convergeResult.rounds}
                roundNumber={viewState.animationRound - 1}
              />
            </div>
          </div>
        )}

        {viewState.view === 'table' && (
          <FullResultsTableView
            rounds={result.rounds_data}
            winner={result.winner}
            options={options}
          />
        )}

        <WinnerCard
          winner={result.winner}
          percentage={result.summary.winning_percentage}
          totalRounds={result.summary.total_rounds}
        />

        {result.tie_break_info && (
          <Card>
            <p className="text-xs text-gray-500">
              <span className="font-medium">Tie-break:</span> {result.tie_break_info}
            </p>
          </Card>
        )}

        <Card>
          <p className="text-xs text-gray-500 mb-2">Share this result</p>
          <p className="text-sm text-gray-700 font-mono break-all mb-3">{shareUrl}</p>
          <Button size="lg" variant="secondary" className="w-full" onClick={handleCopyShareUrl}>
            {copied ? 'Copied!' : 'Share Results'}
          </Button>
        </Card>

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1"
            loading={replayLoading}
            onClick={async () => {
              if (!hostToken) return
              setReplayLoading(true)
              try {
                const res = await fetch('/api/rounds/replay', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Host-Token': hostToken,
                  },
                  body: JSON.stringify({ roundId }),
                })
                if (res.ok) {
                  const data = await res.json()
                  saveHostToken(data.id, data.host_token)
                  router.push(`/host/${data.id}/lobby`)
                }
              } finally {
                setReplayLoading(false)
              }
            }}
          >
            Run it again
          </Button>
        </div>
      </div>
    </main>
  )
}
