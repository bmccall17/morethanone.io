'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const CATEGORIES = ['election', 'referendum', 'community', 'corporate', 'other']

interface RCVExample {
  id: string
  title: string
  location: string
  region: string
  event_date: string | null
  category: string
  description: string
  outcome: string
  lessons: string
  source_urls: string[]
  status: string
}

export default function EditRCVWorldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { fetcher } = useAdminAuth()
  const [form, setForm] = useState({
    title: '',
    location: '',
    region: '',
    event_date: '',
    category: 'other',
    description: '',
    outcome: '',
    lessons: '',
    source_urls_text: '',
    status: 'draft',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetcher(`/api/admin/rcv-world/${id}`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then((data: RCVExample) => {
        setForm({
          title: data.title,
          location: data.location,
          region: data.region,
          event_date: data.event_date || '',
          category: data.category,
          description: data.description,
          outcome: data.outcome,
          lessons: data.lessons,
          source_urls_text: (data.source_urls || []).join('\n'),
          status: data.status,
        })
        setLoading(false)
      })
      .catch(() => { setError('Failed to load'); setLoading(false) })
  }, [id, fetcher])

  async function handleSave() {
    setSaving(true)
    setError('')

    const source_urls = form.source_urls_text
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    const res = await fetcher(`/api/admin/rcv-world/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        location: form.location,
        region: form.region,
        event_date: form.event_date || null,
        category: form.category,
        description: form.description,
        outcome: form.outcome,
        lessons: form.lessons,
        source_urls,
        status: form.status,
      }),
    })

    if (res.ok) {
      router.push('/admin/rcv-world')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    }
    setSaving(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value })

  if (loading) {
    return <main className="px-4 py-8"><p className="text-gray-500 text-center">Loading...</p></main>
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit RCV World Example</h1>

        <Card>
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={set('title')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" value={form.location} onChange={set('location')} />
              <Input label="Region" value={form.region} onChange={set('region')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Event date" type="date" value={form.event_date} onChange={set('event_date')} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={form.category}
                  onChange={set('category')}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[100px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.description}
                onChange={set('description')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[80px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.outcome}
                onChange={set('outcome')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lessons</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[80px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.lessons}
                onChange={set('lessons')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source URLs (one per line)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[60px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.source_urls_text}
                onChange={set('source_urls_text')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.status}
                onChange={set('status')}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </Card>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}

        <div className="flex gap-3">
          <Button size="lg" className="flex-1" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
          <Button size="lg" variant="secondary" onClick={() => router.push('/admin/rcv-world')}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
