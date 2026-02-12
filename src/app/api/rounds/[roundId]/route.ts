import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rounds')
    .select('id, join_code, prompt, description, options, settings, status, reveal_view_state, ranking_started_at, previous_round_id, next_round_id, created_at')
    .eq('id', roundId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
