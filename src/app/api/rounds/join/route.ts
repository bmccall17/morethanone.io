import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { code, displayName } = body

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Join code is required' }, { status: 400 })
    }
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the round
    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .select('id, status')
      .eq('join_code', code.toUpperCase())
      .single()

    if (roundError || !round) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    if (round.status !== 'setup' && round.status !== 'ranking') {
      return NextResponse.json({ error: 'Round is no longer accepting participants' }, { status: 400 })
    }

    // Create participant
    const { data: participant, error: participantError } = await supabase
      .from('participants')
      .insert({
        round_id: round.id,
        display_name: displayName.trim(),
      })
      .select()
      .single()

    if (participantError) {
      return NextResponse.json({ error: participantError.message }, { status: 500 })
    }

    return NextResponse.json({
      participantId: participant.id,
      roundId: round.id,
      roundStatus: round.status,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
