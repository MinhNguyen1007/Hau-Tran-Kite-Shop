'use client'

// Cột điều hướng của khu quản trị. Client Component vì mục đang xem phải so với đường dẫn
// hiện tại, mà chỉ client mới biết đường dẫn.
//
// Màu: CÙNG TONE storefront (trắng - xám - đen), không dùng cam brand. Mục đang chọn là viên
// TRẮNG nổi trên nền tối, đúng cách MainNav ngoài trang chủ đánh dấu mục đang xem.
//
// Ẩn mục "Tài khoản" với admin phụ CHỈ là phần nhìn. Trang và API sau nó đều tự
// requireOwner() — đừng bao giờ coi việc giấu link là một lớp bảo vệ.
import { Package, SquaresFour, Storefront, Tag, UsersThree, Wind, X, type Icon } from '@phosphor-icons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

type NavItem = {
  label: string
  href: string
  icon: Icon
  // Chỉ '/admin' cần khớp tuyệt đối; các mục khác sáng cho cả trang con (/admin/san-pham/moi).
  exact?: boolean
}

// Không có mục tin nhắn liên hệ: bỏ hẳn 2026-07-28, mọi liên hệ đi qua Zalo.
// Chữ trên các khối trang chủ giờ sửa trong "Thông tin shop", không còn màn riêng.
const NAV: NavItem[] = [
  { label: 'Tổng quan', href: '/admin', icon: SquaresFour, exact: true },
  { label: 'Sản phẩm', href: '/admin/san-pham', icon: Package },
  { label: 'Danh mục diều', href: '/admin/danh-muc', icon: Tag },
  { label: 'Thông tin shop', href: '/admin/cai-dat', icon: Storefront },
]

const OWNER_NAV: NavItem[] = [{ label: 'Tài khoản', href: '/admin/tai-khoan', icon: UsersThree }]

export function AdminSidebar({
  isOwner,
  shopName,
  open,
  onClose,
}: {
  isOwner: boolean
  shopName: string
  open: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  // Đổi trang thì đóng ngăn kéo. Không có cái này, bấm một mục trên điện thoại xong màn hình
  // mới hiện ra sau tấm phủ đen.
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Đóng menu quản trị"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink-950/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col overflow-y-auto bg-ink-950 transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-ink-950">
              <Wind size={19} weight="fill" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">{shopName}</span>
              <span className="block text-xs text-stone-400">Khu quản trị</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng menu quản trị"
            className="ml-auto grid h-9 w-9 place-items-center rounded-xl text-stone-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-6 px-3 pb-6">
          <NavGroup title="Quản lý" items={NAV} pathname={pathname} />
          {isOwner && <NavGroup title="Chủ shop" items={OWNER_NAV} pathname={pathname} />}
        </nav>
      </aside>
    </>
  )
}

function NavGroup({
  title,
  items,
  pathname,
}: {
  title: string
  items: NavItem[]
  pathname: string
}) {
  return (
    <div>
      <h2 className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.12em] text-stone-500">
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'bg-white font-semibold text-ink-950'
                    : 'font-medium text-stone-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={19} weight={active ? 'fill' : 'bold'} />
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
