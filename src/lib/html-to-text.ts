/**
 * HTML processing utilities for article import.
 * Pure regex — no dependencies.
 */

export interface ArticleMetadata {
  title: string
  ogTitle: string
  ogDescription: string
}

export function extractMetadata(html: string): ArticleMetadata {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
  const ogTitle =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1] ||
    ''
  const ogDescription =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1] ||
    ''

  return { title: decodeEntities(title), ogTitle: decodeEntities(ogTitle), ogDescription: decodeEntities(ogDescription) }
}

export function htmlToText(html: string, maxLength = 8000): string {
  let text = html

  // Remove script, style, nav, footer, aside, header blocks
  text = text.replace(/<(script|style|nav|footer|aside|header|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, ' ')

  // Replace block-level tags with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|blockquote|article|section)>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, ' ')

  // Decode HTML entities
  text = decodeEntities(text)

  // Collapse whitespace
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  text = text.trim()

  // Truncate
  if (text.length > maxLength) {
    text = text.slice(0, maxLength) + '...'
  }

  return text
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
}
