'use client'

import { forwardRef } from 'react'

interface ResultCardProps {
  prompt: string
  winner: string
  totalParticipants: number
  totalRounds: number
  winningPercentage: number
}

const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ prompt, winner, totalParticipants, totalRounds, winningPercentage }, ref) => {
    return (
      <div
        ref={ref}
        style={{ width: 1200, height: 630 }}
        className="flex flex-col items-center justify-center bg-gray-900 text-white px-16 py-12"
      >
        <p className="text-lg text-indigo-400 mb-4 tracking-wide uppercase">The group decided</p>

        <h1 className="text-6xl font-bold text-white mb-6 text-center leading-tight">
          {winner}
        </h1>

        <p className="text-xl text-gray-400 mb-10 text-center max-w-2xl">
          &ldquo;{prompt}&rdquo;
        </p>

        <div className="flex gap-12 text-center mb-12">
          <div>
            <p className="text-3xl font-bold text-indigo-400">{winningPercentage}%</p>
            <p className="text-sm text-gray-500 mt-1">support</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-400">{totalParticipants}</p>
            <p className="text-sm text-gray-500 mt-1">participants</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-indigo-400">{totalRounds}</p>
            <p className="text-sm text-gray-500 mt-1">{totalRounds === 1 ? 'round' : 'rounds'}</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 tracking-widest uppercase">
          more than one
        </p>
      </div>
    )
  }
)

ResultCard.displayName = 'ResultCard'

export default ResultCard
