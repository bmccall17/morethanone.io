import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackEvent } from '@/lib/analytics'

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

  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('id, status, host_token')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (round.status !== 'ranking') {
    return NextResponse.json({ error: 'Round is not in ranking phase' }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('rounds')
    .update({ status: 'closed' })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Track analytics — get participant and ranking counts
  const [{ count: playersJoined }, { count: ballotsSubmitted }] = await Promise.all([
    supabase.from('participants').select('*', { count: 'exact', head: true }).eq('round_id', roundId).eq('removed', false),
    supabase.from('rankings').select('*', { count: 'exact', head: true }).eq('round_id', roundId),
  ])
  trackEvent(supabase, 'round_closed', {
    players_joined: playersJoined || 0,
    ballots_submitted: ballotsSubmitted || 0,
  }, roundId)

  return NextResponse.json({ status: 'closed' })
}
