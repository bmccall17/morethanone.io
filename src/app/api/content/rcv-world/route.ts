import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const content_type = searchParams.get('content_type')

    const supabase = await createClient()
    let query = supabase
      .from('rcv_world_examples')
      .select('id, title, location, region, event_date, category, content_types, description, outcome, lessons, source_urls, related_items')
      .eq('status', 'published')
      .order('event_date', { ascending: false })

    if (content_type) {
      query = query.contains('content_types', JSON.stringify([content_type]))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
