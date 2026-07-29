'use client'

// Dải nav dạng viên thuốc ở giữa header: cả nhóm nằm trong một khay xám, mục đang xem là
// viên trắng nổi lên. Phải là Client Component vì chỉ ở client mới biết đường dẫn hiện tại.
//
// Hai mục 'Danh mục' và 'Giới thiệu' là NEO trong trang chủ, không đổi đường dẫn, nên trước
// 2026-07-28 chúng không bao giờ sáng lên trong khi 'Sản phẩm' thì có — nhìn như nút hỏng.
// Giờ dò bằng IntersectionObserver: khối nào đang chạm dải ngay dưới header thì mục của nó sáng.
//
// KHÔNG nghe sự kiện scroll: nó chạy mỗi khung hình và bắt React render lại theo, đúng thứ
// làm giật trang trên điện thoại. IntersectionObserver để trình duyệt tự báo, rẻ hơn nhiều.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { NAV_ITEMS } from '@/lib/shop'

// Id của các khối được neo tới, lấy thẳng từ NAV_ITEMS để thêm mục mới là tự có scroll-spy.
const ANCHOR_IDS = NAV_ITEMS.filter((item) => item.href.includes('#')).map(
  (item) => item.href.split('#')[1],
)

export function MainNav() {
  const pathname = usePathname()
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null)

  useEffect(() => {
    // Neo chỉ tồn tại ở trang chủ. Không cần dọn state khi rời trang: phần render đã chặn
    // bằng `pathname === '/'`, mà gọi setState thẳng trong effect là thêm một lượt render thừa.
    if (pathname !== '/') return

    const sections = ANCHOR_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => element !== null,
    )
    if (sections.length === 0) return

    // Khối "đang xem" = khối CUỐI CÙNG có mép trên đã đi qua vạch ngay dưới header.
    //
    // Bản đầu dùng một dải hẹp và chỉ tính khối nào đang nằm trong dải đó. Cách ấy hỏng với
    // khối CUỐI trang: cuộn hết cỡ rồi mà mép trên của nó vẫn chưa tới dải, nên 'Giới thiệu'
    // không bao giờ sáng. Đo mép trên thì không phụ thuộc còn bao nhiêu trang phía dưới.
    const HEADER_LINE = 140

    const pickActive = () => {
      let current: string | null = null
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= HEADER_LINE) current = section.id
      }
      setActiveAnchor(current)
    }

    // Ngưỡng dày (mỗi 5%) để trình duyệt gọi lại đủ thường trong lúc cuộn. Vẫn rẻ hơn nghe sự
    // kiện scroll rất nhiều: vài chục lần cho cả một khối, không phải mỗi khung hình.
    const observer = new IntersectionObserver(pickActive, {
      threshold: Array.from({ length: 21 }, (_, step) => step / 20),
    })

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [pathname])

  return (
    <nav aria-label="Điều hướng chính" className="hidden lg:mx-auto lg:block">
      <ul className="flex items-center gap-0.5 rounded-full bg-stone-100 p-1">
        {NAV_ITEMS.map((item) => {
          const [path, anchor] = item.href.split('#')
          const active = anchor
            ? // Mục neo: chỉ sáng khi đang ở trang chủ VÀ khối của nó đang trong tầm mắt.
              pathname === '/' && activeAnchor === anchor
            : path === '/'
              ? // 'Trang chủ' nhường chỗ cho mục neo khi khách đã cuộn xuống tới khối đó.
                pathname === '/' && activeAnchor === null
              : pathname.startsWith(path)

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
