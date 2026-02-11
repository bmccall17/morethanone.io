import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string; participantId: string }> }
) {
  const { roundId, participantId } = await params
  const hostToken = request.headers.get('X-Host-Token')

  if (!hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Verify host
  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('id, host_token')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify participant belongs to this round
  const { data: participant, error: participantError } = await supabase
    .from('participants')
    .select('id')
    .eq('id', participantId)
    .eq('round_id', roundId)
    .single()

  if (participantError || !participant) {
    return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
  }

  // Mark participant as removed
  const { error: updateError } = await supabase
    .from('participants')
    .update({ removed: true })
    .eq('id', participantId)
    .eq('round_id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
