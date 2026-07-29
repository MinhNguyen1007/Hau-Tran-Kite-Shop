// Hai mảnh khung dùng lại ở mọi trang admin. Server Component — không có gì tương tác.
//
// Luật hình khối khu /admin (một luật, áp khắp): thẻ `rounded-2xl`, ô nhập `rounded-xl`,
// nút bấm `rounded-full`. Đừng trộn thêm cỡ bo góc khác vào.
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import Link from 'next/link'

export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  children,
}: {
  title: string
  description?: string
  // Đường về danh sách cha, dùng ở các trang form. Trang danh sách thì bỏ trống.
  backHref?: string
  backLabel?: string
  // Chỗ cho nút hành động chính của trang (Thêm sản phẩm, Thêm danh mục...).
  children?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {backHref && backLabel && (
          <Link
            href={backHref}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-stone-600 transition-colors hover:underline"
          >
            <ArrowLeft size={15} weight="bold" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ink-950">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-600">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}

export function Panel({
  title,
  action,
  bodyClassName = 'p-4 md:p-5',
  children,
}: {
  title?: string
  action?: React.ReactNode
  // Bảng cần body không đệm (viền bảng tự chạm mép thẻ); form thì cần đệm.
  bodyClassName?: string
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-stone-200 px-4 py-3.5 md:px-5">
          <h2 className="text-sm font-bold text-ink-950">{title}</h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
