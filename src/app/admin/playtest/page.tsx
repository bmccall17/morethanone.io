'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

interface PlaytestItem {
  id: string
  question: string
  context: string
  source: string
  is_resolved: boolean
  promoted_to_faq_id: string | null
  created_at: string
}

export default function PlaytestAdminPage() {
  const { fetcher } = useAdminAuth()
  const [items, setItems] = useState<PlaytestItem[]>([])
  const [creating, setCreating] = useState(false)
  const [newItem, setNewItem] = useState({ question: '', context: '', source: '' })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const res = await fetcher('/api/admin/playtest')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }, [fetcher])

  useEffect(() => { load() }, [load])

  async function create() {
    await fetcher('/api/admin/playtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    })
    setCreating(false)
    setNewItem({ question: '', context: '', source: '' })
    load()
  }

  async function toggleResolved(item: PlaytestItem) {
    await fetcher(`/api/admin/playtest/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_resolved: !item.is_resolved }),
    })
    load()
  }

  async function promoteToFaq(item: PlaytestItem) {
    // Create a new FAQ from this feedback
    const faqRes = await fetcher('/api/admin/faqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: item.question,
        answer: '',
        category: 'general',
      }),
    })

    if (faqRes.ok) {
      const faq = await faqRes.json()
      await fetcher(`/api/admin/playtest/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_resolved: true, promoted_to_faq_id: faq.id }),
      })
      load()
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this feedback?')) return
    await fetcher(`/api/admin/playtest/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) {
    return <main className="px-4 py-8"><p className="text-gray-500 text-center">Loading...</p></main>
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Playtest Feedback</h1>
          <Button onClick={() => setCreating(!creating)}>
            {creating ? 'Cancel' : 'Log Question'}
          </Button>
        </div>

        {creating && (
          <Card>
            <div className="space-y-3">
              <Input label="Question" value={newItem.question} onChange={e => setNewItem({ ...newItem, question: e.target.value })} placeholder="What did they ask?" />
              <Input label="Context" value={newItem.context} onChange={e => setNewItem({ ...newItem, context: e.target.value })} placeholder="When/where did this come up?" />
              <Input label="Source" value={newItem.source} onChange={e => setNewItem({ ...newItem, source: e.target.value })} placeholder="Who asked? (optional)" />
              <Button onClick={create}>Log</Button>
            </div>
          </Card>
        )}

        {items.map(item => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {item.is_resolved && <Badge variant="success">Resolved</Badge>}
                  {item.promoted_to_faq_id && <Badge variant="info">Promoted to FAQ</Badge>}
                </div>
                <p className="text-base font-medium text-gray-900">{item.question}</p>
                {item.context && <p className="text-sm text-gray-500 mt-1">{item.context}</p>}
                {item.source && <p className="text-xs text-gray-400 mt-1">Source: {item.source}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                {!item.promoted_to_faq_id && (
                  <Button size="sm" onClick={() => promoteToFaq(item)}>Promote to FAQ</Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => toggleResolved(item)}>
                  {item.is_resolved ? 'Reopen' : 'Resolve'}
                </Button>
                <Button size="sm" variant="secondary" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <p className="text-gray-400 text-center py-8">No playtest feedback logged yet.</p>
        )}
      </div>
    </main>
  )
}
