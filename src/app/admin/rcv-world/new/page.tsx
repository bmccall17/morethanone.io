'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const CATEGORIES = ['election', 'referendum', 'community', 'corporate', 'other']

type ImportResult =
  | { mode: 'ai'; fields: Record<string, string>; diagnostics?: Record<string, unknown> }
  | { mode: 'manual'; title: string; og_description: string; article_text: string; diagnostics?: Record<string, unknown> }

export default function NewRCVWorldPage() {
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
    status: 'draft' as string,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Import state
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importBanner, setImportBanner] = useState('')
  const [articleText, setArticleText] = useState('')
  const [showArticleText, setShowArticleText] = useState(false)
  const [importDiag, setImportDiag] = useState<Record<string, unknown> | null>(null)

  async function handleImport() {
    if (!importUrl.trim()) { setImportError('Enter a URL'); return }
    setImporting(true)
    setImportError('')
    setImportBanner('')
    setArticleText('')

    try {
      const res = await fetcher('/api/admin/rcv-world/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        setImportError(data.error || 'Import failed')
        setImporting(false)
        return
      }

      const data: ImportResult = await res.json()
      console.log('[import result]', data)
      setImportDiag(data.diagnostics || null)

      // Auto-append source URL
      const existingUrls = form.source_urls_text.trim()
      const newSourceUrls = existingUrls
        ? existingUrls + '\n' + importUrl.trim()
        : importUrl.trim()

      if (data.mode === 'ai') {
        setForm(prev => ({
          ...prev,
          title: data.fields.title || prev.title,
          location: data.fields.location || prev.location,
          region: data.fields.region || prev.region,
          event_date: data.fields.event_date || prev.event_date,
          category: data.fields.category || prev.category,
          description: data.fields.description || prev.description,
          outcome: data.fields.outcome || prev.outcome,
          lessons: data.fields.lessons || prev.lessons,
          source_urls_text: newSourceUrls,
        }))
        setImportBanner('ai')
      } else {
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          source_urls_text: newSourceUrls,
        }))
        if (data.article_text) {
          setArticleText(data.article_text)
          setShowArticleText(true)
        }
        setImportBanner('manual')
      }
    } catch {
      setImportError('Network error — could not reach import endpoint')
    }

    setImporting(false)
  }

  async function handleCreate() {
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')

    const source_urls = form.source_urls_text
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    const res = await fetcher('/api/admin/rcv-world', {
      method: 'POST',
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
      setError(data.error || 'Failed to create')
    }
    setLoading(false)
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [key]: e.target.value })

  return (
    <main className="px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">New RCV World Example</h1>

        {/* Import from Article */}
        <Card>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Import from Article</h2>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="https://example.com/rcv-article"
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleImport()}
                />
              </div>
              <Button onClick={handleImport} loading={importing} size="md">
                Fetch &amp; Extract
              </Button>
            </div>
            {importError && <p className="text-sm text-red-600">{importError}</p>}
            {importBanner === 'ai' && (
              <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-800">
                Fields pre-filled from article. Review and edit before saving.
              </div>
            )}
            {importBanner === 'manual' && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                Title auto-filled. Article text available below for manual reference.
              </div>
            )}
            {importDiag && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700 font-medium">Debug info</summary>
                <pre className="mt-2 p-3 rounded-lg bg-gray-100 border border-gray-200 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {JSON.stringify(importDiag, null, 2)}
                </pre>
              </details>
            )}
            {articleText && (
              <div>
                <button
                  type="button"
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  onClick={() => setShowArticleText(!showArticleText)}
                >
                  {showArticleText ? 'Hide' : 'Show'} article text
                </button>
                {showArticleText && (
                  <textarea
                    readOnly
                    className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 min-h-[200px] max-h-[400px] overflow-y-auto"
                    value={articleText}
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <Input label="Title" value={form.title} onChange={set('title')} placeholder="e.g. NYC Mayoral Primary 2021" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Location" value={form.location} onChange={set('location')} placeholder="e.g. New York City" />
              <Input label="Region" value={form.region} onChange={set('region')} placeholder="e.g. United States" />
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
                placeholder="What happened? Context about this use of RCV."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[80px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.outcome}
                onChange={set('outcome')}
                placeholder="What was the result?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lessons</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[80px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.lessons}
                onChange={set('lessons')}
                placeholder="What can we learn from this?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source URLs (one per line)</label>
              <textarea
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 text-sm min-h-[60px] focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={form.source_urls_text}
                onChange={set('source_urls_text')}
                placeholder="https://example.com/article"
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
          <Button size="lg" className="flex-1" onClick={handleCreate} loading={loading}>
            Create Example
          </Button>
          <Button size="lg" variant="secondary" onClick={() => router.push('/admin/rcv-world')}>
            Cancel
          </Button>
        </div>
      </div>
    </main>
  )
}
