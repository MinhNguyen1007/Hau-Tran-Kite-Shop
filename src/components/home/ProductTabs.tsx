'use client'

// Chỉ giữ state tab đang chọn. Nội dung mỗi tab được render sẵn ở Server Component cha và
// truyền xuống dạng ReactNode, nên ProductCard vẫn là server component (không kéo vào bundle client).
//
// Dáng theo mẫu 2026-07-28: hàng pill trôi tự do trên nền trang, pill đang chọn tô đen.
// Bỏ khung viền bao quanh cả khối của bản trước.
import { useEffect, useRef, useState, type ReactNode } from 'react'

export type ProductTab = { id: string; label: string; content: ReactNode }

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]
  const listRef = useRef<HTMLDivElement>(null)

  // Hàng chip cuộn ngang trên điện thoại, nên chip đang chọn dễ nằm ngoài tầm mắt - khách nhìn
  // vào tưởng đang xem nhóm khác. Kéo bằng scrollLeft chứ KHÔNG scrollIntoView: hàm kia cuộn
  // được cả trang theo trục dọc, bấm một chip là trang tự nhảy.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const chip = list.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!chip) return
    // `behavior:'smooth'` KHÔNG tự tôn trọng prefers-reduced-motion ở mọi trình duyệt nên phải
    // tự hỏi. Máy đang tắt hiệu ứng mà vẫn trượt mượt là đúng thứ người dùng đã tắt đi.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    list.scrollTo({
      left: chip.offsetLeft - (list.clientWidth - chip.clientWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [active])

  return (
    <div>
      <div
        ref={listRef}
        role="tablist"
        aria-label="Lọc sản phẩm theo nhóm"
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        {tabs.map((tab) => {
          const selected = tab.id === current?.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                selected
                  ? 'bg-ink-950 text-white'
                  : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-ink-950'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {current && (
        <div
          role="tabpanel"
          id={`panel-${current.id}`}
          aria-labelledby={`tab-${current.id}`}
          className="mt-6"
        >
          {current.content}
        </div>
      )}
    </div>
  )
}
