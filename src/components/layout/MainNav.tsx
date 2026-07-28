'use client'

// Dải nav dạng viên thuốc ở giữa header: cả nhóm nằm trong một khay xám, mục đang xem là
// viên trắng nổi lên. Phải là Client Component vì chỉ ở client mới biết đường dẫn hiện tại.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ITEMS } from '@/lib/shop'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Điều hướng chính" className="hidden lg:mx-auto lg:block">
      <ul className="flex items-center gap-0.5 rounded-full bg-stone-100 p-1">
        {NAV_ITEMS.map((item) => {
          // Mục dạng '/#neo' luôn thuộc trang chủ. So khớp phần trước '#' để ở trang chủ thì
          // cả 'Trang chủ' lẫn các mục neo không cùng sáng lên một lúc — chỉ '/' được tính.
          const path = item.href.split('#')[0] || '/'
          const hasAnchor = item.href.includes('#')
          const active = !hasAnchor && (path === '/' ? pathname === '/' : pathname.startsWith(path))

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-white font-semibold text-ink-950 shadow-sm'
                    : 'font-medium text-stone-600 hover:text-ink-950'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
