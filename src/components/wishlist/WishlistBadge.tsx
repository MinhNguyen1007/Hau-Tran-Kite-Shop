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
      aria-label="Danh sách yêu thích"
      className="relative grid h-9 w-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950"
    >
      <Heart size={18} weight="bold" />
      {/* Chưa hydrate thì chưa biết số — ẩn hẳn bong bóng thay vì hiện 0 rồi nhảy số. */}
      {hydrated && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  )
}
