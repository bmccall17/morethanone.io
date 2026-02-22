import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { validateRelatedItems } from '@/lib/related-items'

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('faqs')
    .insert({
      question: body.question,
      answer: body.answer || '',
      category: body.category || 'general',
      sort_order: body.sort_order ?? 0,
      is_published: body.is_published ?? false,
      related_items: validateRelatedItems(body.related_items),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
