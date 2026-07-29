'use client'

// Ô tìm kiếm ở header. Chỉ điều hướng sang /san-pham?q=… ;
// logEvent('search') bắn ở TRANG KẾT QUẢ (SearchTracker) vì chỉ ở đó mới biết resultCount.
// (Không đọc useSearchParams ở đây: header nằm trong root layout, hook đó sẽ ép mọi trang
// bail out khỏi static render.)
//
// Bản 2026-07-28 làm lại: bản trước mở ra thành MỘT HÀNG RIÊNG bên dưới thanh pill, kéo theo
// nhóm icon bị đẩy xuống và thanh header vỡ làm hai tầng, nhìn như lỗi layout.
//
// Giờ ô nhập NỞ NGAY TẠI CHỖ trong thanh: nút kính lúp biến thành ô rộng 18rem đẩy sang trái,
// nhóm icon đứng yên, header vẫn đúng một hàng. Trên màn hẹp thì mở thành lớp phủ toàn chiều
// ngang của thanh — ở đó không đủ chỗ cho cả hai.
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function SearchBox() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Mở ra thì con trỏ nhảy thẳng vào ô nhập, khỏi bắt người dùng bấm thêm lần nữa.
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const q = query.trim()
    setOpen(false)
    router.push(q ? `/san-pham?q=${encodeURIComponent(q)}` : '/san-pham')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        aria-label="Mở ô tìm kiếm"
        className="grid h-9 w-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950"
      >
        <MagnifyingGlass size={18} weight="bold" />
      </button>
    )
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      // Điện thoại: phủ kín thanh pill (absolute inset). Từ sm trở lên: chỉ là một ô rộng
      // cố định nằm cùng hàng với nhóm icon.
      className="absolute inset-x-2 z-10 sm:static sm:w-72"
    >
      <label htmlFor="site-search" className="sr-only">
        Tìm sản phẩm
      </label>

      <div className="relative">
        <MagnifyingGlass
          size={16}
          weight="bold"
          aria-hidden
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500"
        />
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
          placeholder="Tìm diều cánh cốc, sáo diều…"
          // appearance-none + [&::-webkit-search-cancel-button]:hidden: Chrome tự vẽ thêm một
          // dấu X xám trong ô search, đứng cạnh nút đóng của mình thành hai chữ X cạnh nhau.
          className="h-9 w-full appearance-none rounded-full border border-stone-300 bg-white pl-9 pr-9 text-sm text-ink-950 placeholder:text-stone-400 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-950/15 [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Đóng ô tìm kiếm"
          className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink-950"
        >
          <X size={15} weight="bold" />
        </button>
      </div>
    </form>
  )
}
