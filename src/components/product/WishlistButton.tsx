'use client'

// Nút "Yêu thích" — bật/tắt. Nhận sẵn dòng dữ liệu (dựng bằng toWishlistItem ở server
// component) chứ không tự query; store lo state + logEvent + đồng bộ DB.
//
// CỐ Ý không disable khi hết hàng, khác hẳn nút thêm giỏ ngày trước: diều làm thủ công, hết
// hàng chỉ nghĩa là chưa có sẵn. Khách ưng mẫu hết hàng rồi nhắn Zalo đặt làm là luồng chính
// của shop, chặn lại là chặn đúng đơn đáng giá nhất.
//
// Ba dáng: 'icon' (tim tròn ở góc card sản phẩm, theo mẫu 2026-07-28), 'card' và 'detail'
// (nút dài có chữ, dùng ở trang chi tiết và danh sách yêu thích).
import { Heart } from '@phosphor-icons/react'
import { useWishlist } from '@/components/wishlist/useWishlist'
import type { WishlistItem } from '@/lib/wishlist'

export function WishlistButton({
  item,
  variant = 'card',
}: {
  item: Omit<WishlistItem, 'addedAt'>
  variant?: 'icon' | 'card' | 'detail'
}) {
  const { has, toggle, hydrated } = useWishlist()

  // Trước hydrate luôn là "chưa thích" — khớp với server snapshot (danh sách rỗng), không lệch markup.
  const liked = hydrated && has(item.productId)

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        aria-pressed={liked}
        aria-label={liked ? `Bỏ thích ${item.name}` : `Yêu thích ${item.name}`}
        title={liked ? 'Bỏ thích' : 'Yêu thích'}
        className={`grid h-8 w-8 place-items-center rounded-full border transition-colors active:scale-95 ${
          liked
            ? 'border-brand-600 bg-brand-600 text-white'
            : 'border-stone-200 bg-white/90 text-stone-500 backdrop-blur-sm hover:border-stone-300 hover:text-ink-950'
        }`}
      >
        <Heart size={15} weight={liked ? 'fill' : 'bold'} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={liked}
      className={`flex w-full items-center justify-center gap-2 rounded-full font-semibold transition-colors active:scale-[0.98] ${
        variant === 'detail' ? 'px-5 py-3 text-base' : 'px-4 py-2 text-sm'
      } ${
        liked
          ? 'border border-stone-300 bg-white text-ink-950 hover:bg-stone-50'
          : 'bg-ink-950 text-white hover:bg-ink-800'
      }`}
    >
      <Heart size={variant === 'detail' ? 20 : 16} weight={liked ? 'fill' : 'bold'} />
      {liked ? 'Đã thích' : 'Yêu thích'}
    </button>
  )
}
