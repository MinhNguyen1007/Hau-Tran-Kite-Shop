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
import { getSiteSettings } from '@/lib/site-settings'
import { AccountLink } from './AccountLink'
import { MainNav } from './MainNav'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'

export async function SiteHeader() {
  const settings = await getSiteSettings()

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      {/* flex-wrap: ô tìm kiếm khi mở ra chiếm trọn một dòng (basis-full) và tự xuống hàng
          dưới, thay vì bóp nghẹt nav. */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center gap-2 rounded-[28px] border border-stone-200/70 bg-white/85 px-3 py-2 shadow-sm shadow-stone-900/5 backdrop-blur-md">
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

        <MainNav />

        <div className="ml-auto flex items-center gap-0.5">
          <SearchBox />
          <WishlistBadge />
          <AccountLink />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
