import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.toUpperCase()

  if (!code) {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rounds')
    .select('id, prompt, status, options')
    .eq('join_code', code)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Round not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
