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
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading id="gioi-thieu" title={settings.aboutHeading} />

      <div className="grid items-center gap-6 rounded-2xl border border-stone-200 bg-white p-5 md:grid-cols-[220px_1fr] md:gap-10 md:p-8 dark:border-ink-700 dark:bg-ink-900">
        <Image
          src="/images/shop_owner_avatar.jpg"
          alt="Chủ xưởng diều Hậu Trần"
          width={480}
          height={480}
          sizes="(max-width: 768px) 160px, 220px"
          className="mx-auto h-40 w-40 rounded-2xl object-cover md:h-[220px] md:w-[220px]"
        />

        <div>
          <p className="text-lg font-bold text-ink-900 md:text-xl dark:text-stone-50">
            {settings.aboutTitle}
          </p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="mt-3 leading-relaxed text-stone-600 dark:text-stone-400">
              {paragraph}
            </p>
          ))}
          <a
            href={telHref(settings.hotline)}
            className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
          >
            Gọi {settings.hotline}
          </a>
        </div>
      </div>
    </section>
  )
}
