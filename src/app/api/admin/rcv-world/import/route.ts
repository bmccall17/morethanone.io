import { NextResponse } from 'next/server'
import { verifyAdminAuth } from '@/lib/admin-auth'
import { extractMetadata, htmlToText } from '@/lib/html-to-text'

export const maxDuration = 10

const GEMINI_PROMPT = `You are analyzing a web article about Ranked Choice Voting (RCV), also known as instant-runoff voting or preferential voting. Extract structured information from the article text below.

Return a JSON object with these fields (use empty string "" if not found):
- title: A concise descriptive title for this RCV example/event
- location: City, state, or specific jurisdiction mentioned
- region: Country or broader region
- event_date: Date in YYYY-MM-DD format if mentioned, otherwise ""
- category: One of: "election", "referendum", "community", "corporate", "other"
  - election: actual RCV elections (primaries, generals, municipal)
  - referendum: ballot measures about adopting/repealing RCV
  - community: advocacy, adoption efforts, educational content, opinion pieces
  - corporate: corporate/organizational use of RCV
  - other: anything that doesn't fit above
- description: 2-4 sentence summary of what the article covers regarding RCV
- outcome: What was the result or current status? Use "" if not applicable
- lessons: Key takeaways or lessons about RCV from this article. Use "" if none

Article text:
`

export async function POST(request: Request) {
  if (!verifyAdminAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const diag: Record<string, unknown> = {}

  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = body.url?.trim()
  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  // Fetch the article with 5s timeout
  let html: string
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MoreThanOneBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })
    clearTimeout(timeout)

    diag.fetchStatus = res.status

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain') && !contentType.includes('application/xhtml')) {
      console.log('[import]', diag)
      return NextResponse.json({ error: 'URL did not return HTML content', diagnostics: diag }, { status: 400 })
    }

    html = await res.text()
    diag.htmlLength = html.length
  } catch (err) {
    const message = err instanceof Error && err.name === 'AbortError'
      ? 'Request timed out (5s limit)'
      : 'Failed to fetch URL'
    diag.fetchError = message
    console.log('[import]', diag)
    return NextResponse.json({ error: message, diagnostics: diag }, { status: 400 })
  }

  const metadata = extractMetadata(html)
  const articleText = htmlToText(html)
  const bestTitle = metadata.ogTitle || metadata.title || ''

  diag.articleTextLength = articleText.length
  diag.articleTextPreview = articleText.slice(0, 200)

  // Try AI extraction if Gemini key is set
  const geminiKey = process.env.GEMINI_API_KEY
  diag.geminiKeySet = !!geminiKey

  if (geminiKey) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: GEMINI_PROMPT + articleText }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      )
      clearTimeout(timeout)

      diag.geminiStatus = geminiRes.status

      if (!geminiRes.ok) {
        diag.geminiError = await geminiRes.text().catch(() => '(unreadable)')
      }

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json()
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
        diag.geminiRawText = text?.slice(0, 500) || null

        if (text) {
          try {
            const fields = JSON.parse(text)
            diag.geminiParsedFields = Object.keys(fields)
            // Validate category
            const validCategories = ['election', 'referendum', 'community', 'corporate', 'other']
            if (fields.category && !validCategories.includes(fields.category)) {
              fields.category = 'other'
            }
            console.log('[import]', diag)
            return NextResponse.json({
              mode: 'ai',
              fields: {
                title: fields.title || bestTitle,
                location: fields.location || '',
                region: fields.region || '',
                event_date: fields.event_date || '',
                category: fields.category || 'other',
                description: fields.description || '',
                outcome: fields.outcome || '',
                lessons: fields.lessons || '',
              },
              diagnostics: diag,
            })
          } catch (err) {
            diag.geminiParseError = err instanceof Error ? err.message : String(err)
          }
        }
      }
      // If Gemini fails, fall through to manual mode
    } catch (err) {
      diag.geminiException = err instanceof Error ? err.message : String(err)
    }
  }

  // Manual-assist mode
  console.log('[import]', diag)
  return NextResponse.json({
    mode: 'manual',
    title: bestTitle,
    og_description: metadata.ogDescription,
    article_text: articleText.slice(0, 5000), // cap for response size
    diagnostics: diag,
  })
}
