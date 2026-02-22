import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('rcv_world_examples')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const supabase = await createClient()

  // Validate content_types if provided
  let content_types_update: Record<string, string[]> = {}
  if (body.content_types !== undefined) {
    const validContentTypes = ['example', 'resource', 'news']
    let ct = body.content_types
    if (Array.isArray(ct)) {
      ct = ct.filter((t: string) => validContentTypes.includes(t))
    }
    if (Array.isArray(ct) && ct.length > 0) {
      content_types_update = { content_types: ct }
    }
  }

  const { data, error } = await supabase
    .from('rcv_world_examples')
    .update({
      ...(body.title !== undefined && { title: body.title }),
      ...(body.location !== undefined && { location: body.location }),
      ...(body.region !== undefined && { region: body.region }),
      ...(body.event_date !== undefined && { event_date: body.event_date || null }),
      ...(body.category !== undefined && { category: body.category }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.outcome !== undefined && { outcome: body.outcome }),
      ...(body.lessons !== undefined && { lessons: body.lessons }),
      ...(body.source_urls !== undefined && { source_urls: body.source_urls }),
      ...content_types_update,
      ...(body.status !== undefined && { status: body.status }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()

  const { error } = await supabase
    .from('rcv_world_examples')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
