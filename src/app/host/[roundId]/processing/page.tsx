'use client'

import { useParams } from 'next/navigation'
import ProcessingView from '@/components/ProcessingView'
import { useHostHeartbeat } from '@/lib/useHostHeartbeat'

export default function HostProcessingPage() {
  const params = useParams()
  const roundId = params.roundId as string

  useHostHeartbeat(roundId)

  return (
    <ProcessingView
      roundId={roundId}
      redirectOnReveal={`/host/${roundId}/reveal`}
      triggerProcess
      showStepButton
    />
  )
}
