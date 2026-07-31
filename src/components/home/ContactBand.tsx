// Dải kêu gọi liên hệ ngay trên footer. Chiếm đúng vị trí khối "đăng ký nhận tin" của mẫu
// user đưa, nhưng KHÔNG phải form nhận email: web này không có bản tin, không có bảng người
// đăng ký, dựng một ô nhập chỉ để giống ảnh là làm nút bấm vào không ra gì.
//
// Việc tương đương ở đây là nhắn Zalo / gọi — đúng cách shop chốt đơn.
// Chữ lấy từ site_settings (admin sửa ở /admin/cai-dat), không viết cứng trong component.
import { ContactCta } from '@/components/contact/ContactCta'
import { getSiteSettings } from '@/lib/site-settings'

export async function ContactBand() {
  const settings = await getSiteSettings()

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-12 pt-4 md:pb-16">
      <div className="reveal-on-scroll rounded-3xl border border-stone-200 bg-white px-6 py-12 text-center md:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-stone-400">
          {settings.area}
        </p>

        <h2 className="mt-4 text-2xl font-bold tracking-tighter text-ink-950 md:text-3xl">
          {settings.ctaTitle}
        </h2>

        {settings.ctaBody && (
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-stone-600">
            {settings.ctaBody}
          </p>
        )}

        <ContactCta
          hotline={settings.hotline}
          zaloPhone={settings.zaloPhone}
          source="home_cta"
          className="mx-auto mt-8 max-w-md justify-center"
        />
      </div>
    </section>
  )
}
