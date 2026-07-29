// Ô tìm kiếm dùng trong các trang danh sách của admin. Form GET thật, trạng thái nằm trên URL
// nên bấm quay lại vẫn đúng và chia sẻ được link — trang danh sách vẫn là Server Component.
//
// Đặt trong TỪNG TRANG chứ không nhét vào topbar: ô tìm ở topbar thì đứng ở màn Tổng quan
// vẫn thấy "Tìm sản phẩm", bấm vào là bị ném sang màn khác — tìm cái gì phải đứng ở chỗ có
// cái đó (yêu cầu user 2026-07-28).
import { MagnifyingGlass } from '@phosphor-icons/react/ssr'
import Link from 'next/link'

export function SearchField({
  action,
  name,
  defaultValue,
  placeholder,
  label,
  hidden = {},
}: {
  // Đường dẫn trang danh sách, ví dụ '/admin/san-pham'.
  action: string
  name: string
  defaultValue: string
  placeholder: string
  label: string
  // Bộ lọc khác đang bật, giữ lại khi tìm — không thì gõ tìm là mất bộ lọc danh mục.
  hidden?: Record<string, string>
}) {
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([key, value]) => (
        <input key={key} type="hidden" name={key} value={value} />
      ))}

      <div className="relative min-w-0 flex-1 sm:max-w-sm">
        <label htmlFor={`search-${name}`} className="sr-only">
          {label}
        </label>
        <MagnifyingGlass
          size={16}
          weight="bold"
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
        />
        <input
          id={`search-${name}`}
          type="search"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-stone-300 bg-white pl-9 pr-3 text-sm text-ink-950 placeholder:text-stone-500 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-950/15"
        />
      </div>

      <button
        type="submit"
        className="h-10 shrink-0 rounded-xl bg-ink-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
      >
        Tìm
      </button>

      {defaultValue !== '' && (
        <Link
          href={action}
          className="h-10 shrink-0 rounded-xl border border-stone-300 px-4 text-sm font-semibold leading-10 text-ink-950 transition-colors hover:bg-stone-100"
        >
          Xoá tìm
        </Link>
      )}
    </form>
  )
}
