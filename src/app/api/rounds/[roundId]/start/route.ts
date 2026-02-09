import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const hostToken = request.headers.get('X-Host-Token')

  if (!hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()

  // Verify host
  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('id, status, host_token, settings')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (round.status !== 'setup') {
    return NextResponse.json({ error: 'Round has already started' }, { status: 400 })
  }

  // If host_as_participant is enabled, create a participant record for the host
  let hostParticipantId: string | null = null
  if (round.settings?.host_as_participant) {
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        round_id: roundId,
        display_name: 'Host',
      })
      .select('id')
      .single()

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 })
    }

    hostParticipantId = participant.id
  }

  const { error: updateError } = await supabase
    .from('rounds')
    .update({ status: 'ranking' })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({
    status: 'ranking',
    ...(hostParticipantId && { hostParticipantId }),
  })
}
