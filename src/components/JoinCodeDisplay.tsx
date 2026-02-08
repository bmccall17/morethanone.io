'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import Card from '@/components/ui/Card'

interface JoinCodeDisplayProps {
  code: string
  roundId: string
}

export default function JoinCodeDisplay({ code, roundId }: JoinCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const joinUrl = `${window.location.origin}/join?code=${code}`
    QRCode.toCanvas(canvasRef.current, joinUrl, {
      width: 160,
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' },
    })
  }, [code, roundId])

  return (
    <Card className="text-center">
      <p className="text-sm text-gray-500 mb-2">Share this code to join</p>
      <p className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-gray-900 mb-4">
        {code}
      </p>
      <div className="flex justify-center">
        <canvas ref={canvasRef} className="rounded-lg" />
      </div>
      <p className="text-xs text-gray-400 mt-3">
        or go to {typeof window !== 'undefined' ? window.location.origin : ''}/join
      </p>
    </Card>
  )
}
