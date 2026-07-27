'use client'

// Bắn logEvent('product_view') khi mở trang chi tiết. Không render gì.
import { useEffect } from 'react'
import { logEvent } from '@/lib/analytics'

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    logEvent('product_view', { productId })
  }, [productId])
  return null
}
