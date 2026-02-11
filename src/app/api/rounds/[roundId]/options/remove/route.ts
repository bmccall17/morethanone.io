import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    .select('id, host_token, status, options')
    .eq('id', roundId)
    .single()

  if (roundError || !round) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  if (round.host_token !== hostToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (round.status !== 'setup') {
    return NextResponse.json(
      { error: 'Options can only be removed during setup' },
      { status: 400 }
    )
  }

  let body: { option?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.option || typeof body.option !== 'string') {
    return NextResponse.json({ error: 'option is required' }, { status: 400 })
  }

  const currentOptions: string[] = round.options ?? []
  if (!currentOptions.includes(body.option)) {
    return NextResponse.json({ error: 'Option not found' }, { status: 404 })
  }

  const updatedOptions = currentOptions.filter(o => o !== body.option)

  const { error: updateError } = await supabase
    .from('rounds')
    .update({ options: updatedOptions })
    .eq('id', roundId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ options: updatedOptions })
}
