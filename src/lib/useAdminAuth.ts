'use client'

import { useState, useCallback, useEffect } from 'react'

export function useAdminAuth() {
  const [token, setToken] = useState('')
  const [isAuthed, setIsAuthed] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('metrics_secret')
    if (stored) {
      setToken(stored)
      setIsAuthed(true)
    }
  }, [])

  const login = useCallback(async (secret: string) => {
    // Verify against metrics endpoint
    const res = await fetch('/api/admin/metrics', {
      headers: { Authorization: `Bearer ${secret}` },
    })
    if (res.ok) {
      sessionStorage.setItem('metrics_secret', secret)
      setToken(secret)
      setIsAuthed(true)
      return true
    }
    return false
  }, [])

  const fetcher = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const activeToken = token || sessionStorage.getItem('metrics_secret') || ''
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${activeToken}`,
        },
      })
    },
    [token]
  )

  return { isAuthed, token, login, fetcher }
}
