// Header 2 tầng theo thiết kế tham chiếu: thanh tiện ích (logo / hotline / tìm kiếm / tài khoản
// / yêu thích) và thanh điều hướng cam dính trên đầu. Server Component — các đảo client (SearchBox,
// MobileMenu, WishlistBadge) tự import icon của chúng, nên ở đây dùng icon bản /ssr.
import { MapPin, Phone, Wind } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { WishlistBadge } from '@/components/wishlist/WishlistBadge'
import { NAV_ITEMS, telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'
import { AccountLink } from './AccountLink'
import { MobileMenu } from './MobileMenu'
import { SearchBox } from './SearchBox'

export async function SiteHeader() {
  const settings = await getSiteSettings()

  return (
    <header className="bg-white dark:bg-ink-900">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex items-center gap-3 py-3 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-gold-300 shadow-sm">
              <Wind size={22} weight="fill" />
            </span>
            <span className="leading-none">
              <span className="block text-[15px] font-extrabold uppercase tracking-tight text-ink-900 dark:text-stone-50">
                Diều Cánh Cốc
              </span>
              <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700 dark:text-brand-400">
                Hậu Trần
              </span>
            </span>
          </Link>

          <a
            href={telHref(settings.hotline)}
            className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-stone-700 transition-colors hover:text-brand-600 xl:flex dark:text-stone-200 dark:hover:text-brand-400"
          >
            <Phone size={18} weight="fill" className="text-brand-600 dark:text-brand-400" />
            {settings.hotline}
          </a>

          <span className="hidden shrink-0 items-center gap-2 text-sm font-semibold text-stone-700 xl:flex dark:text-stone-200">
            <MapPin size={18} weight="fill" className="text-brand-600 dark:text-brand-400" />
            {settings.area}
          </span>

          <SearchBox className="hidden min-w-0 flex-1 md:block" />

          <div className="ml-auto flex items-center gap-1 lg:ml-0">
            <AccountLink className="hidden sm:flex" />
            <WishlistBadge />
            <MobileMenu />
          </div>
        </div>

        <SearchBox className="pb-3 md:hidden" />
      </div>

      <nav className="sticky top-0 z-40 hidden bg-brand-600 shadow-sm md:block dark:bg-brand-700">
        {/* overflow-x-auto: ở đúng ngưỡng md, 7 mục có thể chạm mép — cho cuộn ngang chứ
            tuyệt đối không để nav xuống hai dòng. */}
        <ul className="no-scrollbar mx-auto flex h-11 w-full max-w-7xl items-stretch overflow-x-auto px-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="flex">
              <Link
                href={item.href}
                className="flex items-center whitespace-nowrap px-3 text-[13px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-brand-700 lg:px-4 lg:text-sm dark:hover:bg-brand-800"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
