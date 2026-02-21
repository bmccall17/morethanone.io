'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Template {
  id: string
  name: string
  prompt: string
  options: string[]
  category: string
  is_active: boolean
  sort_order: number
}

export default function TemplatesAdminPage() {
  const { fetcher } = useAdminAuth()
  const [templates, setTemplates] = useState<Template[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Template>>({})
  const [creating, setCreating] = useState(false)
  const [newTpl, setNewTpl] = useState({ name: '', prompt: '', options: '' as string, category: 'general', sort_order: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetcher('/api/admin/templates')
    if (res.ok) setTemplates(await res.json())
    setLoading(false)
  }, [fetcher])

  useEffect(() => { load() }, [load])

  async function save(id: string) {
    const payload: Record<string, unknown> = { ...draft }
    if (typeof draft.options === 'string') {
      payload.options = (draft.options as string).split('\n').map(s => s.trim()).filter(Boolean)
    }
    await fetcher(`/api/admin/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this template?')) return
    await fetcher(`/api/admin/templates/${id}`, { method: 'DELETE' })
    load()
  }

  async function create() {
    const options = newTpl.options.split('\n').map(s => s.trim()).filter(Boolean)
    await fetcher('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newTpl, options }),
    })
    setCreating(false)
    setNewTpl({ name: '', prompt: '', options: '', category: 'general', sort_order: 0 })
    load()
  }

  async function toggleActive(t: Template) {
    await fetcher(`/api/admin/templates/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !t.is_active }),
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
          <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
          <Button onClick={() => setCreating(!creating)}>
            {creating ? 'Cancel' : 'New Template'}
          </Button>
        </div>

        {creating && (
          <Card>
            <div className="space-y-3">
              <Input label="Name" value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} placeholder="e.g. Games You Love" />
              <Input label="Prompt" value={newTpl.prompt} onChange={e => setNewTpl({ ...newTpl, prompt: e.target.value })} placeholder="What question to ask" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={newTpl.options}
                  onChange={e => setNewTpl({ ...newTpl, options: e.target.value })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
              </div>
              <Input label="Category" value={newTpl.category} onChange={e => setNewTpl({ ...newTpl, category: e.target.value })} />
              <Input label="Sort order" type="number" value={String(newTpl.sort_order)} onChange={e => setNewTpl({ ...newTpl, sort_order: Number(e.target.value) })} />
              <Button onClick={create}>Create</Button>
            </div>
          </Card>
        )}

        {templates.map(t => (
          <Card key={t.id}>
            {editing === t.id ? (
              <div className="space-y-3">
                <Input label="Name" value={(draft.name ?? t.name)} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                <Input label="Prompt" value={(draft.prompt ?? t.prompt)} onChange={e => setDraft({ ...draft, prompt: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options (one per line)</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    value={typeof draft.options === 'string' ? draft.options : (draft.options ?? t.options).join('\n')}
                    onChange={e => setDraft({ ...draft, options: e.target.value as unknown as string[] })}
                  />
                </div>
                <Input label="Category" value={(draft.category ?? t.category)} onChange={e => setDraft({ ...draft, category: e.target.value })} />
                <Input label="Sort order" type="number" value={String(draft.sort_order ?? t.sort_order)} onChange={e => setDraft({ ...draft, sort_order: Number(e.target.value) })} />
                <div className="flex gap-2">
                  <Button onClick={() => save(t.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t.name}</h3>
                    <p className="text-sm text-gray-500">{t.prompt}</p>
                    <p className="text-xs text-gray-400 mt-1">{(t.options || []).length} options &middot; {t.category} &middot; order {t.sort_order}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => toggleActive(t)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${t.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {t.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <Button size="sm" variant="secondary" onClick={() => { setEditing(t.id); setDraft({}) }}>Edit</Button>
                    <Button size="sm" variant="secondary" onClick={() => remove(t.id)}>Delete</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}

        {templates.length === 0 && (
          <p className="text-gray-400 text-center py-8">No templates yet. Create one or run the seed migration.</p>
        )}
      </div>
    </main>
  )
}
