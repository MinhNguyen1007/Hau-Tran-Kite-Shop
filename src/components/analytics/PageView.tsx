'use client'

// Bắn logEvent('page_view') mỗi khi đổi route. Đặt trong layout để phủ mọi trang.
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { logEvent } from '@/lib/analytics'

export function PageView() {
  const pathname = usePathname()
  useEffect(() => {
    logEvent('page_view', { properties: { path: pathname } })
  }, [pathname])
  return null
}
