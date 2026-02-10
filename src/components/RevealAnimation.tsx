'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import type { ConvergeResult } from '@/lib/engine/types'

type Phase =
  | { type: 'tallies'; roundIndex: number }
  | { type: 'eliminated'; roundIndex: number }
  | { type: 'transfers'; roundIndex: number }
  | { type: 'winner' }

const TALLY_DURATION = 1200
const ELIMINATED_DURATION = 1000
const TRANSFER_DURATION = 1200

interface RevealAnimationProps {
  result: ConvergeResult
  onComplete?: () => void
  showStepButton?: boolean
  onRoundChange?: (roundNumber: number) => void
}

export default function RevealAnimation({ result, onComplete, showStepButton, onRoundChange }: RevealAnimationProps) {
  const [phase, setPhase] = useState<Phase>({ type: 'tallies', roundIndex: 0 })
  const [skipped, setSkipped] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { rounds, winner } = result

  const allOptions = useMemo(() => {
    const opts = new Set<string>()
    for (const round of rounds) {
      for (const key of Object.keys(round.tallies)) {
        opts.add(key)
      }
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

  const advance = useCallback(() => {
    setPhase(prev => {
      if (prev.type === 'winner') return prev

      if (prev.type === 'tallies') {
        const round = rounds[prev.roundIndex]
        if (round.eliminated) {
          return { type: 'eliminated', roundIndex: prev.roundIndex }
        }
        // No elimination = last round, show winner
        return { type: 'winner' }
      }

      if (prev.type === 'eliminated') {
        const round = rounds[prev.roundIndex]
        if (round.transfers.length > 0) {
          return { type: 'transfers', roundIndex: prev.roundIndex }
        }
        // No transfers, advance to next round or winner
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) {
          return { type: 'tallies', roundIndex: nextIndex }
        }
        return { type: 'winner' }
      }

      if (prev.type === 'transfers') {
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) {
          return { type: 'tallies', roundIndex: nextIndex }
        }
        return { type: 'winner' }
      }

      return prev
    })
  }, [rounds])

  // In manual mode, fire onComplete when we reach winner
  useEffect(() => {
    if (manualMode && phase.type === 'winner') {
      onComplete?.()
    }
  }, [manualMode, phase, onComplete])

  useEffect(() => {
    if (skipped || manualMode) return
    if (phase.type === 'winner') {
      onComplete?.()
      return
    }

    const duration =
      phase.type === 'tallies' ? TALLY_DURATION :
      phase.type === 'eliminated' ? ELIMINATED_DURATION :
      TRANSFER_DURATION

    timerRef.current = setTimeout(advance, duration)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [phase, skipped, manualMode, advance, onComplete])

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setSkipped(true)
    setPhase({ type: 'winner' })
    onComplete?.()
  }

  const handleStep = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setManualMode(true)
    setPhase(prev => {
      if (prev.type === 'winner') return prev
      // Compute next phase inline (same logic as advance)
      if (prev.type === 'tallies') {
        const round = rounds[prev.roundIndex]
        if (round.eliminated) return { type: 'eliminated', roundIndex: prev.roundIndex }
        return { type: 'winner' }
      }
      if (prev.type === 'eliminated') {
        const round = rounds[prev.roundIndex]
        if (round.transfers.length > 0) return { type: 'transfers', roundIndex: prev.roundIndex }
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) return { type: 'tallies', roundIndex: nextIndex }
        return { type: 'winner' }
      }
      if (prev.type === 'transfers') {
        const nextIndex = prev.roundIndex + 1
        if (nextIndex < rounds.length) return { type: 'tallies', roundIndex: nextIndex }
        return { type: 'winner' }
      }
      return prev
    })
  }

  const isWinner = skipped || phase.type === 'winner'
  const currentRoundIndex = isWinner
    ? rounds.length - 1
    : (phase as Exclude<Phase, { type: 'winner' }>).roundIndex
  const currentRound = rounds[currentRoundIndex]
  const tallies = currentRound.tallies

  // Report round changes for synced panels (How They Voted)
  // roundNumber drives the eliminatedSet in SelectionGridView:
  //   eliminatedSet includes rounds[0..roundNumber-1].eliminated
  const displayRoundNumber = isWinner
    ? rounds.length
    : phase.type === 'eliminated' || phase.type === 'transfers'
      ? currentRoundIndex + 1
      : currentRoundIndex

  useEffect(() => {
    onRoundChange?.(displayRoundNumber)
  }, [displayRoundNumber, onRoundChange])

  // During transfer phase, compute the post-transfer tallies to animate toward
  const displayTallies = useMemo(() => {
    if (isWinner) {
      // Show final round tallies
      return rounds[rounds.length - 1].tallies
    }
    if (phase.type === 'transfers') {
      const round = rounds[currentRoundIndex]
      const nextRound = rounds[currentRoundIndex + 1]
      if (nextRound) return nextRound.tallies
      // No next round, just show current
      return round.tallies
    }
    return tallies
  }, [isWinner, phase, rounds, currentRoundIndex, tallies])

  // Which options are still active in the current display
  const activeOptions = useMemo(() => {
    if (isWinner) {
      return Object.keys(rounds[rounds.length - 1].tallies)
    }
    return Object.keys(displayTallies)
  }, [isWinner, rounds, displayTallies])

  // Options eliminated in prior rounds (stay visible but faded)
  const eliminatedBefore = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < currentRoundIndex; i++) {
      if (rounds[i].eliminated) set.add(rounds[i].eliminated!)
    }
    return set
  }, [rounds, currentRoundIndex])

  const eliminatedThisRound = !isWinner && (phase.type === 'eliminated' || phase.type === 'transfers')
    ? currentRound.eliminated
    : null

  const transfers = !isWinner && phase.type === 'transfers'
    ? currentRound.transfers
    : []

  return (
    <div className="space-y-6" data-testid="reveal-animation">
      {/* Round header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">
          {isWinner ? 'Final Result' : `Round ${currentRound.round_number}`}
        </h3>
        {!isWinner && (
          <div className="flex gap-2">
            {showStepButton && (
              <Button variant="ghost" size="sm" onClick={handleStep} data-testid="step-button">
                Step &gt;
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleSkip} data-testid="skip-button">
              Skip
            </Button>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="space-y-3" data-testid="bar-chart">
        {allOptions.map(option => {
          const count = displayTallies[option] ?? 0
          const isGone = eliminatedBefore.has(option)
          const isElimNow = eliminatedThisRound === option
          const isTheWinner = isWinner && option === winner
          const barWidth = count > 0 ? (count / maxTally) * 100 : 0

          return (
            <div
              key={option}
              className={`transition-opacity duration-500 ${
                isGone ? 'opacity-40' : isElimNow ? 'opacity-60' : 'opacity-100'
              }`}
              data-testid={`bar-${option}`}
              data-eliminated={isElimNow || isGone || undefined}
              data-winner={isTheWinner || undefined}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isTheWinner
                    ? 'text-indigo-700 font-bold'
                    : isGone || isElimNow
                      ? 'text-gray-400'
                      : 'text-gray-700'
                }`}>
                  {isGone || isElimNow ? <s>{option}</s> : option}
                  {isTheWinner && <span className="ml-2 text-indigo-500 text-xs">Winner</span>}
                  {(isGone || isElimNow) && (
                    <span className="ml-2 text-red-400 text-xs font-normal">eliminated</span>
                  )}
                </span>
                <span className={`text-sm font-mono ${
                  isGone || isElimNow ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {count}
                </span>
              </div>
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isTheWinner
                      ? 'bg-indigo-500'
                      : isGone || isElimNow
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
      {transfers.length > 0 && (
        <div className="space-y-1 text-xs text-gray-500 animate-pulse" data-testid="transfers">
          {transfers.map((t, i) => (
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
      {isWinner && (
        <div
          className="text-center pt-4 border-t border-gray-100"
          data-testid="winner-announcement"
          style={{ animation: skipped ? 'none' : 'fadeIn 0.5s ease-out' }}
        >
          <p className="text-sm text-gray-500 mb-1">The group has chosen</p>
          <p className="text-2xl font-bold text-gray-900">{winner}</p>
          <p className="text-sm text-gray-400 mt-1">
            {result.summary.winning_percentage}% support in {result.summary.total_rounds} round{result.summary.total_rounds !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

export { TALLY_DURATION, ELIMINATED_DURATION, TRANSFER_DURATION }
export type { Phase, RevealAnimationProps }
