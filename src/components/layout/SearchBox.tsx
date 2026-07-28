'use client'

// Ô tìm kiếm ở header. Chỉ điều hướng sang /san-pham?q=… ;
// logEvent('search') bắn ở TRANG KẾT QUẢ (SearchTracker) vì chỉ ở đó mới biết resultCount.
// (Không đọc useSearchParams ở đây: header nằm trong root layout, hook đó sẽ ép mọi trang
// bail out khỏi static render.)
//
// Ở trạng thái nghỉ chỉ là một nút kính lúp cho khớp header dạng pill; bấm mới mở ô nhập
// thành một hàng RIÊNG bên dưới. Cố ý không cho ô nhập nở ngay trong thanh pill: thanh đó đã
// chật, nở ra là đẩy nav xuống dòng.
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    setOpen(false)
    router.push(q ? `/san-pham?q=${encodeURIComponent(q)}` : '/san-pham')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Đóng ô tìm kiếm' : 'Mở ô tìm kiếm'}
        className="grid h-9 w-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950"
      >
        {open ? <X size={18} weight="bold" /> : <MagnifyingGlass size={18} weight="bold" />}
      </button>

      {/* basis-full + order-last: nhảy xuống dòng riêng bên dưới thanh pill (thanh pill là flex). */}
      {open && (
        <form
          role="search"
          onSubmit={handleSubmit}
          className="order-last w-full basis-full px-1 pb-1 pt-2"
        >
          <label htmlFor="site-search" className="sr-only">
            Tìm sản phẩm
          </label>
          <div className="relative">
            <MagnifyingGlass
              size={16}
              weight="bold"
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm diều cánh cốc, diều sáo…"
              className="h-11 w-full rounded-full border border-stone-200 bg-stone-50 pl-10 pr-20 text-sm text-ink-950 placeholder:text-stone-400 focus:border-stone-400 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-ink-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-ink-800"
            >
              Tìm
            </button>
          </div>
        </form>
      )}
    </>
  )
}
