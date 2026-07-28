import { Envelope, MapPin, Phone } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/ContactForm'
import { telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

// generateMetadata chứ không phải hằng `metadata`: tên shop và hotline nằm trong site_settings,
// admin sửa xong thì cả thẻ <title> lẫn description phải đổi theo.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: `Liên hệ | ${settings.shopName}`,
    description: `Đặt diều cánh cốc theo yêu cầu. Gọi ${settings.hotline} hoặc để lại lời nhắn, shop gọi lại trong ngày.`,
  }
}

export default async function ContactPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl">
        Liên hệ
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-stone-600">
        Đặt diều theo kích cỡ và hoạ tiết riêng, hỏi giá sáo, hay cần tư vấn chọn diều cho trẻ:
        gọi hotline hoặc để lại lời nhắn dưới đây.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_18rem] md:items-start">
        <ContactForm />

        <aside className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5">
          <h2 className="text-base font-extrabold text-ink-900">
            {settings.shopName}
          </h2>

          <a
            href={telHref(settings.hotline)}
            className="flex items-start gap-3 text-sm font-semibold text-stone-800 transition-colors hover:text-ink-950"
          >
            <Phone size={18} weight="fill" className="mt-0.5 shrink-0 text-stone-400" />
            {settings.hotline}
          </a>

          <a
            href={`mailto:${settings.email}`}
            className="flex items-start gap-3 break-all text-sm text-stone-700 transition-colors hover:text-ink-950"
          >
            <Envelope size={18} weight="fill" className="mt-0.5 shrink-0 text-stone-400" />
            {settings.email}
          </a>

          <span className="flex items-start gap-3 text-sm text-stone-700">
            <MapPin size={18} weight="fill" className="mt-0.5 shrink-0 text-stone-400" />
            {settings.address || settings.area}
          </span>

          {settings.openHours && (
            <span className="text-sm text-stone-600">{settings.openHours}</span>
          )}
        </aside>
      </div>
    </div>
  )
}
