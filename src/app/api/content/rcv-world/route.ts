import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('rcv_world_examples')
      .select('id, title, location, region, event_date, category, description, outcome, lessons, source_urls')
      .eq('status', 'published')
      .order('event_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
