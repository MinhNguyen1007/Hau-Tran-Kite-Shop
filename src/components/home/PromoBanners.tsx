// Dải khuyến mãi. Bố cục lệch (1 ô lớn + 2 ô nhỏ) thay vì 3 ô bằng nhau, để mắt có điểm dừng.
// Nội dung do admin sửa ở /admin/noi-dung (section 'promo').
//
// Bản 2026-07-28 bỏ nền cam gradient + sọc chéo, đổi sang nền ink đặc / ảnh phủ lớp tối cho
// khớp tông trung tính của storefront mới.
import { ArrowRight } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBlocks } from '@/lib/content-blocks'
import { getSiteSettings } from '@/lib/site-settings'
import { getProductImageUrl } from '@/lib/storage'

export async function PromoBanners() {
  const [promos, settings] = await Promise.all([getBlocks('promo'), getSiteSettings()])
  if (promos.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <SectionHeading id="khuyen-mai" title={settings.promoTitle} />

      <div className="grid gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {promos.map((promo, index) => {
          // Ô ĐẦU TIÊN theo thứ tự sắp xếp là ô lớn — admin đổi thứ tự là đổi được ô nào to.
          const big = index === 0

          return (
            <Link
              key={promo.id}
              href={promo.href || '/san-pham'}
              className={`group relative flex flex-col justify-end overflow-hidden rounded-2xl bg-ink-950 p-6 text-white transition-transform hover:-translate-y-0.5 ${
                big ? 'min-h-[220px] lg:col-span-2 lg:row-span-2 lg:min-h-[300px]' : 'min-h-[150px]'
              }`}
            >
              {/* Ảnh admin tải lên làm nền. Phủ lớp tối vì chữ ở đây luôn màu trắng —
                  ảnh sáng mà không phủ là chữ mất hút. */}
              {promo.imagePath && (
                <>
                  <Image
                    src={getProductImageUrl(promo.imagePath)}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 640px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-ink-950/60" aria-hidden />
                </>
              )}

              {/* relative: ảnh nền và lớp phủ ở trên là absolute, chữ không positioned sẽ bị
                  chúng đè lên. */}
              <span className="relative flex flex-col">
                {promo.subtitle && (
                  <span
                    className={`font-bold leading-none tracking-tighter ${
                      big ? 'text-4xl md:text-5xl' : 'text-2xl'
                    }`}
                  >
                    {promo.subtitle}
                  </span>
                )}
                <span className={`mt-2 font-semibold ${big ? 'text-lg md:text-xl' : 'text-[15px]'}`}>
                  {promo.title}
                </span>
                {promo.body && (
                  <span className="mt-1 text-sm leading-relaxed text-white/75">{promo.body}</span>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  Xem mẫu
                  <ArrowRight
                    size={15}
                    weight="bold"
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
