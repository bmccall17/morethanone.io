'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  sort_order: number
  is_published: boolean
}

export default function FAQsAdminPage() {
  const { fetcher } = useAdminAuth()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<FAQ>>({})
  const [creating, setCreating] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'general', sort_order: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetcher('/api/admin/faqs')
    if (res.ok) setFaqs(await res.json())
    setLoading(false)
  }, [fetcher])

  useEffect(() => { load() }, [load])

  async function save(id: string) {
    await fetcher(`/api/admin/faqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this FAQ?')) return
    await fetcher(`/api/admin/faqs/${id}`, { method: 'DELETE' })
    load()
  }

  async function create() {
    await fetcher('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newFaq),
    })
    setCreating(false)
    setNewFaq({ question: '', answer: '', category: 'general', sort_order: 0 })
    load()
  }

  async function togglePublish(f: FAQ) {
    await fetcher(`/api/admin/faqs/${f.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !f.is_published }),
    })
    load()
  }

  if (loading) {
    return <main className="px-4 py-8"><p className="text-gray-500 text-center">Loading...</p></main>
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <Button onClick={() => setCreating(!creating)}>
            {creating ? 'Cancel' : 'New FAQ'}
          </Button>
        </div>

        {creating && (
          <Card>
            <div className="space-y-3">
              <Input label="Question" value={newFaq.question} onChange={e => setNewFaq({ ...newFaq, question: e.target.value })} placeholder="What do people ask?" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer (markdown)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newFaq.answer}
                  onChange={e => setNewFaq({ ...newFaq, answer: e.target.value })}
                />
              </div>
              <Input label="Category" value={newFaq.category} onChange={e => setNewFaq({ ...newFaq, category: e.target.value })} />
              <Input label="Sort order" type="number" value={String(newFaq.sort_order)} onChange={e => setNewFaq({ ...newFaq, sort_order: Number(e.target.value) })} />
              <Button onClick={create}>Create</Button>
            </div>
          </Card>
        )}

        {faqs.map(f => (
          <Card key={f.id}>
            {editing === f.id ? (
              <div className="space-y-3">
                <Input label="Question" value={draft.question ?? f.question} onChange={e => setDraft({ ...draft, question: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Answer (markdown)</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={draft.answer ?? f.answer}
                    onChange={e => setDraft({ ...draft, answer: e.target.value })}
                  />
                </div>
                <Input label="Category" value={draft.category ?? f.category} onChange={e => setDraft({ ...draft, category: e.target.value })} />
                <Input label="Sort order" type="number" value={String(draft.sort_order ?? f.sort_order)} onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
                <div className="flex gap-2">
                  <Button onClick={() => save(f.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{f.question}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{f.answer}</p>
                    <p className="text-xs text-gray-400 mt-1">{f.category} &middot; order {f.sort_order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0 ml-4">
                    <button
                      onClick={() => togglePublish(f)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${f.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {f.is_published ? 'Published' : 'Draft'}
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => { setEditing(f.id); setDraft({}) }}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => remove(f.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}

        {faqs.length === 0 && (
          <p className="text-gray-400 text-center py-8">No FAQs yet. Create one or promote from playtest feedback.</p>
        )}
      </div>
    </main>
  )
}
