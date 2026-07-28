'use client'

// Mảnh form dùng chung cho mọi form admin (sản phẩm, cấu hình, khối nội dung).
// Gom một chỗ để ba form không trôi mỗi cái một kiểu ô nhập.

export const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30'

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-900">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-stone-600">{hint}</span>}
    </div>
  )
}
