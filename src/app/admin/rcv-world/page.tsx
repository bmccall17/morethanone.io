'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'

interface RCVExample {
  id: string
  title: string
  location: string
  region: string
  event_date: string | null
  category: string
  content_types: string[]
  status: string
  created_at: string
}

const CATEGORIES = ['election', 'referendum', 'community', 'corporate', 'other']
const CONTENT_TYPES = ['example', 'resource', 'news']

export default function RCVWorldAdminPage() {
  const { fetcher } = useAdminAuth()
  const [items, setItems] = useState<RCVExample[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterContentType, setFilterContentType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const load = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (filterCategory) params.set('category', filterCategory)
    if (filterContentType) params.set('content_type', filterContentType)
    if (filterStatus) params.set('status', filterStatus)

    const res = await fetcher(`/api/admin/rcv-world?${params}`)
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }, [fetcher, search, filterCategory, filterContentType, filterStatus])

  useEffect(() => { load() }, [load])

  async function remove(id: string) {
    if (!confirm('Delete this example?')) return
    await fetcher(`/api/admin/rcv-world/${id}`, { method: 'DELETE' })
    load()
  }

  async function toggleStatus(item: RCVExample) {
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    await fetcher(`/api/admin/rcv-world/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

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
    return <main className="px-4 py-8"><p className="text-gray-500 text-center">Loading...</p></main>
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">RCV World Examples</h1>
          <Link href="/admin/rcv-world/new">
            <Button>New Example</Button>
          </Link>
        </div>

        <Card>
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                label="Search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search title, location..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
              >
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={filterContentType}
                onChange={e => setFilterContentType(e.target.value)}
              >
                <option value="">All types</option>
                {CONTENT_TYPES.map(ct => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </Card>

        {items.map(item => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant={categoryVariant(item.category)}>{item.category}</Badge>
                  {(item.content_types || ['example']).map(ct => (
                    <Badge key={ct} variant={contentTypeVariant(ct)}>{ct}</Badge>
                  ))}
                  <Badge variant={item.status === 'published' ? 'success' : 'default'}>{item.status}</Badge>
                </div>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.location}{item.region ? `, ${item.region}` : ''}</p>
                {item.event_date && (
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.event_date).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Button size="sm" variant="secondary" onClick={() => toggleStatus(item)}>
                  {item.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Link href={`/admin/rcv-world/${item.id}`}>
                  <Button size="sm" variant="secondary">Edit</Button>
                </Link>
                <Button size="sm" variant="secondary" onClick={() => remove(item.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}

        {items.length === 0 && (
          <p className="text-gray-400 text-center py-8">No RCV world examples yet.</p>
        )}
      </div>
    </main>
  )
}
