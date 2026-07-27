'use client'

// Đảo client trong SiteHeader (server component): số trên badge nằm ở localStorage nên
// chỉ biết được sau khi hydrate.
import { Heart } from '@phosphor-icons/react'
import Link from 'next/link'
import { useWishlist } from './useWishlist'

export function WishlistBadge() {
  const { count, hydrated } = useWishlist()

  return (
    <Link
      href="/yeu-thich"
      className="relative flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-ink-800"
    >
      <span className="relative">
        <Heart size={22} />
        {/* Chưa hydrate thì chưa biết số — ẩn hẳn bong bóng thay vì hiện 0 rồi nhảy số. */}
        {hydrated && count > 0 && (
          <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
      <span className="hidden sm:inline">Yêu thích</span>
    </Link>
  )
}
