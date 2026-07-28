'use client'

// Chỉ giữ state tab đang chọn. Nội dung mỗi tab được render sẵn ở Server Component cha và
// truyền xuống dạng ReactNode, nên ProductCard vẫn là server component (không kéo vào bundle client).
//
// Dáng theo mẫu 2026-07-28: hàng pill trôi tự do trên nền trang, pill đang chọn tô đen.
// Bỏ khung viền bao quanh cả khối của bản trước.
import { useState, type ReactNode } from 'react'

export type ProductTab = { id: string; label: string; content: ReactNode }

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div>
      <div
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
