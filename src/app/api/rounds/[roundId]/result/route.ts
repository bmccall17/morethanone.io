import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roundId: string }> }
) {
  const { roundId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('round_id', roundId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Result not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
