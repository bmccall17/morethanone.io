import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_name, properties, round_id } = body

    if (!event_name || typeof event_name !== 'string') {
      return NextResponse.json({ error: 'event_name required' }, { status: 400 })
    }

    const supabase = await createClient()

    await supabase.from('events').insert({
      event_name,
      round_id: round_id || null,
      properties: properties || {},
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
