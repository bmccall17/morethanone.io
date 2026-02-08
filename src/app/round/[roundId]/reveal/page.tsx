'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Card from '@/components/ui/Card'
import WinnerCard from '@/components/WinnerCard'
import EliminationTable from '@/components/EliminationTable'
import ResultSummary from '@/components/ResultSummary'
import { RoundData as EliminationRound } from '@/types/database'

interface ResultData {
  winner: string
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

export default function PlayerReveal() {
  const params = useParams()
  const roundId = params.roundId as string

  const [result, setResult] = useState<ResultData | null>(null)
  const [round, setRound] = useState<{ prompt: string } | null>(null)
  const [loading, setLoading] = useState(true)

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
        <p className="text-gray-500">Results not yet available</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        {round && (
          <h1 className="text-xl font-bold text-gray-900 text-center">{round.prompt}</h1>
        )}

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
      </div>
    </main>
  )
}
