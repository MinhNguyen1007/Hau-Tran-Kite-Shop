import { Envelope, MapPin, Phone } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { ContactCta } from '@/components/contact/ContactCta'
import { getSiteSettings } from '@/lib/site-settings'

// generateMetadata chứ không phải hằng `metadata`: tên shop và hotline nằm trong site_settings,
// admin sửa xong thì cả thẻ <title> lẫn description phải đổi theo.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: `Liên hệ | ${settings.shopName}`,
    description: `Đặt diều cánh cốc theo yêu cầu. Nhắn Zalo hoặc gọi ${settings.hotline} để shop tư vấn mẫu và chốt đơn.`,
  }
}

// Form gửi lời nhắn đã BỎ 2026-07-28: shop chốt mọi đơn qua Zalo, nên ô nhập chỉ là chỗ khách
// gõ xong rồi chờ hồi âm không tới. Đừng dựng lại.
export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">Liên hệ</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
        Đặt diều theo kích cỡ và hoạ tiết riêng, hỏi giá sáo, hay cần tư vấn chọn diều cho trẻ:
        nhắn Zalo hoặc gọi thẳng cho shop, nhanh hơn mọi cách khác.
      </p>

      <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
        <h2 className="text-base font-bold text-ink-900">{settings.shopName}</h2>

        <ContactCta
          hotline={settings.hotline}
          zaloPhone={settings.zaloPhone || settings.hotline}
          source="contact_page"
          className="mt-4"
        />

        <dl className="mt-6 flex flex-col gap-3 border-t border-stone-200 pt-5">
          <ContactRow icon={<Phone size={18} weight="fill" />} label="Hotline">
            <a href={`tel:${settings.hotline.replace(/\s/g, '')}`} className="hover:underline">
              {settings.hotline}
            </a>
          </ContactRow>

          <ContactRow icon={<Envelope size={18} weight="fill" />} label="Email">
            <a href={`mailto:${settings.email}`} className="break-all hover:underline">
              {settings.email}
            </a>
          </ContactRow>

          <ContactRow icon={<MapPin size={18} weight="fill" />} label="Địa chỉ">
            {settings.address || settings.area}
          </ContactRow>

          {settings.openHours && (
            <ContactRow icon={null} label="Giờ mở cửa">
              {settings.openHours}
            </ContactRow>
          )}
        </dl>
      </div>
    </div>
  )
}

function ContactRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 w-[18px] shrink-0 text-stone-400">{icon}</span>
      <dt className="w-24 shrink-0 text-sm text-stone-600">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm font-semibold text-ink-900">{children}</dd>
    </div>
  )
}
