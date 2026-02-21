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
  // Try to isolate the main article content before stripping tags.
  // Priority: <article>, then <main>, then [role="main"], then fall back to <body> or full HTML.
  const articleBody = extractContentBlock(html)

  let text = articleBody

  // Remove script, style, nav, footer, aside, header, sidebar blocks that may be nested inside article
  text = text.replace(/<(script|style|nav|footer|aside|header|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')

  // Remove common sidebar/related-content patterns by class/id
  text = text.replace(/<(div|section|ul|ol)\b[^>]*(?:class|id)=["'][^"']*(?:sidebar|related|trending|popular|recommended|newsletter|social-share|comment|advertisement|ad-slot|promo)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi, ' ')

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

/**
 * Try to extract the main content block from full HTML.
 * Checks for <article>, <main>, [role="main"], then common content-class divs,
 * then falls back to <body>, then the full HTML.
 */
function extractContentBlock(html: string): string {
  // 1. <article> tag — most news sites wrap the story here
  const articleMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)
  if (articleMatch && articleMatch[1].length > 200) {
    return articleMatch[1]
  }

  // 2. <main> tag
  const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
  if (mainMatch && mainMatch[1].length > 200) {
    return mainMatch[1]
  }

  // 3. [role="main"]
  const roleMainMatch = html.match(/<\w+\b[^>]*role=["']main["'][^>]*>([\s\S]*?)<\/\w+>/i)
  if (roleMainMatch && roleMainMatch[1].length > 200) {
    return roleMainMatch[1]
  }

  // 4. Common content-class div patterns used by news sites / CMS platforms
  const contentPatterns = [
    /class=["'][^"']*(?:article-body|article-content|post-content|entry-content|story-body|story-content|page-content|content-body)[^"']*["']/i,
  ]
  for (const pattern of contentPatterns) {
    const classMatch = html.match(pattern)
    if (classMatch) {
      // Find the opening tag position
      const tagStart = html.lastIndexOf('<', classMatch.index!)
      const snippet = html.slice(tagStart)
      // Extract the tag name to find its closing tag
      const tagName = snippet.match(/^<(\w+)/)?.[1]
      if (tagName) {
        const innerMatch = snippet.match(new RegExp(`^<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'))
        if (innerMatch && innerMatch[1].length > 200) {
          return innerMatch[1]
        }
      }
    }
  }

  // 5. Fall back to <body>
  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch) {
    return bodyMatch[1]
  }

  return html
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
