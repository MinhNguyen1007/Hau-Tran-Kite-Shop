'use client'

// Khối chốt đơn ở trang chi tiết: chọn cỡ → yêu thích → nhắn Zalo/gọi.
//
// Cỡ đang chọn đi kèm vào event contact_click. Đó là thứ shop cần biết nhất khi khách nhắn
// tới ("khách hỏi con 5 mét"), và web không có giỏ hàng nên đây là chỗ duy nhất bắt được ý định đó.
import { ChatCircleDots } from '@phosphor-icons/react'
import { useState } from 'react'
import { ContactCta } from '@/components/contact/ContactCta'
import { formatVnd } from '@/lib/format'
import type { ProductSize } from '@/lib/product-shared'
import type { WishlistItem } from '@/lib/wishlist'
import { WishlistButton } from './WishlistButton'

export function ProductOrderPanel({
  productId,
  sizes,
  wishlistItem,
  hotline,
  zaloPhone,
}: {
  productId: string
  sizes: ProductSize[]
  wishlistItem: Omit<WishlistItem, 'addedAt'>
  hotline: string
  zaloPhone: string
}) {
  // Mặc định chọn cỡ nhỏ nhất — mức khách hay hỏi trước, và để chuỗi giá không trống.
  const [selectedId, setSelectedId] = useState(sizes[0]?.id ?? '')
  const selected = sizes.find((size) => size.id === selectedId)

  return (
    <div className="flex flex-col gap-5">
      {sizes.length > 0 && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-bold text-ink-900 dark:text-stone-100">
            Chọn sải cánh
          </legend>

          {sizes.map((size) => {
            const active = size.id === selectedId
            return (
              <label
                key={size.id}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3 transition-colors ${
                  active
                    ? 'border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-ink-800'
                    : 'border-stone-200 hover:border-brand-300 dark:border-ink-700 dark:hover:border-brand-700'
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="product-size"
                    value={size.id}
                    checked={active}
                    onChange={() => setSelectedId(size.id)}
                    className="h-4 w-4 accent-brand-600"
                  />
                  <span className="text-sm font-semibold text-ink-900 dark:text-stone-100">
                    {size.label}
                  </span>
                </span>
                <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                  {formatVnd(size.priceVnd)}
                </span>
              </label>
            )
          })}

          <p className="mt-1 flex items-start gap-2 text-sm text-stone-600 dark:text-stone-400">
            <ChatCircleDots
              size={18}
              weight="bold"
              className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400"
            />
            Cần cỡ lớn hơn? Nhắn Zalo cho shop, xưởng nhận đặt riêng theo sải cánh và hoạ tiết.
          </p>
        </fieldset>
      )}

      <div className="max-w-xs">
        <WishlistButton item={wishlistItem} variant="detail" />
      </div>

      <ContactCta
        hotline={hotline}
        zaloPhone={zaloPhone}
        productId={productId}
        source="product_detail"
        properties={selected ? { size: selected.label } : undefined}
      />
    </div>
  )
}
