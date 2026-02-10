import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { prompt, description, options, settings } = body

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }
    if (!options || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options required' }, { status: 400 })
    }

    const supabase = await createClient()
    const hostToken = crypto.randomUUID()
    const joinCode = generateJoinCode()

    const { data, error } = await supabase
      .from('rounds')
      .insert({
        join_code: joinCode,
        prompt,
        description: description || null,
        options,
        settings: settings || { allowTies: false, anonymousResults: false, host_as_participant: false, show_processing: false, bot_count: 0 },
        status: 'setup',
        host_token: hostToken,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      id: data.id,
      join_code: data.join_code,
      host_token: hostToken,
    })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
