'use client'

// Thanh trên cùng của khu quản trị: mở menu (điện thoại) và khối tài khoản.
// Màu cùng tone storefront: trắng - xám - đen, không cam.
//
// KHÔNG có ô tìm kiếm ở đây (bỏ 2026-07-28 theo yêu cầu user): ô tìm chung nằm trên mọi màn
// khiến đứng ở Tổng quan vẫn thấy "Tìm sản phẩm", bấm vào là bị ném sang màn khác. Giờ mỗi
// trang danh sách có ô tìm của riêng nó, tìm đúng thứ đang xem.
//
// Đăng xuất là form POST vì route /auth/dang-xuat cố ý không nhận GET (link GET bị trình duyệt
// prefetch, đang xem trang tự dưng bị đăng xuất).
import { ArrowSquareOut, List, SignOut } from '@phosphor-icons/react'
import Link from 'next/link'

export function AdminTopbar({
  userName,
  roleLabel,
  onOpenSidebar,
}: {
  userName: string
  roleLabel: string
  onOpenSidebar: () => void
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Mở menu quản trị"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-stone-300 text-ink-950 transition-colors hover:bg-stone-100 lg:hidden"
        >
          <List size={18} weight="bold" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="hidden items-center gap-2 rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:bg-stone-100 sm:flex"
          >
            <ArrowSquareOut size={16} weight="bold" />
            Xem web
          </Link>

          <div className="flex items-center gap-2.5 pl-1">
            <span className="hidden text-right leading-tight sm:block">
              <span className="block truncate text-sm font-semibold text-ink-950">{userName}</span>
              <span className="block text-xs text-stone-600">{roleLabel}</span>
            </span>
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink-950 text-sm font-bold text-white"
            >
              {userName.trim().charAt(0).toUpperCase() || 'A'}
            </span>
          </div>

          <form action="/auth/dang-xuat" method="post">
            <button
              type="submit"
              aria-label="Đăng xuất"
              className="grid h-10 w-10 place-items-center rounded-xl border border-stone-300 text-ink-950 transition-colors hover:bg-stone-100"
            >
              <SignOut size={18} weight="bold" />
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
