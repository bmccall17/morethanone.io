'use client'

import { useParams } from 'next/navigation'
import ProcessingView from '@/components/ProcessingView'

export default function HostProcessingPage() {
  const params = useParams()
  const roundId = params.roundId as string

  return (
    <ProcessingView
      roundId={roundId}
      redirectOnReveal={`/host/${roundId}/reveal`}
      triggerProcess
      showStepButton
    />
  )
}
