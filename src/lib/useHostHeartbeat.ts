'use client'

import { useEffect } from 'react'
import { getHostToken } from '@/lib/host-token'

const HEARTBEAT_INTERVAL = 30_000 // 30 seconds

export function useHostHeartbeat(roundId: string) {
  useEffect(() => {
    const hostToken = getHostToken(roundId)
    if (!hostToken) return

    function sendHeartbeat() {
      fetch(`/api/rounds/${roundId}/heartbeat`, {
        method: 'PATCH',
        headers: { 'X-Host-Token': hostToken! },
      }).catch(() => {})
    }

    sendHeartbeat()
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)
    return () => clearInterval(interval)
  }, [roundId])
}
