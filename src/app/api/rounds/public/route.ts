import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data: rounds, error } = await supabase
    .from('rounds')
    .select('id, join_code, prompt, status, options, created_at')
    .eq('is_private', false)
    .in('status', ['setup', 'ranking'])
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!rounds || rounds.length === 0) {
    return NextResponse.json({ rounds: [] })
  }

  const roundIds = rounds.map(r => r.id)
  const { data: participants } = await supabase
    .from('participants')
    .select('round_id')
    .in('round_id', roundIds)
    .eq('removed', false)

  const countsByRound: Record<string, number> = {}
  if (participants) {
    for (const p of participants) {
      countsByRound[p.round_id] = (countsByRound[p.round_id] || 0) + 1
    }
  }

  const result = rounds.map(r => ({
    id: r.id,
    join_code: r.join_code,
    prompt: r.prompt,
    status: r.status,
    options_count: Array.isArray(r.options) ? r.options.length : 0,
    participant_count: countsByRound[r.id] || 0,
    created_at: r.created_at,
  }))

  return NextResponse.json({ rounds: result })
}
