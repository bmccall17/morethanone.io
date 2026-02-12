import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const readmePath = path.join(process.cwd(), 'README.md')
    const raw = fs.readFileSync(readmePath, 'utf-8')

    // Extract content up through "what's in the box" section (stop before "## tech stack")
    const techStackIndex = raw.indexOf('## tech stack')
    const content = techStackIndex !== -1 ? raw.slice(0, techStackIndex).trimEnd() : raw

    // Split into sections by ## headers
    const parts = content.split(/^## /m)
    const sections = parts.map((part, i) => {
      if (i === 0) {
        // Intro section (before first ## header) — strip the # title line
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
    return NextResponse.json({ error: 'Could not read README' }, { status: 500 })
  }
}
