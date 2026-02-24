import Link from 'next/link'
import type { RelatedItem } from '@/lib/related-items'

function itemHref(item: RelatedItem): string | null {
  switch (item.type) {
    case 'round': return `/results/${item.id}`
    case 'faq': return '/faq'
    case 'rcv_world': return '/rcv-world'
    case 'content_section': return '/demo'
    case 'demo': return `/demo?scenario=${item.id}`
    case 'template': return null
  }
}

const TYPE_LABELS: Record<string, string> = {
  round: 'Round',
  faq: 'FAQ',
  rcv_world: 'RCV World',
  template: 'Template',
  content_section: 'About',
  demo: 'Demo',
}

export default function RelatedLinks({ items }: { items: RelatedItem[] }) {
  if (!items || items.length === 0) return null

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Related</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => {
          const href = itemHref(item)
          const badge = (
            <span className="inline-flex items-center gap-1 text-xs">
              <span className="text-gray-400">{TYPE_LABELS[item.type] || item.type}:</span>
              <span>{item.label}</span>
            </span>
          )
          if (href) {
            return (
              <Link
                key={`${item.type}-${item.id}`}
                href={href}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
              >
                {badge}
              </Link>
            )
          }
          return (
            <span
              key={`${item.type}-${item.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600"
            >
              {badge}
            </span>
          )
        })}
      </div>
    </div>
  )
}
