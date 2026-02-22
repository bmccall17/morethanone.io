import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('faqs')
      .select('id, question, answer, category, related_items')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
