'use client'

// Drawer điều hướng cho màn hình < lg. Thanh nav cam ở desktop bị ẩn dưới md nên
// đây là đường vào duy nhất của menu trên mobile.
import { List, Phone, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { HOTLINE_HREF, NAV_ITEMS, SHOP } from '@/lib/shop'

export function MobileMenu() {
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
        className="grid h-10 w-10 place-items-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100 lg:hidden dark:text-stone-200 dark:hover:bg-ink-800"
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
          <div className="absolute inset-y-0 right-0 flex w-[82%] max-w-xs flex-col bg-white shadow-xl dark:bg-ink-900">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-ink-700">
              <span className="text-sm font-bold uppercase tracking-wide text-brand-700 dark:text-brand-400">
                Danh mục
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng menu"
                className="grid h-9 w-9 place-items-center rounded-lg text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-ink-800"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto py-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-stone-800 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:text-stone-100 dark:hover:bg-ink-800 dark:hover:text-brand-400"
                >
                  {item.label}
                </Link>
              ))}

              {/* Trỏ thẳng /tai-khoan kể cả khi chưa đăng nhập: middleware tự đẩy sang
                  /dang-nhap rồi quay lại đây. Đỡ phải kéo session vào client component. */}
              <Link
                href="/tai-khoan"
                onClick={() => setOpen(false)}
                className="border-t border-stone-200 px-4 py-3 text-[15px] font-medium text-stone-800 transition-colors hover:bg-brand-50 hover:text-brand-700 dark:border-ink-700 dark:text-stone-100 dark:hover:bg-ink-800 dark:hover:text-brand-400"
              >
                Tài khoản
              </Link>
            </nav>

            <a
              href={HOTLINE_HREF}
              className="m-4 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700"
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
