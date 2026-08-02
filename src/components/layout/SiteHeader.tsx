// Header dạng viên thuốc nổi (theo mẫu user đưa 2026-07-28): một thanh trắng bo tròn trôi
// trên nền trang, logo trái - nav giữa - nhóm icon phải. Thay cho header 2 tầng (thanh tiện
// ích + nav cam) của bản trước.
//
// Server Component; các đảo client (MainNav, SearchBox, WishlistBadge) tự import
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
import { SearchBox } from './SearchBox'

export async function SiteHeader() {
  // Đọc hồ sơ MỘT lần rồi truyền xuống: AccountLink và AdminLink đều cần, mỗi cái tự gọi là
  // hai lượt getUser() + hai truy vấn cho mỗi trang.
  //
  // Menu cũng đọc ở đây rồi truyền xuống: MainNav là Client Component, mà
  // nav-items.ts chạm next/headers — import thẳng vào đó là GÃY BUILD.
  const [settings, profile, navLinks] = await Promise.all([
    getSiteSettings(),
    getProfile(),
    getNavLinks(),
  ])

  return (
    <header className="sticky top-0 z-50 px-3 pt-3">
      {/* LƯỚI chứ không phải flex, và tuyệt đối KHÔNG `flex-wrap`: bản cũ cho xuống dòng tự do
          nên ô tìm kiếm mở ra là thanh vỡ hai tầng trông như lỗi. Ở đây hai hàng là CỐ Ý và do
          lưới định vị: điện thoại xếp [logo | nhóm icon] hàng trên, menu hàng dưới; từ lg gộp
          lại một hàng [logo | menu | nhóm icon].
          `relative` để ô tìm kiếm trên màn hẹp phủ đúng bên trong thanh này. */}
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-y-2 rounded-[28px] border border-stone-200/70 bg-white/85 px-3 py-2 shadow-sm shadow-stone-900/5 backdrop-blur-md lg:grid-cols-[auto_1fr_auto] lg:gap-x-2">
        {/* Bọc FLEX cho hàng trên, `lg:contents` cho nó tan ra thành hai ô lưới từ lg. Dùng lưới
            hai cột cho cả hai khổ thì track `auto` của logo bị track `1fr` của nhóm icon ép lại,
            tên shop mất 28px và bị cắt dù hàng còn dư chỗ - đã đo. Flex thì tên nhận đúng phần
            còn lại sau khi nhóm icon lấy phần cố định của nó. */}
        <div className="flex min-w-0 items-center gap-2 lg:contents">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-full pl-1 pr-2"
          aria-label={`${settings.shopName} - về trang chủ`}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-950 text-white">
            <Wind size={19} weight="fill" />
          </span>
          {/* ĐỪNG thử hiện tên shop trên điện thoại nữa - đã đo và không đủ chỗ thật: ở khổ
              390px hàng trên chỉ có 321px, mà dấu hiệu logo + ba icon đã ăn hết 186px, tên
              "Diều Cánh Cốc Hậu Trần" cần 163px và chỉ nhận được 135px. Cố hiện thì ra
              "Diều Cánh Cốc H…" cụt lủn, trông cẩu thả hơn là để mỗi dấu hiệu logo.
              Tên shop vẫn nằm ngay dưới ở thẻ h1 của hero, không mất nhận diện.
              `truncate` + `min-w-0` ở thẻ cha là lưới an toàn cho tên shop dài hơn ở khổ sm. */}
          <span className="hidden truncate text-[15px] font-bold tracking-tight text-ink-950 sm:block">
            {settings.shopName}
          </span>
        </Link>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:col-start-3">
            <SearchBox />
            <WishlistBadge />
            <AccountLink profile={profile} />
            {/* Chỉ hiện với admin — khách thường không thấy gì thêm. */}
            <AdminLink profile={profile} />
          </div>
        </div>

        {/* Nút ba gạch đã bỏ hẳn 2026-08-02 theo yêu cầu user, `MobileMenu.tsx` xoá luôn.
            Menu giờ nằm ngay đây, hiện sẵn - đừng dựng lại drawer. */}
        <MainNav
          items={navLinks}
          className="min-w-0 lg:col-start-2 lg:row-start-1 lg:flex lg:justify-center"
        />
      </div>
    </header>
  )
}
