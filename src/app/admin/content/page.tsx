'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ContentSection {
  id: string
  slug: string
  title: string
  body: string
  sort_order: number
  is_published: boolean
}

export default function ContentAdminPage() {
  const { fetcher } = useAdminAuth()
  const [sections, setSections] = useState<ContentSection[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<ContentSection>>({})
  const [creating, setCreating] = useState(false)
  const [newSection, setNewSection] = useState({ slug: '', title: '', body: '', sort_order: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetcher('/api/admin/content')
    if (res.ok) setSections(await res.json())
    setLoading(false)
  }, [fetcher])

  useEffect(() => { load() }, [load])

  async function save(id: string) {
    await fetcher(`/api/admin/content/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    })
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this section?')) return
    await fetcher(`/api/admin/content/${id}`, { method: 'DELETE' })
    load()
  }

  async function create() {
    await fetcher('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSection),
    })
    setCreating(false)
    setNewSection({ slug: '', title: '', body: '', sort_order: 0 })
    load()
  }

  async function togglePublish(s: ContentSection) {
    await fetcher(`/api/admin/content/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !s.is_published }),
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
          <h1 className="text-2xl font-bold text-gray-900">Content Sections</h1>
          <Button onClick={() => setCreating(!creating)}>
            {creating ? 'Cancel' : 'New Section'}
          </Button>
        </div>

        {creating && (
          <Card>
            <div className="space-y-3">
              <Input label="Slug" value={newSection.slug} onChange={e => setNewSection({ ...newSection, slug: e.target.value })} placeholder="e.g. intro" />
              <Input label="Title" value={newSection.title} onChange={e => setNewSection({ ...newSection, title: e.target.value })} placeholder="Section heading" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body (markdown)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[120px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newSection.body}
                  onChange={e => setNewSection({ ...newSection, body: e.target.value })}
                />
              </div>
              <Input label="Sort order" type="number" value={String(newSection.sort_order)} onChange={e => setNewSection({ ...newSection, sort_order: Number(e.target.value) })} />
              <Button onClick={create}>Create</Button>
            </div>
          </Card>
        )}

        {sections.map(s => (
          <Card key={s.id}>
            {editing === s.id ? (
              <div className="space-y-3">
                <Input label="Slug" value={draft.slug ?? s.slug} onChange={e => setDraft({ ...draft, slug: e.target.value })} />
                <Input label="Title" value={draft.title ?? s.title} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body (markdown)</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[120px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={draft.body ?? s.body}
                    onChange={e => setDraft({ ...draft, body: e.target.value })}
                  />
                </div>
                <Input label="Sort order" type="number" value={String(draft.sort_order ?? s.sort_order)} onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
                <div className="flex gap-2">
                  <Button onClick={() => save(s.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-400 font-mono">{s.slug} (order: {s.sort_order})</p>
                    <h3 className="text-lg font-semibold text-gray-900">{s.title || '(no title)'}</h3>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => togglePublish(s)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {s.is_published ? 'Published' : 'Draft'}
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => { setEditing(s.id); setDraft({}) }}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => remove(s.id)}>Delete</Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3 whitespace-pre-wrap">{s.body}</p>
              </div>
            )}
          </Card>
        ))}

        {sections.length === 0 && (
          <p className="text-gray-400 text-center py-8">No content sections yet. Create one or run the seed migration.</p>
        )}
      </div>
    </main>
  )
}
