/**
 * HTML processing utilities for article import.
 * Uses @mozilla/readability + linkedom for article extraction.
 */

import { Readability } from '@mozilla/readability'
import { parseHTML } from 'linkedom'

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
  // Try Readability extraction first
  try {
    const { document } = parseHTML(html)
    const reader = new Readability(document)
    const article = reader.parse()

    if (article?.textContent && article.textContent.trim().length > 100) {
      let text = article.textContent
      text = text.replace(/[ \t]+/g, ' ')
      text = text.replace(/\n\s*\n/g, '\n\n')
      text = text.trim()

      if (text.length > maxLength) {
        text = text.slice(0, maxLength) + '...'
      }
      return text
    }
  } catch {
    // Fall through to regex fallback
  }

  // Regex fallback — intentionally simple, just gives Gemini something to work with
  let text = html
  text = text.replace(/<(script|style|nav|footer|aside|header|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  text = text.replace(/<!--[\s\S]*?-->/g, ' ')
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br|blockquote|article|section)>/gi, '\n')
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<[^>]+>/g, ' ')
  text = decodeEntities(text)
  text = text.replace(/[ \t]+/g, ' ')
  text = text.replace(/\n\s*\n/g, '\n\n')
  text = text.trim()

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
