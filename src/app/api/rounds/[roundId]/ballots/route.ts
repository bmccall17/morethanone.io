import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const supabase = await createClient()

  // Verify round is revealed
  const { data: round, error: roundError } = await supabase
    .from('rounds')
    .select('status, settings')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (!['processing', 'closed', 'revealed'].includes(round.status)) {
    return NextResponse.json({ error: 'Results not yet available' }, { status: 400 })
  }

  // Get rankings joined with participants
  const { data: rankings, error: rankingsError } = await supabase
    .from('rankings')
    .select('ranking, participant_id, participants!inner(display_name)')
    .eq('round_id', roundId)

  if (rankingsError) {
    return NextResponse.json({ error: rankingsError.message }, { status: 500 })
  }

  const settings = round.settings as { anonymousResults?: boolean }
  const ballots = (rankings || []).map((r: Record<string, unknown>, index: number) => {
    const participant = r.participants as { display_name: string }
    return {
      displayName: settings.anonymousResults
        ? `Voter ${index + 1}`
        : participant.display_name,
      ranking: r.ranking as string[],
    }
  })

  return NextResponse.json(ballots)
}
