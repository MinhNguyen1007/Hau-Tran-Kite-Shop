// Card sản phẩm — Server Component (chỉ render). Nút yêu thích tách ra Client Component riêng.
// Giá format VND qua formatVnd; ảnh lấy path qua getProductImageUrl. Xem skill product-card.
import Image from 'next/image'
import Link from 'next/link'
import { formatVnd } from '@/lib/format'
import type { Product } from '@/lib/products'
import { getProductImageUrl } from '@/lib/storage'
import { toWishlistItem } from '@/lib/wishlist'
import { WishlistButton } from './WishlistButton'

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product
  priority?: boolean
}) {
  const soldOut = product.stock === 0
  const href = `/san-pham/${product.slug}`

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-900/10 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-700">
      <Link href={href} className="relative block aspect-square overflow-hidden">
        {product.imagePath ? (
          <Image
            src={getProductImageUrl(product.imagePath)}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 64vw, 240px"
            className={`object-cover ${soldOut ? 'opacity-60' : ''}`}
          />
        ) : (
          // Placeholder khi chưa có ảnh: nền cam nhạt + hình thoi (gợi con diều), thuần CSS.
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-ink-800 dark:to-ink-900 ${
              soldOut ? 'opacity-60' : ''
            }`}
          >
            <div
              className="h-14 w-14 rotate-45 rounded-md border-2 border-brand-300 dark:border-brand-700"
              aria-hidden
            />
          </div>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-ink-950/85 px-2.5 py-1 text-[11px] font-bold text-white">
            Hết hàng
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          href={href}
          className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 hover:text-brand-700 dark:text-stone-100 dark:hover:text-brand-400"
        >
          {product.name}
        </Link>
        <span className="mt-auto text-base font-extrabold text-brand-600 dark:text-brand-400">
          {formatVnd(product.priceVnd)}
        </span>
        <WishlistButton item={toWishlistItem(product)} />
      </div>
    </div>
  )
}
