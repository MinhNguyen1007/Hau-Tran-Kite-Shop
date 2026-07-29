'use client'

// Mảnh form dùng chung cho mọi form admin (sản phẩm, cấu hình, khối nội dung).
// Gom một chỗ để ba form không trôi mỗi cái một kiểu ô nhập.

export const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-stone-500 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-950/15'

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
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-950">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-stone-600">{hint}</span>}
    </div>
  )
}
