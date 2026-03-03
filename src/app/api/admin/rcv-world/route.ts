import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { validateRelatedItems } from '@/lib/related-items'

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const category = searchParams.get('category')
  const content_type = searchParams.get('content_type')
  const q = searchParams.get('q')

  const supabase = await createClient()
  let query = supabase
    .from('rcv_world_examples')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (content_type) query = query.contains('content_types', JSON.stringify([content_type]))
  if (q) query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)

  const { data, error } = await query

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
  const supabase = createAdminClient()

  // Validate content_types
  const validContentTypes = ['example', 'resource', 'news']
  let content_types = body.content_types
  if (Array.isArray(content_types)) {
    content_types = content_types.filter((t: string) => validContentTypes.includes(t))
  }
  if (!Array.isArray(content_types) || content_types.length === 0) {
    content_types = ['example']
  }

  const { data, error } = await supabase
    .from('rcv_world_examples')
    .insert({
      title: body.title,
      location: body.location || '',
      region: body.region || '',
      event_date: body.event_date || null,
      category: body.category || 'other',
      description: body.description || '',
      outcome: body.outcome || '',
      lessons: body.lessons || '',
      source_urls: body.source_urls || [],
      content_types,
      related_items: validateRelatedItems(body.related_items),
      status: body.status || 'draft',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
