'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import RelatedLinks from '@/components/ui/RelatedLinks'
import type { RelatedItem } from '@/lib/related-items'

interface RCVExample {
  id: string
  title: string
  location: string
  region: string
  event_date: string | null
  category: string
  content_types: string[]
  description: string
  outcome: string
  lessons: string
  source_urls: string[]
  related_items: RelatedItem[]
}

const CATEGORIES = ['all', 'election', 'referendum', 'community', 'corporate', 'other']
const CONTENT_TYPE_FILTERS = ['all types', 'example', 'resource', 'news']

export default function RCVWorldPage() {
  const [examples, setExamples] = useState<RCVExample[]>([])
  const [filter, setFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all types')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content/rcv-world')
      .then(res => res.json())
      .then(data => { setExamples(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filtered = examples.filter(e => {
    if (filter !== 'all' && e.category !== filter) return false
    if (typeFilter !== 'all types' && !(e.content_types || ['example']).includes(typeFilter)) return false
    return true
  })

  const categoryVariant = (cat: string) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      election: 'info', referendum: 'warning', community: 'success', corporate: 'default', other: 'default',
    }
    return map[cat] || 'default'
  }

  const contentTypeVariant = (ct: string) => {
    const map: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
      example: 'info', resource: 'success', news: 'warning',
    }
    return map[ct] || 'default'
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between text-sm">
          <Link href="/demo" className="text-gray-400 hover:text-gray-600 transition-colors">&larr; Demo</Link>
          <div className="flex gap-4">
            <Link href="/faq" className="text-indigo-600 hover:text-indigo-700 transition-colors">FAQ</Link>
            <Link href="/join" className="text-indigo-600 hover:text-indigo-700 transition-colors">Join a round</Link>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">RCV Around the World</h1>
          <p className="text-gray-500 mt-1">Real examples of ranked choice voting in action.</p>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                  filter === cat
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPE_FILTERS.map(ct => (
              <button
                key={ct}
                onClick={() => setTypeFilter(ct)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
                  typeFilter === ct
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {ct}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            {examples.length === 0
              ? 'No examples yet. Check back soon!'
              : 'No examples in this category.'}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map(ex => (
              <Card key={ex.id}>
                <button onClick={() => toggle(ex.id)} className="w-full text-left">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={categoryVariant(ex.category)}>{ex.category}</Badge>
                        {(ex.content_types || ['example']).map(ct => (
                          <Badge key={ct} variant={contentTypeVariant(ct)}>{ct}</Badge>
                        ))}
                        {ex.event_date && (
                          <span className="text-xs text-gray-400">
                            {new Date(ex.event_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{ex.title}</h3>
                      <p className="text-sm text-gray-500">{ex.location}{ex.region ? `, ${ex.region}` : ''}</p>
                    </div>
                    <span className="text-gray-400 shrink-0 ml-2 mt-1">
                      {expanded.has(ex.id) ? '−' : '+'}
                    </span>
                  </div>
                </button>

                {expanded.has(ex.id) && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
                    {ex.description && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.description}</p>
                      </div>
                    )}
                    {ex.outcome && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Outcome</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.outcome}</p>
                      </div>
                    )}
                    {ex.lessons && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Lessons</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{ex.lessons}</p>
                      </div>
                    )}
                    {ex.source_urls && ex.source_urls.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Sources</p>
                        <div className="space-y-1">
                          {ex.source_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-sm text-indigo-600 hover:text-indigo-800 truncate"
                            >
                              {url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    <RelatedLinks items={ex.related_items} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
