'use client'

// Nội dung trang /yeu-thich. Danh sách nằm ở localStorage (+ đồng bộ DB khi đã đăng nhập) nên
// đây bắt buộc là client component; page.tsx bên ngoài vẫn là server component (lo metadata).
import { ArrowLeft, Heart, Trash } from '@phosphor-icons/react'
import Image from 'next/image'
import Link from 'next/link'
import { ContactCta } from '@/components/contact/ContactCta'
import { useWishlist } from '@/components/wishlist/useWishlist'
import { ZaloProductButton } from '@/components/wishlist/ZaloProductButton'
import { getProductImageUrl } from '@/lib/storage'
import type { WishlistItem } from '@/lib/wishlist'

export function WishlistView({ hotline, zaloPhone }: { hotline: string; zaloPhone: string }) {
  const { items, count, hydrated, remove } = useWishlist()

  if (!hydrated) return <WishlistSkeleton />
  if (items.length === 0) return <EmptyWishlist />

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {items.map((item) => (
          <WishlistLine
            key={item.productId}
            item={item}
            zaloPhone={zaloPhone}
            onRemove={() => remove(item.productId)}
          />
        ))}
      </ul>

      <aside className="rounded-xl border border-stone-200 bg-white p-5 lg:sticky lg:top-16">
        <h2 className="text-base font-extrabold text-ink-900">Đặt diều</h2>

        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Bạn đang thích <strong className="font-bold text-ink-900">{count} mẫu</strong>.
          Nhắn Zalo hoặc gọi cho shop, đọc tên mẫu để được tư vấn kích thước, sáo và giá giao tận nơi.
        </p>

        {/* Không có nút "đặt hàng" trên web: shop chốt đơn trực tiếp để tránh đơn ảo. */}
        <ContactCta
          hotline={hotline}
          zaloPhone={zaloPhone}
          source="wishlist"
          stacked
          className="mt-5"
        />

        <Link
          href="/san-pham"
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink-950 hover:underline"
        >
          <ArrowLeft size={16} weight="bold" />
          Xem thêm diều
        </Link>
      </aside>
    </div>
  )
}

function WishlistLine({
  item,
  zaloPhone,
  onRemove,
}: {
  item: WishlistItem
  zaloPhone: string
  onRemove: () => void
}) {
  const href = `/san-pham/${item.slug}`

  return (
    <li className="flex gap-4 p-4">
      <Link
        href={href}
        className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-24"
      >
        {item.imagePath ? (
          <Image
            src={getProductImageUrl(item.imagePath)}
            alt={item.name}
            fill
            sizes="96px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-stone-100">
            <div
              className="h-8 w-8 rotate-45 rounded border-2 border-stone-300"
              aria-hidden
            />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={href}
            className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 hover:text-ink-950"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Bỏ ${item.name} khỏi danh sách yêu thích`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink-950"
          >
            <Trash size={18} />
          </button>
        </div>

        {/* Rỗng = shop không công khai giá mẫu này. Bỏ trống chỗ đó thay vì hiện "0 ₫". */}
        {item.priceText && (
          <span className="text-sm font-semibold text-ink-950">{item.priceText}</span>
        )}

        {/* Hỏi thẳng về đúng mẫu này, khỏi phải quay lên nút chung rồi tự gõ lại tên. */}
        <ZaloProductButton
          zaloPhone={zaloPhone}
          productId={item.productId}
          productName={item.name}
        />
      </div>
    </li>
  )
}

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-stone-100 text-stone-600">
        <Heart size={26} weight="bold" />
      </span>
      <p className="text-base font-bold text-ink-900">Chưa có mẫu diều nào</p>
      <p className="max-w-sm text-sm text-stone-600">
        Bấm trái tim ở mẫu diều bạn ưng, danh sách sẽ được giữ lại ở đây để tiện hỏi shop.
      </p>
      <Link
        href="/san-pham"
        className="mt-1 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
      >
        Xem diều
      </Link>
    </div>
  )
}

// Khung xám đúng hình dạng dòng thật, tránh nháy "chưa thích gì" trong lúc đọc localStorage.
function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <div className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {[0, 1].map((row) => (
          <div key={row} className="flex animate-pulse gap-4 p-4">
            <div className="h-20 w-20 shrink-0 rounded-lg bg-stone-200 sm:h-24 sm:w-24" />
            <div className="flex flex-1 flex-col gap-3 py-1">
              <div className="h-4 w-2/3 rounded bg-stone-200" />
              <div className="h-4 w-24 rounded bg-stone-200" />
            </div>
          </div>
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-xl border border-stone-200 bg-white" />
    </div>
  )
}
