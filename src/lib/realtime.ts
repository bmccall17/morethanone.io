import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Participant } from '@/types/database'

export interface RoundCallbacks {
  onStatusChange: (status: string) => void
}

export interface ParticipantCallbacks {
  onPlayerJoined: (participant: Participant) => void
}

export function subscribeToRound(
  roundId: string,
  callbacks: RoundCallbacks
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`round:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rounds',
        filter: `id=eq.${roundId}`,
      },
      (payload) => {
        const newStatus = payload.new.status
        const oldStatus = payload.old.status
        if (newStatus !== oldStatus) {
          callbacks.onStatusChange(newStatus)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToParticipants(
  roundId: string,
  callbacks: ParticipantCallbacks
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`participants:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'participants',
        filter: `round_id=eq.${roundId}`,
      },
      (payload) => {
        callbacks.onPlayerJoined(payload.new as Participant)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
