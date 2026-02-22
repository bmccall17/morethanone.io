'use client'

import { useState, useEffect, useRef } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import type { RelatedItem, RelatedItemType } from '@/lib/related-items'

const TYPE_OPTIONS: { value: RelatedItemType; label: string }[] = [
  { value: 'round', label: 'Round' },
  { value: 'faq', label: 'FAQ' },
  { value: 'rcv_world', label: 'RCV World' },
  { value: 'template', label: 'Template' },
  { value: 'content_section', label: 'Content Section' },
]

const TYPE_LABELS: Record<string, string> = {
  round: 'Round',
  faq: 'FAQ',
  rcv_world: 'RCV World',
  template: 'Template',
  content_section: 'Content',
}

interface Props {
  items: RelatedItem[]
  onChange: (items: RelatedItem[]) => void
}

export default function RelatedItemsPicker({ items, onChange }: Props) {
  const { fetcher } = useAdminAuth()
  const [adding, setAdding] = useState(false)
  const [type, setType] = useState<RelatedItemType>('round')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ id: string; label: string }[]>([])
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (!adding) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const params = new URLSearchParams({ type, q: query })
        const res = await fetcher(`/api/admin/content-search?${params}`)
        if (res.ok) setResults(await res.json())
      } catch { /* ignore */ }
      setSearching(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [type, query, adding, fetcher])

  function addItem(result: { id: string; label: string }) {
    if (items.some(i => i.type === type && i.id === result.id)) return
    onChange([...items, { type, id: result.id, label: result.label }])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Related Items</label>

      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={`${item.type}-${item.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              <span className="text-indigo-400">{TYPE_LABELS[item.type] || item.type}</span>
              <span className="truncate max-w-[200px]">{item.label}</span>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="text-indigo-400 hover:text-indigo-700 ml-0.5"
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}

      {adding ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={type}
              onChange={e => { setType(e.target.value as RelatedItemType); setQuery(''); setResults([]) }}
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {TYPE_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Cancel
            </button>
          </div>
          <div className="max-h-[180px] overflow-y-auto">
            {searching && <p className="text-xs text-gray-400 py-1">Searching...</p>}
            {!searching && results.length === 0 && <p className="text-xs text-gray-400 py-1">No results</p>}
            {results.map(r => {
              const alreadyAdded = items.some(i => i.type === type && i.id === r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={alreadyAdded}
                  onClick={() => addItem(r)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                    alreadyAdded
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                >
                  {r.label}
                  {alreadyAdded && <span className="text-xs ml-2">(added)</span>}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          + Add related item
        </button>
      )}
    </div>
  )
}
