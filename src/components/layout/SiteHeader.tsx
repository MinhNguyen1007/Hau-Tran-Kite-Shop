// Header dạng viên thuốc nổi (theo mẫu user đưa 2026-07-28): một thanh trắng bo tròn trôi
// trên nền trang, logo trái - nav giữa - nhóm icon phải. Thay cho header 2 tầng (thanh tiện
// ích + nav cam) của bản trước.
//
// Server Component; các đảo client (MainNav, SearchBox, WishlistBadge, MobileMenu) tự import
// icon của chúng nên ở đây dùng icon bản /ssr.
//
// KHÔNG có icon giỏ hàng như mẫu gốc: shop chốt đơn qua Zalo, giỏ hàng đã gỡ có chủ ý.
// Ô thứ ba là tài khoản.
import { Wind } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { WishlistBadge } from '@/components/wishlist/WishlistBadge'
import { getProfile } from '@/lib/auth'
import { getNavLinks } from '@/lib/nav-items'
import { getSiteSettings } from '@/lib/site-settings'
import { AccountLink } from './AccountLink'
import { AdminLink } from './AdminLink'
import { MainNav } from './MainNav'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'

export async function SiteHeader() {
  // Đọc hồ sơ MỘT lần rồi truyền xuống: AccountLink và AdminLink đều cần, mỗi cái tự gọi là
  // hai lượt getUser() + hai truy vấn cho mỗi trang.
  //
  // Menu cũng đọc ở đây rồi truyền xuống: MainNav và MobileMenu là Client Component, mà
  // nav-items.ts chạm next/headers — import thẳng vào đó là GÃY BUILD.
  const [settings, profile, navLinks] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getNavLinks(),
  ])

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      {/* KHÔNG flex-wrap: header phải luôn đúng MỘT hàng. Bản trước cho phép xuống dòng để ô
          tìm kiếm mở ra thành hàng riêng, kết quả là thanh vỡ làm hai tầng trông như lỗi.
          `relative` để ô tìm kiếm trên màn hẹp phủ đúng bên trong thanh này. */}
      <div className="relative mx-auto flex w-full max-w-7xl items-center gap-2 rounded-[28px] border border-stone-200/70 bg-white/85 px-3 py-2 shadow-sm shadow-stone-900/5 backdrop-blur-md">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full pl-1 pr-2"
          aria-label={`${settings.shopName} - về trang chủ`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-950 text-white">
            <Wind size={19} weight="fill" />
          </span>
          <span className="hidden text-[15px] font-bold tracking-tight text-ink-950 sm:block">
            {settings.shopName}
          </span>
        </Link>

        <MainNav items={navLinks} />

        <div className="ml-auto flex items-center gap-1.5">
          <SearchBox />
          <WishlistBadge />
          <AccountLink profile={profile} />
          {/* Chỉ hiện với admin — khách thường không thấy gì thêm. */}
          <AdminLink profile={profile} />
          <MobileMenu items={navLinks} />
        </div>
      </div>
    </header>
  )
}
