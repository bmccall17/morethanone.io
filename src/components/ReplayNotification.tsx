'use client'

import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ReplayNotificationProps {
  joinCode: string
  displayName?: string
}

export default function ReplayNotification({ joinCode, displayName }: ReplayNotificationProps) {
  const joinUrl = `/join?code=${joinCode}${displayName ? `&name=${encodeURIComponent(displayName)}` : ''}`

  return (
    <Card className="border-indigo-200 bg-indigo-50">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-indigo-900">The host started a new round!</p>
        <Button size="lg" className="w-full" onClick={() => window.location.href = joinUrl}>
          Join next round
        </Button>
      </div>
    </Card>
  )
}
