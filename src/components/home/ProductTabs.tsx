'use client'

// Chỉ giữ state tab đang chọn. Nội dung mỗi tab được render sẵn ở Server Component cha và
// truyền xuống dạng ReactNode, nên ProductCard vẫn là server component (không kéo vào bundle client).
import { useState, type ReactNode } from 'react'

export type ProductTab = { id: string; label: string; content: ReactNode }

export function ProductTabs({ tabs }: { tabs: ProductTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const current = tabs.find((t) => t.id === active) ?? tabs[0]

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-brand-500 bg-white dark:border-brand-700 dark:bg-ink-900">
      <div
        role="tablist"
        aria-label="Lọc diều theo nhóm"
        className="no-scrollbar flex gap-1 overflow-x-auto border-b border-stone-200 bg-stone-50 p-1.5 dark:border-ink-700 dark:bg-ink-800"
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
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                selected
                  ? 'bg-brand-600 text-white'
                  : 'text-stone-600 hover:bg-brand-50 hover:text-brand-700 dark:text-stone-300 dark:hover:bg-ink-700 dark:hover:text-brand-400'
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
          className="p-3 md:p-4"
        >
          {current.content}
        </div>
      )}
    </div>
  )
}
