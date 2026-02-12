import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { RoundSettings } from '@/types/database'
import { trackEvent } from '@/lib/analytics'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  try {
    const { roundId } = await params
    const body = await request.json()
    const { participantId, ranking } = body

    if (!participantId || !ranking || !Array.isArray(ranking)) {
      return NextResponse.json({ error: 'participantId and ranking array required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify round is in ranking status
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('status, options, settings')
      .eq('id', roundId)
      .single()

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    if (round.status !== 'ranking') {
      return NextResponse.json({ error: 'Round is not accepting rankings' }, { status: 400 })
    }

    const settings = round.settings as RoundSettings | null
    if (settings?.max_ranks && ranking.length > settings.max_ranks) {
      return NextResponse.json(
        { error: `Rankings exceed the maximum of ${settings.max_ranks}` },
        { status: 400 }
      )
    }

    // Verify participant exists and belongs to this round
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .select('id')
      .eq('id', participantId)
      .eq('round_id', roundId)
      .eq('removed', false)
      .single()

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Upsert ranking
    const { error: upsertError } = await supabase
      .from('rankings')
      .upsert(
        {
          round_id: roundId,
          participant_id: participantId,
          ranking,
          submitted_at: new Date().toISOString(),
        },
        { onConflict: 'round_id,participant_id' }
      )

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    trackEvent(supabase, 'ballot_submitted', {
      ranks_count: ranking.length,
    }, roundId)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const supabase = await createClient()

  const { count, error } = await supabase
    .from('rankings')
    .select('*', { count: 'exact', head: true })
    .eq('round_id', roundId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ count: count || 0 })
}
