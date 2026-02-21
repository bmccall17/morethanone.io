'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/lib/useAdminAuth'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

const NAV_ITEMS = [
  { href: '/admin/metrics', label: 'Metrics' },
  { href: '/admin/content', label: 'Content' },
  { href: '/admin/templates', label: 'Templates' },
  { href: '/admin/faqs', label: 'FAQs' },
  { href: '/admin/playtest', label: 'Playtest' },
  { href: '/admin/rcv-world', label: 'RCV World' },
  { href: '/admin/keepalive', label: 'Keepalive' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { isAuthed, login } = useAdminAuth()
  const [secret, setSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Metrics page has its own auth flow, let it through
  if (pathname === '/admin/metrics') {
    return <>{children}</>
  }

  if (!isAuthed) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
            <p className="text-gray-500 mt-1">Enter the admin secret to continue.</p>
          </div>
          <Card>
            <div className="space-y-4">
              <Input
                label="Secret token"
                type="password"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                placeholder="Enter METRICS_SECRET"
              />
            </div>
          </Card>
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}
          <Button
            size="lg"
            className="w-full"
            loading={loading}
            onClick={async () => {
              if (!secret) { setError('Enter a secret token'); return }
              setLoading(true)
              setError('')
              const ok = await login(secret)
              if (!ok) setError('Invalid secret')
              setLoading(false)
            }}
          >
            Sign In
          </Button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">
          <span className="text-sm font-semibold text-gray-900 mr-3 shrink-0">Admin</span>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-full text-sm font-medium shrink-0 transition-colors ${
                pathname.startsWith(item.href)
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}
