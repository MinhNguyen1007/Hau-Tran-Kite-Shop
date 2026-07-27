// Footer nền tối + thanh cam cuối trang, theo thiết kế tham chiếu.
//
// Cụm "Chính sách" đã BỎ (2026-07-27): shop không bán qua web nên không có chính sách đổi
// trả / thanh toán để nói. Cụm hướng dẫn giờ là link thật sang /huong-dan.
import { Envelope, MapPin, Phone, Wind } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { getGuideVideos } from '@/lib/guide-videos'
import { NAV_ITEMS, telHref, zaloHref } from '@/lib/shop'
import { getSiteSettings, toParagraphs } from '@/lib/site-settings'

export async function SiteFooter() {
  const [settings, guides] = await Promise.all([getSiteSettings(), getGuideVideos()])
  const about = toParagraphs(settings.footerAbout)

  return (
    <footer className="mt-16 bg-ink-900 text-stone-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-gold-300">
              <Wind size={20} weight="fill" />
            </span>
            <span className="text-sm font-extrabold uppercase tracking-wide text-white">
              {settings.shopName}
            </span>
          </div>
          {about.map((paragraph, index) => (
            <p
              key={paragraph}
              className={`text-sm leading-relaxed text-stone-400 ${index > 0 ? 'mt-4' : ''}`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-400">
            Thông tin liên hệ
          </h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a
                href={telHref(settings.hotline)}
                className="flex items-center gap-2.5 text-stone-300 transition-colors hover:text-brand-400"
              >
                <Phone size={18} weight="fill" className="shrink-0 text-brand-400" />
                <span className="font-semibold">{settings.hotline}</span>
              </a>
            </li>
            <li>
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2.5 break-all text-stone-300 transition-colors hover:text-brand-400"
              >
                <Envelope size={18} weight="fill" className="shrink-0 text-brand-400" />
                {settings.email}
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-stone-400">
              <MapPin size={18} weight="fill" className="shrink-0 text-brand-400" />
              {settings.address || settings.area}
            </li>
          </ul>
          <a
            href={zaloHref(settings.zaloPhone)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700"
          >
            Nhắn Zalo tư vấn
          </a>
        </div>

        {guides.length > 0 && (
          <div>
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-400">
              Hướng dẫn chơi diều
            </h2>
            <ul className="space-y-2.5 text-sm">
              {guides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    href="/huong-dan"
                    className="text-stone-400 transition-colors hover:text-brand-400"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/huong-dan"
              className="mt-4 inline-block text-sm font-bold text-brand-400 hover:underline"
            >
              Xem tất cả hướng dẫn →
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-ink-700">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.shopName}. Giữ toàn quyền.</p>
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-brand-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
