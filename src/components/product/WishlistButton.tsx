'use client'

// Nút "Yêu thích" — bật/tắt. Nhận sẵn dòng dữ liệu (dựng bằng toWishlistItem ở server
// component) chứ không tự query; store lo state + logEvent + đồng bộ DB.
//
// CỐ Ý không disable khi hết hàng, khác hẳn nút thêm giỏ ngày trước: diều làm thủ công, hết
// hàng chỉ nghĩa là chưa có sẵn. Khách ưng mẫu hết hàng rồi nhắn Zalo đặt làm là luồng chính
// của shop, chặn lại là chặn đúng đơn đáng giá nhất.
import { Heart } from '@phosphor-icons/react'
import { useWishlist } from '@/components/wishlist/useWishlist'
import type { WishlistItem } from '@/lib/wishlist'

export function WishlistButton({
  item,
  variant = 'card',
}: {
  item: Omit<WishlistItem, 'addedAt'>
  variant?: 'card' | 'detail'
}) {
  const { has, toggle, hydrated } = useWishlist()

  // Trước hydrate luôn là "chưa thích" — khớp với server snapshot (danh sách rỗng), không lệch markup.
  const liked = hydrated && has(item.productId)
  const size = variant === 'detail' ? 20 : 16

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={liked}
      className={`flex w-full items-center justify-center gap-2 rounded-full font-bold transition-colors active:scale-[0.98] ${
        variant === 'detail' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
      } ${
        liked
          ? 'border border-brand-600 bg-brand-50 text-brand-700 hover:bg-brand-100 dark:border-brand-400 dark:bg-ink-800 dark:text-brand-400 dark:hover:bg-ink-700'
          : 'bg-brand-600 text-white hover:bg-brand-700'
      }`}
    >
      <Heart size={size} weight={liked ? 'fill' : 'bold'} />
      {liked ? 'Đã thích' : 'Yêu thích'}
    </button>
  )
}
