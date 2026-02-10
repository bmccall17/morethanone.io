'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Button from '@/components/ui/Button'
import type { ConvergeResult, ConvergeRound } from '@/lib/engine/types'

type Phase =
  | { type: 'tallies'; roundIndex: number }
  | { type: 'eliminated'; roundIndex: number }
  | { type: 'transfers'; roundIndex: number }
  | { type: 'winner' }

const TALLY_DURATION = 1200
const ELIMINATED_DURATION = 1000
const TRANSFER_DURATION = 1200

// Hex colors for provenance segments — one per option position
const OPTION_HEX = [
  '#818cf8', // indigo-400
  '#34d399', // emerald-400
  '#22d3ee', // cyan-400
  '#fbbf24', // amber-400
  '#fb7185', // rose-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#2dd4bf', // teal-400
  '#f59e0b', // amber-500
  '#6366f1', // indigo-500
  '#10b981', // emerald-500
  '#ec4899', // pink-500
]

function getColor(index: number): string {
  return OPTION_HEX[index % OPTION_HEX.length]
}

/**
 * Compute stacked provenance for each option at the given display round.
 *
 * At displayRound 1: all votes are self-sourced.
 * At displayRound N>1: transfers from rounds[0]..rounds[N-2] have been applied.
 * Eliminated options end up with total = 0.
 */
function computeProvenance(
  rounds: ConvergeRound[],
  displayRound: number,
  allOptions: string[]
): Record<string, Record<string, number>> {
  const prov: Record<string, Record<string, number>> = {}

  // Seed: round 1 tallies, all self-sourced
  for (const opt of allOptions) {
    prov[opt] = { [opt]: rounds[0]?.tallies[opt] ?? 0 }
  }

  // Apply each prior round's elimination + transfers
  for (let i = 0; i < displayRound - 1 && i < rounds.length; i++) {
    const round = rounds[i]
    if (!round.eliminated) break
    const elim = round.eliminated

    // Zero out eliminated option
    prov[elim] = { [elim]: 0 }

    // Distribute transfers to recipients
    for (const t of round.transfers) {
      if (t.to) {
        if (!prov[t.to][elim]) prov[t.to][elim] = 0
        prov[t.to][elim] += t.count
      }
    }
  }

  return prov
}

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

  // Color index lookup
  const colorIndex = useMemo(() => {
    const map: Record<string, number> = {}
    allOptions.forEach((opt, i) => { map[opt] = i })
    return map
  }, [allOptions])

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

  // Provenance display round (1-indexed, for computeProvenance):
  //   tallies at N → N+1 (transfers from 0..N-1 applied)
  //   eliminated at N → N+1 (same tallies, marking elimination)
  //   transfers at N → N+2 (this round's transfers being applied)
  //   winner → rounds.length
  const provenanceRound = isWinner
    ? rounds.length
    : phase.type === 'transfers'
      ? currentRoundIndex + 2
      : currentRoundIndex + 1

  const provenance = useMemo(
    () => computeProvenance(rounds, provenanceRound, allOptions),
    [rounds, provenanceRound, allOptions]
  )

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
    <div className="space-y-4" data-testid="reveal-animation">
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

      {/* Stacked bar chart */}
      <div className="space-y-2.5" data-testid="bar-chart">
        {allOptions.map(option => {
          const optProv = provenance[option] || {}
          const total = Object.values(optProv).reduce((s, v) => s + v, 0)
          const isGone = eliminatedBefore.has(option)
          const isElimNow = eliminatedThisRound === option
          const isTheWinner = isWinner && option === winner
          const barPct = (total / maxTally) * 100

          // Build ordered segments: self first, then transferred sources
          const segments: { source: string; count: number; hex: string }[] = []
          if (optProv[option] > 0) {
            segments.push({ source: option, count: optProv[option], hex: getColor(colorIndex[option]) })
          }
          for (const [src, cnt] of Object.entries(optProv)) {
            if (src !== option && cnt > 0) {
              segments.push({ source: src, count: cnt, hex: getColor(colorIndex[src]) })
            }
          }

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
              {/* Label row */}
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: getColor(colorIndex[option]) }}
                  />
                  <span className={`text-sm font-medium ${
                    isTheWinner
                      ? 'text-indigo-700 font-bold'
                      : isGone || isElimNow
                        ? 'text-gray-400'
                        : 'text-gray-700'
                  }`}>
                    {isGone || isElimNow ? <s>{option}</s> : option}
                    {isTheWinner && (
                      <span className="ml-2 text-indigo-500 text-xs font-normal">Winner</span>
                    )}
                    {(isGone || isElimNow) && (
                      <span className="ml-2 text-red-400 text-xs font-normal">eliminated</span>
                    )}
                  </span>
                </div>
                <span className={`text-sm font-mono ${
                  isGone || isElimNow ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {total}
                </span>
              </div>

              {/* Stacked bar */}
              <div className="h-5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full flex rounded-full overflow-hidden transition-all duration-700 ease-out"
                  style={{ width: `${barPct}%` }}
                >
                  {segments.map(seg => {
                    const segPct = total > 0 ? (seg.count / total) * 100 : 0
                    const isSelf = seg.source === option
                    return (
                      <div
                        key={seg.source}
                        className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
                        style={{
                          width: `${segPct}%`,
                          backgroundColor: seg.hex,
                          opacity: isSelf ? 1 : 0.75,
                        }}
                        title={isSelf ? `${seg.count} original` : `${seg.count} from ${seg.source}`}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Segment legend (only if bar has multiple sources) */}
              {segments.length > 1 && (
                <div className="flex flex-wrap gap-x-3 mt-0.5">
                  {segments.map(seg => (
                    <span key={seg.source} className="text-[10px] text-gray-400 flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block"
                        style={{ backgroundColor: seg.hex }}
                      />
                      {seg.count} from {seg.source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Transfer indicators */}
      {transfers.length > 0 && (
        <div className="space-y-0.5 text-xs text-gray-500" data-testid="transfers">
          {transfers.map((t, i) => (
            <div key={i} className="flex items-center gap-1">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: getColor(colorIndex[t.from]) }}
              />
              <span className="text-gray-400">{t.from}</span>
              <span>&rarr;</span>
              {t.to ? (
                <span style={{ color: getColor(colorIndex[t.to]) }}>{t.to}</span>
              ) : (
                <span className="text-gray-400">exhausted</span>
              )}
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
