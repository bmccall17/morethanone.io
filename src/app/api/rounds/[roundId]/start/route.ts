import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { pickBotNames } from '@/lib/bot-names'

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
    .select('id, status, host_token, settings, options')
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

  // Create bot participants if configured
  const botCount = round.settings?.bot_count ?? 0
  if (botCount > 0 && round.options?.length >= 2) {
    const botNames = pickBotNames(botCount)
    for (const name of botNames) {
      try {
        const { data: botParticipant } = await supabase
          .from('participants')
          .insert({ round_id: roundId, display_name: name })
          .select('id')
          .single()

        if (botParticipant) {
          const shuffled = [...round.options].sort(() => Math.random() - 0.5)
          await supabase
            .from('rankings')
            .insert({ round_id: roundId, participant_id: botParticipant.id, ranking: shuffled })
        }
      } catch {
        // Silently skip failed bots — don't block the round
      }
    }
  }

  return NextResponse.json({
    status: 'ranking',
    ...(hostParticipantId && { hostParticipantId }),
  })
}
