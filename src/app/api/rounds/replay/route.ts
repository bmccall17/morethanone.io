import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackEvent } from '@/lib/analytics'

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { roundId } = body
    const hostToken = request.headers.get('X-Host-Token')

    if (!hostToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!roundId) {
      return NextResponse.json({ error: 'roundId required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch original round
    const { data: original, error: roundError } = await supabase
      .from('rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError || !original) {
      return NextResponse.json({ error: 'Round not found' }, { status: 404 })
    }

    if (original.host_token !== hostToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create new round with same settings
    const newHostToken = crypto.randomUUID()
    const newJoinCode = generateJoinCode()

    const { data: newRound, error: insertError } = await supabase
      .from('rounds')
      .insert({
        join_code: newJoinCode,
        prompt: original.prompt,
        description: original.description,
        options: original.options,
        settings: original.settings,
        status: 'setup',
        host_token: newHostToken,
        previous_round_id: roundId,
      })
      .select()
      .single()

    if (insertError || !newRound) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create round' }, { status: 500 })
    }

    // Link old round to new round (triggers realtime for participants)
    await supabase
      .from('rounds')
      .update({ next_round_id: newRound.id })
      .eq('id', roundId)

    trackEvent(supabase, 'replay_created', {
      previous_round_id: roundId,
    }, newRound.id)

    return NextResponse.json({
      id: newRound.id,
      join_code: newJoinCode,
      host_token: newHostToken,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
