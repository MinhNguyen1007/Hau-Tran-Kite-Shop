// Giới thiệu xưởng — dùng ảnh thật của chủ xưởng (public/images/shop_owner_avatar.jpg).
// Tiêu đề và các đoạn văn do admin sửa ở /admin/cai-dat.
import Image from 'next/image'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { telHref } from '@/lib/shop'
import { getSiteSettings, toParagraphs } from '@/lib/site-settings'

export async function AboutStrip() {
  const settings = await getSiteSettings()
  const paragraphs = toParagraphs(settings.aboutBody)

  return (
    <section id="gioi-thieu" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-8 md:py-10">
      <SectionHeading title={settings.aboutHeading} />

      <div className="grid items-center gap-8 rounded-2xl border border-stone-200 bg-white p-6 md:grid-cols-[220px_1fr] md:gap-12 md:p-10">
        <Image
          src="/images/shop_owner_avatar.jpg"
          alt="Chủ xưởng diều Hậu Trần"
          width={480}
          height={480}
          sizes="(max-width: 768px) 160px, 220px"
          className="mx-auto h-40 w-40 rounded-2xl object-cover md:h-[220px] md:w-[220px]"
        />

        <div>
          <p className="text-lg font-semibold tracking-tight text-ink-950 md:text-xl">
            {settings.aboutTitle}
          </p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-[15px] leading-relaxed text-stone-600">
              {paragraph}
            </p>
          ))}
          <a
            href={telHref(settings.hotline)}
            className="mt-6 inline-flex rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            Gọi {settings.hotline}
          </a>
        </div>
      </div>
    </section>
  )
}
