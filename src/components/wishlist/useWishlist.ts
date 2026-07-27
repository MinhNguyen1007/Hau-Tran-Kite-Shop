'use client'

// Hook đọc danh sách yêu thích. Không cần Provider bọc ở layout: store nằm ở module scope
// (src/lib/wishlist-store.ts) nên mọi component đọc chung một nguồn sẵn rồi.
import { useSyncExternalStore } from 'react'
import { hasItem, wishlistCount, type Wishlist } from '@/lib/wishlist'
import {
  add,
  getServerSnapshot,
  getSnapshot,
  remove,
  subscribe,
  toggle,
} from '@/lib/wishlist-store'

export type UseWishlist = {
  items: Wishlist
  count: number
  hydrated: boolean
  has: (productId: string) => boolean
  add: typeof add
  remove: typeof remove
  toggle: typeof toggle
}

export function useWishlist(): UseWishlist {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // count/has tính thẳng từ snapshot: danh sách vài chục dòng là cùng, rẻ hơn chi phí memo hoá.
  return {
    items: state.items,
    count: wishlistCount(state.items),
    hydrated: state.hydrated,
    has: (productId: string) => hasItem(state.items, productId),
    add,
    remove,
    toggle,
  }
}
