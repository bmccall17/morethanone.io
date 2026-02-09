'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import html2canvas from 'html2canvas'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import WinnerCard from '@/components/WinnerCard'
import EliminationTable from '@/components/EliminationTable'
import ResultSummary from '@/components/ResultSummary'
import RevealAnimation from '@/components/RevealAnimation'
import ResultCard from '@/components/ResultCard'
import { RoundData as EliminationRound } from '@/types/database'
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
}

export default function HostReveal() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const [result, setResult] = useState<ResultData | null>(null)
  const [round, setRound] = useState<{ prompt: string; options: string[]; description: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [animationComplete, setAnimationComplete] = useState(false)
  const resultCardRef = useRef<HTMLDivElement>(null)

  const handleShareResult = useCallback(async () => {
    if (!resultCardRef.current) return
    const canvas = await html2canvas(resultCardRef.current, { scale: 2 })
    const link = document.createElement('a')
    link.download = 'morethanone-result.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  useEffect(() => {
    async function fetchData() {
      const [resultRes, roundRes] = await Promise.all([
        fetch(`/api/rounds/${roundId}/result`),
        fetch(`/api/rounds/${roundId}`),
      ])

      if (resultRes.ok) setResult(await resultRes.json())
      if (roundRes.ok) setRound(await roundRes.json())
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

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        {round && (
          <h1 className="text-xl font-bold text-gray-900 text-center">{round.prompt}</h1>
        )}

        {!animationComplete ? (
          <Card>
            <RevealAnimation
              result={convergeResult}
              onComplete={() => setAnimationComplete(true)}
            />
          </Card>
        ) : (
          <>
            <WinnerCard
              winner={result.winner}
              percentage={result.summary.winning_percentage}
              totalRounds={result.summary.total_rounds}
            />

            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Round by round</h3>
              <EliminationTable rounds={result.rounds_data} />
            </Card>

            <ResultSummary text={result.summary.text} />

            {result.tie_break_info && (
              <Card>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Tie-break:</span> {result.tie_break_info}
                </p>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={() => {
                  const params = new URLSearchParams()
                  if (round) {
                    params.set('prompt', round.prompt)
                    if (round.description) params.set('description', round.description)
                    params.set('options', JSON.stringify(round.options))
                  }
                  router.push(`/host/create?${params.toString()}`)
                }}
              >
                Run it again
              </Button>
              <Button size="lg" variant="secondary" onClick={handleShareResult}>
                Share result
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Hidden ResultCard for html2canvas capture */}
      {result && round && (
        <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
          <ResultCard
            ref={resultCardRef}
            prompt={round.prompt}
            winner={result.winner}
            totalParticipants={result.total_active}
            totalRounds={result.summary.total_rounds}
            winningPercentage={result.summary.winning_percentage}
          />
        </div>
      )}
    </main>
  )
}
