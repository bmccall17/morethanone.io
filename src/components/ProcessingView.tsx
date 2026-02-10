'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import RevealAnimation from '@/components/RevealAnimation'
import SelectionGridView from '@/components/reveal/SelectionGridView'
import { subscribeToProcessing, subscribeToRound } from '@/lib/realtime'
import { getHostHeaders } from '@/lib/host-token'
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

interface Ballot {
  displayName: string
  ranking: string[]
}

interface ProcessingViewProps {
  roundId: string
  redirectOnReveal: string
  triggerProcess?: boolean
}

export default function ProcessingView({ roundId, redirectOnReveal, triggerProcess }: ProcessingViewProps) {
  const router = useRouter()
  const [rounds, setRounds] = useState<RoundData[]>([])
  const [result, setResult] = useState<ResultData | null>(null)
  const [ballots, setBallots] = useState<Ballot[]>([])
  const [options, setOptions] = useState<string[]>([])
  const processTriggered = useRef(false)

  // Fetch result data
  async function fetchResult() {
    const res = await fetch(`/api/rounds/${roundId}/result`)
    if (res.ok) {
      const data: ResultData = await res.json()
      setResult(data)
      setRounds(data.processing_data ?? [])
    }
  }

  // Fetch ballots
  async function fetchBallots() {
    const res = await fetch(`/api/rounds/${roundId}/ballots`)
    if (res.ok) {
      const data: Ballot[] = await res.json()
      setBallots(data)
    }
  }

  // Fetch round options
  async function fetchOptions() {
    const res = await fetch(`/api/rounds/${roundId}`)
    if (res.ok) {
      const data = await res.json()
      setOptions(data.options ?? [])
      // If already revealed, redirect
      if (data.status === 'revealed') {
        setTimeout(() => router.push(redirectOnReveal), 2000)
      }
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchResult()
    fetchBallots()
    fetchOptions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId])

  // Trigger processing (host only)
  useEffect(() => {
    if (!triggerProcess || processTriggered.current) return
    processTriggered.current = true

    fetch(`/api/rounds/${roundId}/process`, {
      method: 'POST',
      headers: getHostHeaders(roundId),
    })
    // The process route will step through rounds via realtime updates
  }, [roundId, triggerProcess])

  // Subscribe to processing round updates
  useEffect(() => {
    return subscribeToProcessing(roundId, {
      onProcessingUpdate: () => {
        fetchResult()
        fetchBallots()
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId])

  // Subscribe to round status changes (for reveal transition)
  useEffect(() => {
    return subscribeToRound(roundId, {
      onStatusChange: (status) => {
        if (status === 'revealed') {
          // Brief delay to let animation finish
          fetchResult()
          setTimeout(() => router.push(redirectOnReveal), 2000)
        }
      },
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundId, redirectOnReveal, router])

  // Build ConvergeResult for RevealAnimation
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Processing votes</h2>
          <p className="text-sm text-gray-500 mt-1">
            Running ranked-choice rounds...
          </p>
        </div>

        {convergeResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <RevealAnimation result={convergeResult} />
            </Card>
            {ballots.length > 0 && options.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-gray-500 mb-3">How They Voted</h3>
                <SelectionGridView ballots={ballots} options={options} />
              </Card>
            )}
          </div>
        ) : (
          <Card padding="lg">
            <div className="space-y-3 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-gray-500">
                Waiting for processing to begin...
              </p>
            </div>
          </Card>
        )}
      </div>
    </main>
  )
}
