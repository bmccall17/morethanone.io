'use client'

import { useMemo } from 'react'
import type { ConvergeResult } from '@/lib/engine/types'

interface DemoTallyViewProps {
  result: ConvergeResult
  /** 1-indexed current round number */
  roundNumber: number
}

/**
 * A controlled tally view for the demo page — same visual language as
 * RevealAnimation but stepped manually by the parent.
 */
export default function DemoTallyView({ result, roundNumber }: DemoTallyViewProps) {
  const { rounds, winner } = result

  const allOptions = useMemo(() => {
    const opts = new Set<string>()
    for (const round of rounds) {
      for (const key of Object.keys(round.tallies)) opts.add(key)
    }
    return [...opts]
  }, [rounds])

  const maxTally = useMemo(() => {
    let max = 0
    for (const round of rounds) {
      for (const count of Object.values(round.tallies)) {
        if (count > max) max = count
      }
    }
    return max || 1
  }, [rounds])

  const clampedIndex = Math.min(roundNumber, rounds.length) - 1
  const currentRound = rounds[clampedIndex]
  const isLastRound = clampedIndex === rounds.length - 1 && !currentRound.eliminated

  // Collect all eliminated options up to but not including current round
  const previouslyEliminated = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < clampedIndex; i++) {
      if (rounds[i].eliminated) set.add(rounds[i].eliminated!)
    }
    return set
  }, [rounds, clampedIndex])

  const eliminatedThisRound = currentRound.eliminated

  return (
    <div className="space-y-4">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">
          {isLastRound ? 'Final Result' : `Round ${currentRound.round_number}`}
        </h3>
        <span className="text-xs text-gray-400">
          Threshold: {currentRound.threshold} of {currentRound.active}
        </span>
      </div>

      {/* Bar chart */}
      <div className="space-y-2.5">
        {allOptions.map(option => {
          const count = currentRound.tallies[option]
          const isGoneAlready = previouslyEliminated.has(option)
          const isEliminatedNow = eliminatedThisRound === option
          const isTheWinner = isLastRound && option === winner
          const barWidth = count !== undefined ? (count / maxTally) * 100 : 0

          if (isGoneAlready) return null

          return (
            <div
              key={option}
              className={`transition-opacity duration-500 ${
                isEliminatedNow ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-sm font-medium ${
                  isTheWinner
                    ? 'text-indigo-700 font-bold'
                    : isEliminatedNow
                      ? 'text-red-500 line-through'
                      : 'text-gray-700'
                }`}>
                  {option}
                  {isTheWinner && <span className="ml-2 text-indigo-500 text-xs">Winner</span>}
                </span>
                <span className={`text-sm font-mono ${
                  isEliminatedNow ? 'text-red-400' : 'text-gray-500'
                }`}>
                  {count ?? 0}
                </span>
              </div>
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTheWinner
                      ? 'bg-indigo-500'
                      : isEliminatedNow
                        ? 'bg-red-300'
                        : 'bg-indigo-400'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Transfer indicators */}
      {currentRound.transfers.length > 0 && (
        <div className="space-y-0.5 text-xs text-gray-500">
          {currentRound.transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-red-400">{t.from}</span>
              <span>&rarr;</span>
              <span className={t.to ? 'text-indigo-500' : 'text-gray-400'}>
                {t.to ?? 'exhausted'}
              </span>
              <span className="text-gray-400">({t.count})</span>
            </div>
          ))}
        </div>
      )}

      {/* Winner announcement */}
      {isLastRound && (
        <div className="text-center pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 mb-0.5">The group has chosen</p>
          <p className="text-xl font-bold text-gray-900">{winner}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {result.summary.winning_percentage}% support in {result.summary.total_rounds} round{result.summary.total_rounds !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
