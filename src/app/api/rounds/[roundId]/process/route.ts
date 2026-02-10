import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { converge } from '@/lib/engine/converge'
import type { RoundSettings } from '@/types/database'

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

  if (round.status !== 'processing') {
    return NextResponse.json(
      { error: 'Round must be in processing phase' },
      { status: 400 }
    )
  }

  const settings = round.settings as RoundSettings
  if (!settings.show_processing) {
    return NextResponse.json(
      { error: 'Processing view is not enabled for this round' },
      { status: 400 }
    )
  }

  // Get all rankings
  const { data: rankings, error: rankingsError } = await supabase
    .from('rankings')
    .select('ranking')
    .eq('round_id', roundId)

  if (rankingsError) {
    return NextResponse.json({ error: rankingsError.message }, { status: 500 })
  }

  if (!rankings || rankings.length === 0) {
    return NextResponse.json({ error: 'No rankings submitted' }, { status: 400 })
  }

  // Run the full convergence algorithm
  const result = converge({
    options: round.options as string[],
    rankings: rankings.map(r => r.ranking as string[]),
    seed: roundId,
  })

  // Compute share URL
  const origin = new URL(request.url).origin
  const share_url = `${origin}/results/${roundId}`

  // Step through each round incrementally, storing and broadcasting
  for (let i = 0; i < result.rounds.length; i++) {
    const processingRounds = result.rounds.slice(0, i + 1)
    const currentRoundNumber = i + 1

    // Update processing_data on results table incrementally
    const { error: resultError } = await supabase
      .from('results')
      .upsert({
        round_id: roundId,
        winner: result.winner,
        majority_threshold: result.majority_threshold,
        total_active: result.total_active,
        rounds_data: result.rounds,
        processing_data: processingRounds,
        tie_break_info: result.tie_breaks.length > 0
          ? result.tie_breaks.map(tb => tb.detail).join('; ')
          : null,
        summary: result.summary,
        share_url,
      }, { onConflict: 'round_id' })

    if (resultError) {
      return NextResponse.json({ error: resultError.message }, { status: 500 })
    }

    // Broadcast progress by updating current_processing_round on the round row
    const { error: broadcastError } = await supabase
      .from('rounds')
      .update({ current_processing_round: currentRoundNumber })
      .eq('id', roundId)

    if (broadcastError) {
      return NextResponse.json({ error: broadcastError.message }, { status: 500 })
    }
  }

  // Transition round to closed (processing complete, ready for reveal)
  const { error: statusError } = await supabase
    .from('rounds')
    .update({ status: 'closed' })
    .eq('id', roundId)

  if (statusError) {
    return NextResponse.json({ error: statusError.message }, { status: 500 })
  }

  return NextResponse.json({
    status: 'closed',
    total_rounds: result.rounds.length,
    winner: result.winner,
    summary: result.summary,
  })
}
