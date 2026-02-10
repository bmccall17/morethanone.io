import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
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
    .select('host_token, status')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (round.status !== 'revealed') {
    return NextResponse.json({ error: 'Round must be in revealed state' }, { status: 400 })
  }

  const body = await request.json()
  const { view, animationRound } = body

  if (!view || !['animation', 'selection', 'table'].includes(view)) {
    return NextResponse.json({ error: 'Invalid view type' }, { status: 400 })
  }

  const { error: updateError } = await supabase
    .from('rounds')
    .update({ reveal_view_state: { view, animationRound: animationRound ?? 1 } })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
