'use client'

import { useMemo } from 'react'
import { getOptionColor } from '@/lib/colors'
import type { ConvergeResult, ConvergeRound } from '@/lib/engine/types'

interface DemoTallyViewProps {
  result: ConvergeResult
  /** 1-indexed current round number */
  roundNumber: number
  /** Canonical option list for stable color mapping (shared with SelectionGridView) */
  options?: string[]
}

function getColor(index: number): string {
  return getOptionColor(index).hex
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

export default function DemoTallyView({ result, roundNumber, options }: DemoTallyViewProps) {
  const { rounds, winner } = result

  // Stable option order from all rounds (for display)
  const allOptions = useMemo(() => {
    const opts = new Set<string>()
    for (const round of rounds) {
      for (const key of Object.keys(round.tallies)) opts.add(key)
    }
    return [...opts]
  }, [rounds])

  // Color index lookup — use canonical options prop when available for consistency with SelectionGridView
  const colorIndex = useMemo(() => {
    const map: Record<string, number> = {}
    const colorSource = options || allOptions
    colorSource.forEach((opt, i) => { map[opt] = i })
    return map
  }, [options, allOptions])

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

  // Provenance for stacked bars at current display round
  const provenance = useMemo(
    () => computeProvenance(rounds, roundNumber, allOptions),
    [rounds, roundNumber, allOptions]
  )

  // Options eliminated BEFORE this display round (bar already at 0)
  const eliminatedBefore = useMemo(() => {
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

      {/* Stacked bar chart */}
      <div className="space-y-2.5">
        {allOptions.map(option => {
          const optProv = provenance[option] || {}
          const total = Object.values(optProv).reduce((s, v) => s + v, 0)
          const isGone = eliminatedBefore.has(option)
          const isElimNow = eliminatedThisRound === option
          const isTheWinner = isLastRound && option === winner
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
                    {isGone || isElimNow
                      ? <s>{option}</s>
                      : option
                    }
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

      {/* Transfer indicators for current round's elimination */}
      {currentRound.transfers.length > 0 && (
        <div className="space-y-0.5 text-xs text-gray-500">
          {currentRound.transfers.map((t, i) => (
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
