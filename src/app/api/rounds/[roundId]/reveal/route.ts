import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { converge } from '@/lib/engine/converge'
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

  // Verify host and get round
  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (round.status !== 'closed') {
    return NextResponse.json({ error: 'Round must be closed before revealing' }, { status: 400 })
  }

  // Get rankings from non-removed participants only
  const { data: rankings, error: rankingsError } = await supabase
    .from('rankings')
    .select('ranking, participants!inner(removed)')
    .eq('round_id', roundId)
    .eq('participants.removed', false)

  if (rankingsError) {
    return NextResponse.json({ error: rankingsError.message }, { status: 500 })
  }

  if (!rankings || rankings.length === 0) {
    return NextResponse.json({ error: 'No rankings submitted' }, { status: 400 })
  }

  // Run the convergence algorithm
  const result = converge({
    options: round.options as string[],
    rankings: rankings.map(r => r.ranking as string[]),
    seed: roundId,
  })

  // Store result
  const origin = new URL(request.url).origin
  const share_url = `${origin}/results/${roundId}`

  const { error: resultError } = await supabase
    .from('results')
    .upsert({
      round_id: roundId,
      winner: result.winner,
      majority_threshold: result.majority_threshold,
      total_active: result.total_active,
      rounds_data: result.rounds,
      tie_break_info: result.tie_breaks.length > 0
        ? result.tie_breaks.map(tb => tb.detail).join('; ')
        : null,
      summary: result.summary,
      share_url,
    }, { onConflict: 'round_id' })

  if (resultError) {
    return NextResponse.json({ error: resultError.message }, { status: 500 })
  }

  // Update round status
  const { error: updateError } = await supabase
    .from('rounds')
    .update({ status: 'revealed', reveal_view_state: { view: 'animation', animationRound: 1 } })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  trackEvent(supabase, 'results_revealed', {
    rounds_count: result.rounds.length,
    winner: result.winner,
    tie_break_used: result.tie_breaks.length > 0,
  }, roundId)

  return NextResponse.json(result)
}
