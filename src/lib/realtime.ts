import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Participant, Ranking, RevealViewState } from '@/types/database'

export interface RoundCallbacks {
  onStatusChange: (status: string) => void
  onNextRound?: (nextRoundId: string) => void
}

export interface ParticipantCallbacks {
  onPlayerJoined: (participant: Participant) => void
  onPlayerRemoved?: (participant: Participant) => void
}

export interface RankingCallbacks {
  onRankingSubmitted: (ranking: Ranking) => void
}

export interface ProcessingCallbacks {
  onProcessingUpdate: (roundNumber: number) => void
}

export interface RevealViewCallbacks {
  onRevealViewChange: (state: RevealViewState) => void
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
        const nextRoundId = payload.new.next_round_id
        if (nextRoundId && !payload.old.next_round_id && callbacks.onNextRound) {
          callbacks.onNextRound(nextRoundId)
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
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'participants',
        filter: `round_id=eq.${roundId}`,
      },
      (payload) => {
        const participant = payload.new as Participant
        if (participant.removed && callbacks.onPlayerRemoved) {
          callbacks.onPlayerRemoved(participant)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToRankings(
  roundId: string,
  callbacks: RankingCallbacks
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`rankings:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'rankings',
        filter: `round_id=eq.${roundId}`,
      },
      (payload) => {
        callbacks.onRankingSubmitted(payload.new as Ranking)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rankings',
        filter: `round_id=eq.${roundId}`,
      },
      (payload) => {
        callbacks.onRankingSubmitted(payload.new as Ranking)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToProcessing(
  roundId: string,
  callbacks: ProcessingCallbacks
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`processing:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rounds',
        filter: `id=eq.${roundId}`,
      },
      (payload) => {
        const newRound = payload.new.current_processing_round
        const oldRound = payload.old.current_processing_round
        if (newRound !== oldRound) {
          callbacks.onProcessingUpdate(newRound)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToRevealView(
  roundId: string,
  callbacks: RevealViewCallbacks
): () => void {
  const supabase = createClient()

  const channel: RealtimeChannel = supabase
    .channel(`reveal-view:${roundId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rounds',
        filter: `id=eq.${roundId}`,
      },
      (payload) => {
        const newState = payload.new.reveal_view_state
        const oldState = payload.old.reveal_view_state
        if (JSON.stringify(newState) !== JSON.stringify(oldState)) {
          callbacks.onRevealViewChange(newState as RevealViewState)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
