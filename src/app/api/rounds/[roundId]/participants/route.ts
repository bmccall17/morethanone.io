import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('participants')
    .select('id, display_name, removed, joined_at')
    .eq('round_id', roundId)
    .eq('removed', false)
    .order('joined_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
