import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('templates')
      .select('name, prompt, options')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    const templates = (data || []).map(t => ({
      label: t.name,
      prompt: t.prompt,
      options: t.options,
    }))

    return NextResponse.json(templates)
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
