'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import RelatedLinks from '@/components/ui/RelatedLinks'
import type { RelatedItem } from '@/lib/related-items'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  related_items: RelatedItem[]
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content/faqs')
      .then(res => res.json())
      .then(data => { setFaqs(data); setLoading(false) })
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

  // Group by category
  const categories = [...new Set(faqs.map(f => f.category))]

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    )
  }

  if (faqs.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>
          <p className="text-gray-500 mt-4">No FAQs yet. Check back soon!</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h1>

        {categories.map(category => (
          <div key={category}>
            {categories.length > 1 && (
              <h2 className="text-lg font-semibold text-gray-700 mb-3 capitalize">{category}</h2>
            )}
            <div className="space-y-2">
              {faqs
                .filter(f => f.category === category)
                .map(f => (
                  <Card key={f.id}>
                    <button
                      onClick={() => toggle(f.id)}
                      className="w-full text-left flex items-start justify-between"
                    >
                      <span className="text-base font-medium text-gray-900 pr-4">{f.question}</span>
                      <span className="text-gray-400 shrink-0 mt-0.5">
                        {expanded.has(f.id) ? '−' : '+'}
                      </span>
                    </button>
                    {expanded.has(f.id) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {f.answer}
                        </div>
                        <RelatedLinks items={f.related_items} />
                      </div>
                    )}
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
