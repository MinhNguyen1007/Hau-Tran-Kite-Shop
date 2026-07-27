// Footer nền tối 4 cột + thanh cam cuối trang, theo thiết kế tham chiếu.
// TODO(trang): mục Chính sách / Hướng dẫn đang là text tĩnh vì GĐ1 chưa có route tương ứng.
// Khi dựng các trang đó thì đổi <li> thành <Link>.
import { Envelope, MapPin, Phone, Wind } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { NAV_ITEMS, telHref, zaloHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

const POLICIES = [
  'Chính sách đổi trả trong 7 ngày',
  'Chính sách bảo hành khung tre',
  'Chính sách vận chuyển toàn quốc',
  'Chính sách bảo mật thông tin',
  'Hình thức thanh toán',
]

const GUIDES = [
  'Chọn diều theo sức gió nơi bạn ở',
  'Cách lắp khung và căng dây lần đầu',
  'Cân bộ sáo cho tiếng vang, tiếng trong',
  'Bảo quản diều qua mùa mưa',
  'Thả diều an toàn, tránh xa đường điện',
]

export async function SiteFooter() {
  const settings = await getSiteSettings()

  return (
    <footer className="mt-16 bg-ink-900 text-stone-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-gold-300">
              <Wind size={20} weight="fill" />
            </span>
            <span className="text-sm font-extrabold uppercase tracking-wide text-white">
              {settings.shopName}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-stone-400">
            Xưởng diều làm thủ công theo lối truyền thống: khung tre vót tay, phất giấy dó, cân
            sáo bằng tai. Mỗi chiếc diều đều được thử gió trước khi giao.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-stone-400">
            Nhận đặt diều theo kích cỡ và hoạ tiết riêng, làm trong 5 đến 10 ngày tuỳ mẫu.
          </p>
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

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-400">
            Chính sách
          </h2>
          <ul className="space-y-2.5 text-sm text-stone-400">
            {POLICIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-400">
            Hướng dẫn chơi diều
          </h2>
          <ul className="space-y-2.5 text-sm text-stone-400">
            {GUIDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
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
