// Card sản phẩm — Server Component (chỉ render). Nút yêu thích tách ra Client Component riêng.
// Giá là chữ tự do, đọc qua visiblePrice; ảnh lấy path qua getProductImageUrl. Xem skill product-card.
//
// Bố cục theo mẫu 2026-07-28: tim tròn ở góc trên phải, ảnh chiếm phần lớn card, dưới cùng là
// nhãn danh mục cỡ nhỏ rồi hàng "tên trái - giá phải".
//
// KHÔNG có trạng thái hết hàng (bỏ tồn kho 2026-07-27): diều làm thủ công theo đơn,
// mẫu nào cũng đặt được. Cũng KHÔNG có sao đánh giá hay % giảm giá như mẫu gốc: shop không
// có dữ liệu đó, bịa ra là social proof giả.
import Image from 'next/image'
import Link from 'next/link'
import { visiblePrice } from '@/lib/product-shared'
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
  const href = `/san-pham/${product.slug}`
  const price = visiblePrice(product)

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-900/5">
      {/* Nằm ngoài thẻ Link bọc ảnh: lồng button trong link là HTML không hợp lệ và bấm tim
          sẽ điều hướng luôn sang trang chi tiết. */}
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton item={toWishlistItem(product)} variant="icon" />
      </div>

      <Link href={href} className="relative block aspect-square overflow-hidden bg-stone-50">
        {product.imagePath ? (
          <Image
            src={getProductImageUrl(product.imagePath)}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Placeholder khi chưa có ảnh: hình thoi gợi con diều, thuần CSS.
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="h-16 w-16 rotate-45 rounded-md border-2 border-stone-300"
              aria-hidden
            />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col justify-end p-4">
        {product.categoryName && (
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-stone-400">
            {product.categoryName}
          </p>
        )}

        <div className="mt-1.5 flex items-baseline justify-between gap-3">
          <Link
            href={href}
            className="line-clamp-2 text-sm font-semibold leading-snug text-ink-950 transition-colors hover:text-stone-600"
          >
            {product.name}
          </Link>

          {/* Shop có thể không công khai giá. Khi đó mời khách hỏi thay vì để chỗ trống. */}
          <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-ink-950">
            {price ?? <span className="text-xs font-medium text-stone-500">Liên hệ</span>}
          </span>
        </div>
      </div>
    </div>
  )
}
