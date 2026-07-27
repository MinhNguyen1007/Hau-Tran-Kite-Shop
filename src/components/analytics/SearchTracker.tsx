'use client'

// Bắn logEvent('search') tại TRANG KẾT QUẢ — chỉ ở đây mới biết resultCount.
// Ô nhập trên header chỉ điều hướng, không log.
import { useEffect } from 'react'
import { logEvent } from '@/lib/analytics'

export function SearchTracker({ query, resultCount }: { query: string; resultCount: number }) {
  useEffect(() => {
    logEvent('search', { properties: { query, resultCount } })
  }, [query, resultCount])
  return null
}
