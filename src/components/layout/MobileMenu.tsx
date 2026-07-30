'use client'

// Drawer điều hướng cho màn hình < lg. Thanh nav cam ở desktop bị ẩn dưới md nên
// đây là đường vào duy nhất của menu trên mobile.
import { List, Phone, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HOTLINE_HREF, type NavLink, SHOP } from '@/lib/shop'

export function MobileMenu({ items }: { items: NavLink[] }) {
  const [open, setOpen] = useState(false)

  // Khoá scroll nền khi drawer mở; luôn trả lại giá trị cũ lúc unmount.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Mở menu"
        className="grid h-10 w-10 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950 lg:hidden"
      >
        <List size={22} weight="bold" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink-950/60"
          />
          <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="text-sm font-bold tracking-tight text-ink-950">
                Danh mục
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto py-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-stone-800 transition-colors hover:bg-stone-100 hover:text-ink-950"
                >
                  {item.label}
                </Link>
              ))}

              {/* Trỏ thẳng /tai-khoan kể cả khi chưa đăng nhập: middleware tự đẩy sang
                  /dang-nhap rồi quay lại đây. Đỡ phải kéo session vào client component. */}
              <Link
                href="/tai-khoan"
                onClick={() => setOpen(false)}
                className="border-t border-stone-200 px-4 py-3 text-[15px] font-medium text-stone-800 transition-colors hover:bg-stone-100 hover:text-ink-950"
              >
                Tài khoản
              </Link>
            </nav>

            <a
              href={HOTLINE_HREF}
              className="m-4 flex items-center justify-center gap-2 rounded-full bg-ink-950 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-ink-800"
            >
              <Phone size={18} weight="fill" />
              Gọi {SHOP.hotline}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
