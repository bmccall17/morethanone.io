import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const q = searchParams.get('q') || ''

  if (!type) {
    return NextResponse.json({ error: 'type is required' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (type) {
    case 'round': {
      let query = supabase
        .from('rounds')
        .select('id, prompt')
        .order('created_at', { ascending: false })
        .limit(10)
      if (q) query = query.ilike('prompt', `%${q}%`)
      const { data } = await query
      return NextResponse.json((data || []).map(r => ({ id: r.id, label: r.prompt })))
    }
    case 'faq': {
      let query = supabase
        .from('faqs')
        .select('id, question')
        .order('sort_order', { ascending: true })
        .limit(10)
      if (q) query = query.ilike('question', `%${q}%`)
      const { data } = await query
      return NextResponse.json((data || []).map(r => ({ id: r.id, label: r.question })))
    }
    case 'rcv_world': {
      let query = supabase
        .from('rcv_world_examples')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(10)
      if (q) query = query.ilike('title', `%${q}%`)
      const { data } = await query
      return NextResponse.json((data || []).map(r => ({ id: r.id, label: r.title })))
    }
    case 'template': {
      let query = supabase
        .from('templates')
        .select('id, name')
        .order('sort_order', { ascending: true })
        .limit(10)
      if (q) query = query.ilike('name', `%${q}%`)
      const { data } = await query
      return NextResponse.json((data || []).map(r => ({ id: r.id, label: r.name })))
    }
    case 'content_section': {
      let query = supabase
        .from('content_sections')
        .select('id, title')
        .order('sort_order', { ascending: true })
        .limit(10)
      if (q) query = query.ilike('title', `%${q}%`)
      const { data } = await query
      return NextResponse.json((data || []).map(r => ({ id: r.id, label: r.title })))
    }
    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }
}
