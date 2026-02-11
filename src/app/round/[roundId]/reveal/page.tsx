'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import WinnerCard from '@/components/WinnerCard'
import RevealViewSwitcher from '@/components/reveal/RevealViewSwitcher'
import DemoTallyView from '@/components/demo/DemoTallyView'
import SelectionGridView from '@/components/reveal/SelectionGridView'
import FullResultsTableView from '@/components/reveal/FullResultsTableView'
import { subscribeToRevealView } from '@/lib/realtime'
import { RoundData as EliminationRound } from '@/types/database'
import type { RevealViewState } from '@/types/database'
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

export default function PlayerReveal() {
  const params = useParams()
  const roundId = params.roundId as string

  const [result, setResult] = useState<ResultData | null>(null)
  const [round, setRound] = useState<{ prompt: string; options: string[] } | null>(null)
  const [ballots, setBallots] = useState<BallotData[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [viewState, setViewState] = useState<RevealViewState>({ view: 'animation', animationRound: 1 })

  const shareUrl = result?.share_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/results/${roundId}`

  const handleCopyShareUrl = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  // Subscribe to host's view changes
  useEffect(() => {
    const unsubscribe = subscribeToRevealView(roundId, {
      onRevealViewChange: (state) => setViewState(state),
    })
    return unsubscribe
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
        <p className="text-gray-500">Results not yet available</p>
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

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-5xl mx-auto space-y-6">
        {round && (
          <h1 className="text-xl font-bold text-gray-900 text-center">{round.prompt}</h1>
        )}

        <RevealViewSwitcher activeView={viewState.view === 'selection' ? 'animation' : viewState.view} onViewChange={(view) => setViewState(prev => ({ ...prev, view }))} />

        {(viewState.view === 'animation' || viewState.view === 'selection') && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Tally bars + round indicator */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <DemoTallyView result={convergeResult} roundNumber={viewState.animationRound} />
              </Card>

              {/* Round indicator (read-only for participants) */}
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500 font-mono whitespace-nowrap">
                  Round {viewState.animationRound} / {convergeResult.rounds.length}
                </span>
              </div>
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
      </div>
    </main>
  )
}
