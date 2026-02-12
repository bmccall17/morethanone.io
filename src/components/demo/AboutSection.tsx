'use client'

import { useState, useEffect, useRef } from 'react'

interface Section {
  heading: string
  body: string
}

export default function AboutSection() {
  const [open, setOpen] = useState(false)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (!open || fetched.current) return
    fetched.current = true
    setLoading(true)
    fetch('/api/content/readme')
      .then(res => res.json())
      .then(data => setSections(data.sections || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open])

  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <span className="text-sm font-semibold text-gray-900">About morethanone</span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-5 sm:px-6 sm:pb-6 border-t border-gray-100">
          <div className="prose prose-sm prose-gray max-w-none mt-4 space-y-6">
            {loading ? (
              <p className="text-gray-400 text-sm">Loading...</p>
            ) : (
              sections.map((section, i) => (
                <div key={i}>
                  {section.heading && (
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{section.heading}</h3>
                  )}
                  <div className="space-y-3 text-gray-700 leading-relaxed text-sm">
                    {section.body.split('\n\n').map((para, j) => (
                      <p key={j}>{para}</p>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
