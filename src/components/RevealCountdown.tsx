'use client'

import { useEffect, useState } from 'react'

interface RevealCountdownProps {
  onComplete: () => void
}

export default function RevealCountdown({ onComplete }: RevealCountdownProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count <= 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCount(count - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  if (count <= 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <span
        key={count}
        className="text-9xl font-bold text-gray-900 animate-countdown"
      >
        {count}
      </span>
      <style>{`
        @keyframes countdown-pop {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          20% {
            opacity: 1;
            transform: scale(1.1);
          }
          40% {
            transform: scale(1);
          }
          80% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(1.5);
          }
        }
        .animate-countdown {
          animation: countdown-pop 1s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

export { type RevealCountdownProps }
