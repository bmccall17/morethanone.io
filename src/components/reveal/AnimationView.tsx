'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import { getExplanationForRound } from '@/lib/reveal/explanations'
import { TALLY_DURATION, ELIMINATED_DURATION, TRANSFER_DURATION } from '@/components/RevealAnimation'
import type { ConvergeResult } from '@/lib/engine/types'

interface AnimationViewProps {
  result: ConvergeResult
  currentRound: number
  onRoundChange: (round: number) => void
  options: string[]
}

type AnimPhase =
  | { type: 'idle' }
  | { type: 'tallies'; roundIndex: number }
  | { type: 'eliminated'; roundIndex: number }
  | { type: 'transfers'; roundIndex: number }

export default function AnimationView({ result, currentRound, onRoundChange, options }: AnimationViewProps) {
  const { rounds, winner } = result
  const [playing, setPlaying] = useState(false)
  const [animPhase, setAnimPhase] = useState<AnimPhase>({ type: 'idle' })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const totalRounds = rounds.length

  const allOptions = useMemo(() => {
    const opts = new Set<string>(options)
    for (const round of rounds) {
      for (const key of Object.keys(round.tallies)) opts.add(key)
    }
    return [...opts]
  }, [rounds, options])

  const maxTally = useMemo(() => {
    let max = 0
    for (const round of rounds) {
      for (const count of Object.values(round.tallies)) {
        if (count > max) max = count
      }
    }
    return max || 1
  }, [rounds])

  const clampedIndex = Math.min(currentRound, totalRounds) - 1
  const currentRoundData = rounds[clampedIndex]
  const isLastRound = clampedIndex === totalRounds - 1 && !currentRoundData.eliminated

  // Eliminated options up to but not including current round
  const previouslyEliminated = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < clampedIndex; i++) {
      if (rounds[i].eliminated) set.add(rounds[i].eliminated!)
    }
    return set
  }, [rounds, clampedIndex])

  const explanation = useMemo(
    () => getExplanationForRound(result, currentRound),
    [result, currentRound]
  )

  // Animation advance logic
  const advanceAnim = useCallback(() => {
    setAnimPhase(prev => {
      if (prev.type === 'idle') return prev

      if (prev.type === 'tallies') {
        const round = rounds[prev.roundIndex]
        if (round.eliminated) {
          return { type: 'eliminated', roundIndex: prev.roundIndex }
        }
        // No elimination — last round, stop
        setPlaying(false)
        return { type: 'idle' }
      }

      if (prev.type === 'eliminated') {
        const round = rounds[prev.roundIndex]
        if (round.transfers.length > 0) {
          return { type: 'transfers', roundIndex: prev.roundIndex }
        }
        // Advance to next round
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) {
          onRoundChange(nextIndex + 1)
          return { type: 'tallies', roundIndex: nextIndex }
        }
        setPlaying(false)
        return { type: 'idle' }
      }

      if (prev.type === 'transfers') {
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) {
          onRoundChange(nextIndex + 1)
          return { type: 'tallies', roundIndex: nextIndex }
        }
        setPlaying(false)
        return { type: 'idle' }
      }

      return prev
    })
  }, [rounds, onRoundChange])

  useEffect(() => {
    if (!playing || animPhase.type === 'idle') return

    const duration =
      animPhase.type === 'tallies' ? TALLY_DURATION :
      animPhase.type === 'eliminated' ? ELIMINATED_DURATION :
      TRANSFER_DURATION

    timerRef.current = setTimeout(advanceAnim, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [playing, animPhase, advanceAnim])

  const handlePlay = () => {
    onRoundChange(1)
    setPlaying(true)
    setAnimPhase({ type: 'tallies', roundIndex: 0 })
  }

  const handleStop = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setPlaying(false)
    setAnimPhase({ type: 'idle' })
  }

  const handleRoundSelect = (round: number) => {
    if (playing) handleStop()
    onRoundChange(round)
  }

  return (
    <div className="space-y-4">
      {/* Round selector + play button */}
      <div className="flex flex-col items-center gap-3">
        <select
          value={currentRound}
          onChange={e => handleRoundSelect(Number(e.target.value))}
          className="bg-gray-800 text-gray-200 border border-gray-600 rounded-lg px-4 py-2 text-sm"
          disabled={playing}
        >
          {Array.from({ length: totalRounds }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              Round {i + 1} of {totalRounds}
            </option>
          ))}
        </select>
        <Button
          variant="primary"
          size="sm"
          onClick={playing ? handleStop : handlePlay}
        >
          {playing ? 'Stop' : 'Play Animation'}
        </Button>
      </div>

      {/* Bar chart */}
      <div className="space-y-3 bg-gray-900 rounded-xl p-4">
        {allOptions.map(option => {
          const count = currentRoundData.tallies[option]
          const isGoneAlready = previouslyEliminated.has(option)
          const isEliminatedNow = currentRoundData.eliminated === option
          const isTheWinner = isLastRound && option === winner
          const barWidth = count !== undefined ? (count / maxTally) * 100 : 0
          const pct = count !== undefined && currentRoundData.active > 0
            ? ((count / currentRoundData.active) * 100).toFixed(1)
            : '0.0'

          if (isGoneAlready && !isEliminatedNow) {
            // Show eliminated candidates with "eliminated" label
            return (
              <div key={option} className="opacity-40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">{option}</span>
                  <span className="text-xs text-gray-500 italic">eliminated</span>
                </div>
                <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gray-700" style={{ width: '0%' }} />
                </div>
              </div>
            )
          }

          return (
            <div
              key={option}
              className={`transition-opacity duration-500 ${
                isEliminatedNow ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTheWinner
                    ? 'text-indigo-300 font-bold'
                    : isEliminatedNow
                      ? 'text-red-400 line-through'
                      : 'text-gray-200'
                }`}>
                  {option}
                  {isTheWinner && <span className="ml-2 text-indigo-400 text-xs">Winner</span>}
                </span>
                <span className={`text-sm font-mono ${
                  isEliminatedNow ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {isEliminatedNow
                    ? 'eliminated'
                    : `${count ?? 0} (${pct}%)`
                  }
                </span>
              </div>
              <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTheWinner
                      ? 'bg-indigo-500'
                      : isEliminatedNow
                        ? 'bg-red-400/50'
                        : 'bg-indigo-400/80'
                  }`}
                  style={{ width: `${isEliminatedNow ? barWidth : barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Explanation panel */}
      {explanation && (
        <div className="bg-gray-900 rounded-xl p-4 space-y-2">
          <h4 className="text-sm font-bold text-gray-200">
            {isLastRound ? 'Final Result' : `Round ${currentRound} Explanation`}
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  )
}
