import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { validateRelatedItems } from '@/lib/related-items'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content_sections')
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

  const { data, error } = await supabase
    .from('content_sections')
    .update({
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.body !== undefined && { body: body.body }),
      ...(body.sort_order !== undefined && { sort_order: body.sort_order }),
      ...(body.is_published !== undefined && { is_published: body.is_published }),
      ...(body.related_items !== undefined && { related_items: validateRelatedItems(body.related_items) }),
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
    .from('content_sections')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
