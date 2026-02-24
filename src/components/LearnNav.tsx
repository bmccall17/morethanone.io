'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/demo', label: 'Demo' },
  { href: '/faq', label: 'FAQ' },
  { href: '/rcv-world', label: 'RCV World' },
]

export default function LearnNav() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        {/* Row 1: Home link + Host/Join */}
        <div className="flex items-center justify-between py-2">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            &larr; morethanone
          </Link>
          <div className="flex gap-2">
            <Link
              href="/host/create"
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              Host
            </Link>
            <Link
              href="/join"
              className="px-3 py-1 rounded-md bg-white text-gray-700 border border-gray-300 text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              Join
            </Link>
          </div>
        </div>

        {/* Row 2: Tab links */}
        <div className="flex gap-1 pb-2">
          {tabs.map(tab => {
            const active = pathname === tab.href
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
