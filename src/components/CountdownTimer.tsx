'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  deadlineIso: string
  onExpired?: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function CountdownTimer({ deadlineIso, onExpired }: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const diff = Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000)
    return Math.max(0, diff)
  })

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000)
      const clamped = Math.max(0, diff)
      setSecondsLeft(clamped)
      if (clamped <= 0) {
        clearInterval(interval)
        onExpired?.()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [deadlineIso, onExpired])

  if (secondsLeft <= 0) {
    return (
      <div className="text-center py-2">
        <p className="text-lg font-bold text-red-600">Time&apos;s up!</p>
      </div>
    )
  }

  const isUrgent = secondsLeft <= 30

  return (
    <div className="text-center py-2">
      <p className={`text-2xl font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
        {formatTime(secondsLeft)}
      </p>
      <p className="text-xs text-gray-500">remaining</p>
    </div>
  )
}

export function computeDeadline(rankingStartedAt: string, timerMinutes: number): string {
  const start = new Date(rankingStartedAt)
  return new Date(start.getTime() + timerMinutes * 60 * 1000).toISOString()
}
