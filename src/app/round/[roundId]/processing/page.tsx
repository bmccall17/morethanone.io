'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import RevealAnimation from '@/components/RevealAnimation'
import { subscribeToProcessing, subscribeToRound } from '@/lib/realtime'
import type { RoundData } from '@/types/database'
import type { ConvergeResult } from '@/lib/engine/types'

interface ResultData {
  winner: string
  majority_threshold: number
  total_active: number
  rounds_data: RoundData[]
  processing_data: RoundData[]
  summary: {
    text: string
    total_rounds: number
    winner: string
    runner_up: string | null
    winning_percentage: number
  }
}

export default function ProcessingPage() {
  const params = useParams()
  const router = useRouter()
  const roundId = params.roundId as string

  const [processingRound, setProcessingRound] = useState(0)
  const [rounds, setRounds] = useState<RoundData[]>([])
  const [result, setResult] = useState<ResultData | null>(null)

  // Subscribe to processing round updates and do initial fetch
  useEffect(() => {
    let cancelled = false

    async function fetchResult() {
      const res = await fetch(`/api/rounds/${roundId}/result`)
      if (res.ok && !cancelled) {
        const data: ResultData = await res.json()
        setResult(data)
        setRounds(data.processing_data ?? [])
      }
    }

    // Catch up with any processing that already happened
    fetchResult()

    const unsubscribe = subscribeToProcessing(roundId, {
      onProcessingUpdate: (roundNumber: number) => {
        setProcessingRound(roundNumber)
        fetchResult()
      },
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [roundId])

  // Subscribe to round status changes for reveal transition
  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        if (status === 'revealed') {
          router.push(`/round/${roundId}/reveal`)
        }
      },
    })
  }, [roundId, router])

  // Build a partial ConvergeResult for RevealAnimation from available rounds
  const convergeResult: ConvergeResult | null =
    result && rounds.length > 0
      ? {
          winner: result.winner,
          rounds,
          majority_threshold: result.majority_threshold,
          total_active: result.total_active,
          tie_breaks: [],
          summary: result.summary,
        }
      : null

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Processing votes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Running ranked-choice rounds...
          </p>
        </div>

        {convergeResult ? (
          <Card>
            <RevealAnimation result={convergeResult} />
          </Card>
        ) : (
          <Card padding="lg">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-500">
                {processingRound > 0
                  ? `Round ${processingRound} processed, loading data...`
                  : 'Waiting for processing to begin...'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
