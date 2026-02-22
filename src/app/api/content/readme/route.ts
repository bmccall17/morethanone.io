import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    // Try DB first
    const supabase = await createClient()
    const { data } = await supabase
      .from('content_sections')
      .select('slug, title, body, related_items')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })

    if (data && data.length > 0) {
      const sections = data.map(s => ({
        heading: s.title,
        body: s.body,
      }))
      return NextResponse.json({ sections })
    }
  } catch {
    // DB unavailable, fall through to README
  }

  // Fallback: parse README.md
  try {
    const readmePath = path.join(process.cwd(), 'README.md')
    const raw = fs.readFileSync(readmePath, 'utf-8')

    const techStackIndex = raw.indexOf('## tech stack')
    const content = techStackIndex !== -1 ? raw.slice(0, techStackIndex).trimEnd() : raw

    const parts = content.split(/^## /m)
    const sections = parts.map((part, i) => {
      if (i === 0) {
        const lines = part.split('\n')
        const bodyLines = lines.filter(l => !l.startsWith('# '))
        return { heading: '', body: bodyLines.join('\n').trim() }
      }
      const newlineIndex = part.indexOf('\n')
      const heading = part.slice(0, newlineIndex).trim()
      const body = part.slice(newlineIndex + 1).trim()
      return { heading, body }
    }).filter(s => s.body.length > 0)

    return NextResponse.json({ sections })
  } catch {
    return NextResponse.json({ error: 'Could not read content' }, { status: 500 })
  }
}
