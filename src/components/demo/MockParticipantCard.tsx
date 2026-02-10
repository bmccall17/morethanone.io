'use client'

import { useMemo } from 'react'
import type { ConvergeRound } from '@/lib/engine/types'

interface MockParticipantCardProps {
  name: string
  ballot: string[]
  roundNumber: number
  rounds: ConvergeRound[]
}

export default function MockParticipantCard({
  name,
  ballot,
  roundNumber,
  rounds,
}: MockParticipantCardProps) {
  // Collect all options eliminated up to this round
  const eliminatedSet = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < roundNumber && i < rounds.length; i++) {
      if (rounds[i].eliminated) {
        set.add(rounds[i].eliminated!)
      }
    }
    return set
  }, [rounds, roundNumber])

  // Track which round each option was eliminated in
  const eliminatedAtRound = useMemo(() => {
    const map: Record<string, number> = {}
    for (let i = 0; i < rounds.length; i++) {
      if (rounds[i].eliminated) {
        map[rounds[i].eliminated!] = i + 1 // 1-indexed
      }
    }
    return map
  }, [rounds])

  // The active preference is the first non-eliminated option in the ballot
  const activePreference = ballot.find(opt => !eliminatedSet.has(opt)) ?? null

  // Was this voter's choice transferred this round?
  // i.e., was their previous active choice eliminated in the round we just stepped to?
  const transferredThisRound = useMemo(() => {
    if (roundNumber <= 1) return false
    const prevRoundIndex = roundNumber - 2 // 0-indexed
    if (prevRoundIndex >= rounds.length) return false
    const prevEliminated = rounds[prevRoundIndex].eliminated
    if (!prevEliminated) return false
    // Check if this voter had the eliminated option as their active choice at that point
    const prevEliminatedSet = new Set<string>()
    for (let i = 0; i < prevRoundIndex; i++) {
      if (rounds[i].eliminated) prevEliminatedSet.add(rounds[i].eliminated!)
    }
    const prevActive = ballot.find(opt => !prevEliminatedSet.has(opt))
    return prevActive === prevEliminated
  }, [ballot, rounds, roundNumber])

  // Track all rounds where this voter's choice was transferred (for persistent coloring)
  const transferHistory = useMemo(() => {
    const history = new Set<number>() // round numbers where transfer happened
    for (let rn = 2; rn <= roundNumber; rn++) {
      const prevRoundIndex = rn - 2
      if (prevRoundIndex >= rounds.length) break
      const prevEliminated = rounds[prevRoundIndex].eliminated
      if (!prevEliminated) continue
      const prevEliminatedSet = new Set<string>()
      for (let i = 0; i < prevRoundIndex; i++) {
        if (rounds[i].eliminated) prevEliminatedSet.add(rounds[i].eliminated!)
      }
      const prevActive = ballot.find(opt => !prevEliminatedSet.has(opt))
      if (prevActive === prevEliminated) {
        history.add(rn)
      }
    }
    return history
  }, [ballot, rounds, roundNumber])

  const wasEverTransferred = transferHistory.size > 0
  const isExhausted = activePreference === null

  return (
    <div className={`rounded-lg border p-3 shadow-sm transition-all duration-500 ${
      isExhausted
        ? 'bg-gray-50 border-gray-200 opacity-60'
        : transferredThisRound
          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-300'
          : 'bg-white border-gray-200'
    }`}>
      <p className="text-xs font-medium text-gray-500 mb-2 truncate">{name}</p>
      <ol className="space-y-0.5">
        {ballot.map((option, i) => {
          const isEliminated = eliminatedSet.has(option)
          const isActive = option === activePreference
          // Was this the destination of a transfer?
          const isTransferTarget = isActive && wasEverTransferred
          const justTransferred = isActive && transferredThisRound

          return (
            <li
              key={`${option}-${i}`}
              className={`text-sm flex items-center gap-1.5 transition-all duration-500 ${
                isEliminated
                  ? 'text-gray-300 line-through'
                  : isActive
                    ? justTransferred
                      ? 'text-amber-700 font-semibold'
                      : isTransferTarget
                        ? 'text-amber-600 font-semibold'
                        : 'text-indigo-700 font-semibold'
                    : 'text-gray-500'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 transition-all duration-500 ${
                isEliminated
                  ? 'bg-gray-100 text-gray-300'
                  : isActive
                    ? justTransferred
                      ? 'bg-amber-200 text-amber-700 scale-125'
                      : isTransferTarget
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </span>
              <span>{option}</span>
              {isActive && (
                <span className={`ml-auto text-[10px] font-normal ${
                  justTransferred
                    ? 'text-amber-500'
                    : isTransferTarget
                      ? 'text-amber-400'
                      : 'text-indigo-400'
                }`}>
                  {justTransferred ? 'transferred' : isTransferTarget ? 'transferred' : 'active'}
                </span>
              )}
              {isExhausted && isEliminated && option === ballot[ballot.length - 1] && (
                <span className="ml-auto text-[10px] text-gray-400 font-normal">exhausted</span>
              )}
            </li>
          )
        })}
        {isExhausted && (
          <li className="text-[10px] text-gray-400 italic pt-1">
            No remaining preferences
          </li>
        )}
      </ol>
    </div>
  )
}
