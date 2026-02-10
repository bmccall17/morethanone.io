'use client'

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
  const eliminatedSet = new Set<string>()
  for (let i = 0; i < roundNumber && i < rounds.length; i++) {
    if (rounds[i].eliminated) {
      eliminatedSet.add(rounds[i].eliminated!)
    }
  }

  // The active preference is the first non-eliminated option in the ballot
  const activePreference = ballot.find(opt => !eliminatedSet.has(opt)) ?? null

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-2 truncate">{name}</p>
      <ol className="space-y-0.5">
        {ballot.map((option, i) => {
          const isEliminated = eliminatedSet.has(option)
          const isActive = option === activePreference

          return (
            <li
              key={option}
              className={`text-sm flex items-center gap-1.5 transition-all duration-300 ${
                isEliminated
                  ? 'text-gray-300 line-through'
                  : isActive
                    ? 'text-indigo-700 font-semibold'
                    : 'text-gray-500'
              }`}
            >
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                isEliminated
                  ? 'bg-gray-100 text-gray-300'
                  : isActive
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-50 text-gray-400'
              }`}>
                {i + 1}
              </span>
              <span>{option}</span>
              {isActive && (
                <span className="ml-auto text-[10px] text-indigo-400 font-normal">active</span>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
