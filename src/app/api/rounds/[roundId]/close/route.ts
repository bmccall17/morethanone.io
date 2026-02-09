import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

  if (round.status !== 'ranking') {
    return NextResponse.json({ error: 'Round is not in ranking phase' }, { status: 400 })
  }

  const settings = round.settings as RoundSettings
  const newStatus = settings.show_processing ? 'processing' : 'closed'

  const { error: updateError } = await supabase
    .from('rounds')
    .update({ status: newStatus })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ status: newStatus })
}
