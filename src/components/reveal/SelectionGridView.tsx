'use client'

import { useMemo } from 'react'
import type { ConvergeRound } from '@/lib/engine/types'

// Stable color palette for distinguishing options
const OPTION_COLORS = [
  { bg: 'bg-orange-400', text: 'text-gray-900' },
  { bg: 'bg-indigo-400', text: 'text-white' },
  { bg: 'bg-emerald-400', text: 'text-gray-900' },
  { bg: 'bg-rose-400', text: 'text-white' },
  { bg: 'bg-cyan-400', text: 'text-gray-900' },
  { bg: 'bg-amber-400', text: 'text-gray-900' },
  { bg: 'bg-violet-400', text: 'text-white' },
  { bg: 'bg-lime-400', text: 'text-gray-900' },
  { bg: 'bg-pink-400', text: 'text-white' },
  { bg: 'bg-teal-400', text: 'text-gray-900' },
  { bg: 'bg-sky-400', text: 'text-gray-900' },
  { bg: 'bg-fuchsia-400', text: 'text-white' },
]

interface SelectionGridViewProps {
  ballots: { displayName: string; ranking: string[] }[]
  options: string[]
  /** When provided with roundNumber, enables animated elimination styling */
  rounds?: ConvergeRound[]
  /** 0-indexed: how many rounds of eliminations to show (0 = none) */
  roundNumber?: number
}

export default function SelectionGridView({ ballots, options, rounds, roundNumber }: SelectionGridViewProps) {
  const maxRank = Math.max(...ballots.map(b => b.ranking.length), 1)
  const rankLabels = Array.from({ length: maxRank }, (_, i) => {
    const n = i + 1
    if (n === 1) return '1st'
    if (n === 2) return '2nd'
    if (n === 3) return '3rd'
    return `${n}th`
  })

  // Map each option to a stable color
  const optionColorMap = useMemo(() => {
    const map: Record<string, { bg: string; text: string }> = {}
    options.forEach((opt, i) => {
      map[opt] = OPTION_COLORS[i % OPTION_COLORS.length]
    })
    return map
  }, [options])

  // Eliminated options up to the current round
  const eliminatedSet = useMemo(() => {
    const set = new Set<string>()
    if (!rounds || roundNumber === undefined) return set
    for (let i = 0; i < roundNumber && i < rounds.length; i++) {
      if (rounds[i].eliminated) set.add(rounds[i].eliminated!)
    }
    return set
  }, [rounds, roundNumber])

  const isAnimating = rounds !== undefined && roundNumber !== undefined

  return (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map(opt => {
          const color = optionColorMap[opt]
          const isEliminated = isAnimating && eliminatedSet.has(opt)
          return (
            <span
              key={opt}
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold transition-opacity duration-500 ${color.bg} ${color.text} ${
                isEliminated ? 'opacity-30 line-through' : ''
              }`}
            >
              {opt}
            </span>
          )
        })}
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2 pr-3 text-xs text-gray-500 font-medium">Voter</th>
            {rankLabels.map(label => (
              <th key={label} className="text-center py-2 px-1 text-sm font-bold text-orange-400">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ballots.map((ballot, rowIndex) => {
            // Determine the active preference for this voter
            const activePreference = isAnimating
              ? ballot.ranking.find(opt => !eliminatedSet.has(opt)) ?? null
              : null

            return (
              <tr key={rowIndex} className="border-t border-gray-800">
                <td className="py-2 pr-3 text-xs text-gray-400 whitespace-nowrap">
                  {ballot.displayName}
                </td>
                {rankLabels.map((_, colIndex) => {
                  const rankedOption = ballot.ranking[colIndex]
                  const color = rankedOption ? optionColorMap[rankedOption] : null
                  const isEliminated = isAnimating && rankedOption ? eliminatedSet.has(rankedOption) : false
                  const isActive = isAnimating && rankedOption === activePreference

                  return (
                    <td key={colIndex} className="text-center py-2 px-1">
                      <div className="flex items-center justify-center">
                        {rankedOption && color ? (
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold leading-none transition-all duration-500 ${
                              isEliminated
                                ? 'bg-gray-700 text-gray-500 opacity-40'
                                : isActive
                                  ? `${color.bg} ${color.text} ring-2 ring-white scale-110`
                                  : `${color.bg} ${color.text}`
                            }`}
                            title={rankedOption}
                          >
                            {rankedOption.length <= 3 ? rankedOption : rankedOption.slice(0, 2)}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-gray-700" />
                        )}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
