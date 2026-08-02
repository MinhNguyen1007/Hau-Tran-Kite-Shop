// Footer 4 cột theo mẫu 2026-07-28: cột thương hiệu + ba cột link, nền sáng cùng tông với
// cả trang (bản trước là nền ink tối).
//
// KHÔNG có hàng icon mạng xã hội như mẫu gốc: shop chưa khai tài khoản mạng xã hội nào trong
// site_settings, gắn link chết vào footer còn tệ hơn là không có. Chỗ đó để hotline + email,
// vốn là kênh thật của shop.
//
// Mọi link ở đây phải là route CÓ THẬT. Cột "Sản phẩm" dựng từ bảng categories nên admin
// thêm danh mục là footer tự có thêm mục, không phải sửa code.
import { Envelope, MapPin, Phone, Wind } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ZaloAction } from '@/components/contact/ZaloAction'
import { getCategories } from '@/lib/categories'
import { telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

function FooterColumn({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400">
        {heading}
      </h2>
      <ul className="mt-4 space-y-2.5 text-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-stone-600 transition-colors hover:text-ink-950">
        {children}
      </Link>
    </li>
  )
}

export async function SiteFooter() {
  const [settings, categories] = await Promise.all([getSiteSettings(), getCategories()])

  return (
    <footer className="mt-8 border-t border-stone-200 bg-white">
      {/* Điện thoại: khối thương hiệu chiếm trọn hàng, ba nhóm link chia HAI CỘT. Xếp dọc một
          cột như bản cũ thì riêng footer đã dài bằng một phần tư trang, khách phải vuốt qua
          mười mấy dòng link mới tới dòng bản quyền. */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-4 gap-y-8 px-4 py-10 sm:gap-x-8 lg:grid-cols-4 lg:gap-10 lg:py-14">
        <div className="col-span-2 lg:col-span-1 lg:pr-8">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink-950 text-white">
              <Wind size={19} weight="fill" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-ink-950">
              {settings.shopName}
            </span>
          </div>

          <ul className="mt-5 space-y-2.5 text-sm">
            <li>
              <a
                href={telHref(settings.hotline)}
                className="flex items-center gap-2.5 text-stone-600 transition-colors hover:text-ink-950"
              >
                <Phone size={16} weight="fill" className="shrink-0 text-stone-400" />
                <span className="font-semibold text-ink-950">{settings.hotline}</span>
              </a>
            </li>
            {settings.email && (
              <li>
                <a
                  href={`mailto:${settings.email}`}
                  className="flex items-center gap-2.5 break-all text-stone-600 transition-colors hover:text-ink-950"
                >
                  <Envelope size={16} weight="fill" className="shrink-0 text-stone-400" />
                  {settings.email}
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5 text-stone-600">
              <MapPin size={16} weight="fill" className="shrink-0 text-stone-400" />
              {settings.address || settings.area}
            </li>
          </ul>
        </div>

        <FooterColumn heading="Sản phẩm">
          <FooterLink href="/san-pham">Tất cả sản phẩm</FooterLink>
          {categories.map((category) => (
            <FooterLink
              key={category.id}
              href={`/san-pham?danh-muc=${encodeURIComponent(category.slug)}`}
            >
              {category.name}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn heading="Hỗ trợ">
          <FooterLink href="/lien-he">Liên hệ</FooterLink>
          <FooterLink href="/yeu-thich">Danh sách yêu thích</FooterLink>
          <FooterLink href="/tai-khoan">Tài khoản</FooterLink>
          <li>
            {/* Dùng ZaloAction chứ không phải thẻ <a> trần: trên máy tính link zalo.me dẫn vào
                tường đăng nhập của Zalo, nên chỗ này cũng phải hiện mã QR. Kèm theo đó là link
                Zalo duy nhất trước đây KHÔNG bắn contact_click, giờ có. */}
            <ZaloAction
              zaloPhone={settings.zaloPhone}
              source="footer"
              display="inline"
              className="text-left text-stone-600 transition-colors hover:text-ink-950"
            >
              Nhắn Zalo tư vấn
            </ZaloAction>
          </li>
        </FooterColumn>

        <FooterColumn heading="Về shop">
          <FooterLink href="/#gioi-thieu">Giới thiệu xưởng</FooterLink>
          <FooterLink href="/#danh-muc">Danh mục</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-stone-200">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 text-xs text-stone-500">
          © {new Date().getFullYear()} {settings.shopName}. Giữ toàn quyền.
        </div>
      </div>
    </footer>
  )
}
