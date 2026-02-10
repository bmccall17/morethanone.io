'use client'

import { Fragment, useMemo } from 'react'
import type { RoundData } from '@/types/database'

interface FullResultsTableViewProps {
  rounds: RoundData[]
  winner: string
  options: string[]
}

export default function FullResultsTableView({ rounds, winner, options }: FullResultsTableViewProps) {
  // Collect all unique options, preserving initial order
  const allOptions = useMemo(() => {
    const seen = new Set<string>(options)
    for (const round of rounds) {
      for (const key of Object.keys(round.tallies)) seen.add(key)
    }
    return [...seen]
  }, [rounds, options])

  // Track when each option was eliminated
  const eliminatedAt = useMemo(() => {
    const map: Record<string, number> = {}
    for (const round of rounds) {
      if (round.eliminated) {
        map[round.eliminated] = round.round_number
      }
    }
    return map
  }, [rounds])

  return (
    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-2 pr-3 text-gray-400 font-medium sticky left-0 bg-gray-900">
              Candidate
            </th>
            {rounds.map(round => (
              <th
                key={round.round_number}
                colSpan={3}
                className="text-center py-2 px-1 text-gray-400 font-medium border-l border-gray-700"
              >
                Round {round.round_number}
              </th>
            ))}
          </tr>
          <tr className="border-b border-gray-700">
            <th className="sticky left-0 bg-gray-900" />
            {rounds.map(round => (
              <Fragment key={round.round_number}>
                <th className="text-center py-1 px-1 text-xs text-gray-500 border-l border-gray-700">Votes</th>
                <th className="text-center py-1 px-1 text-xs text-gray-500">%</th>
                <th className="text-center py-1 px-1 text-xs text-gray-500">+/-</th>
              </Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {allOptions.map(option => {
            const isWinner = option === winner
            return (
              <tr
                key={option}
                className={`border-b border-gray-800 ${isWinner ? 'bg-green-900/20' : ''}`}
              >
                <td className={`py-2 pr-3 font-medium sticky left-0 bg-gray-900 ${
                  isWinner ? 'text-green-400 font-bold' : 'text-gray-300'
                }`}>
                  {option}
                </td>
                {rounds.map((round, roundIdx) => {
                  const wasEliminated = eliminatedAt[option] !== undefined && eliminatedAt[option] < round.round_number
                  const eliminatedThisRound = round.eliminated === option
                  const count = round.tallies[option]
                  const pct = count !== undefined && round.active > 0
                    ? ((count / round.active) * 100).toFixed(1)
                    : null
                  const prevCount = roundIdx > 0 ? rounds[roundIdx - 1].tallies[option] : undefined
                  const delta = count !== undefined && prevCount !== undefined
                    ? count - prevCount
                    : null

                  if (wasEliminated) {
                    return (
                      <Fragment key={round.round_number}>
                        <td colSpan={3} className="text-center py-2 px-1 text-xs text-gray-600 italic border-l border-gray-700">
                          Eliminated
                        </td>
                      </Fragment>
                    )
                  }

                  const cellColor = eliminatedThisRound
                    ? 'text-red-400'
                    : isWinner && roundIdx === rounds.length - 1
                      ? 'text-green-400 font-bold'
                      : 'text-gray-300'

                  return (
                    <Fragment key={round.round_number}>
                      <td className={`text-center py-2 px-1 font-mono border-l border-gray-700 ${cellColor}`}>
                        {count ?? '-'}
                      </td>
                      <td className={`text-center py-2 px-1 font-mono ${cellColor}`}>
                        {pct !== null ? `${pct}%` : '-'}
                      </td>
                      <td className={`text-center py-2 px-1 font-mono text-xs ${
                        delta !== null && delta > 0 ? 'text-green-400' :
                        delta !== null && delta < 0 ? 'text-red-400' :
                        'text-gray-600'
                      }`}>
                        {delta !== null
                          ? delta > 0 ? `+${delta}` : delta === 0 ? '-' : `${delta}`
                          : '-'
                        }
                      </td>
                    </Fragment>
                  )
                })}
              </tr>
            )
          })}
          {/* Inactive row */}
          <tr className="border-t border-gray-700">
            <td className="py-2 pr-3 font-medium text-gray-500 italic sticky left-0 bg-gray-900">
              Inactive
            </td>
            {rounds.map(round => (
              <Fragment key={round.round_number}>
                <td className="text-center py-2 px-1 font-mono text-gray-500 border-l border-gray-700">
                  {round.inactive}
                </td>
                <td className="text-center py-2 px-1 text-gray-600" colSpan={2}>
                  {round.inactive > 0 ? `${round.inactive} ballot${round.inactive !== 1 ? 's' : ''}` : ''}
                </td>
              </Fragment>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
