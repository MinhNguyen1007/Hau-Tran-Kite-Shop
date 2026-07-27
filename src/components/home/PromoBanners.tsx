// Dải khuyến mãi. Bố cục lệch (1 ô lớn + 2 ô nhỏ) thay vì 3 ô bằng nhau như bản gốc,
// để mắt có điểm dừng. Nội dung do admin sửa ở /admin/noi-dung (section 'promo').
import { ArrowRight } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBlocks } from '@/lib/content-blocks'

// Nền của từng ô không cho admin sửa (sẽ thành cái bẫy phối màu). Xoay vòng theo vị trí để
// dù admin thêm bao nhiêu ô thì vẫn ra dải màu có chủ ý.
const BACKGROUNDS = [
  'bg-gradient-to-br from-ink-950 via-ink-800 to-brand-700',
  'bg-gradient-to-br from-brand-700 to-brand-900',
  'bg-gradient-to-br from-ink-800 via-ink-700 to-brand-800',
]

export async function PromoBanners() {
  const promos = await getBlocks('promo')
  if (promos.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading id="khuyen-mai" title="Đang khuyến mãi" />

      <div className="grid gap-3 md:gap-4 lg:grid-cols-4 lg:grid-rows-2">
        {promos.map((promo, index) => {
          // Ô ĐẦU TIÊN theo thứ tự sắp xếp là ô lớn — admin đổi thứ tự là đổi được ô nào to.
          const big = index === 0

          return (
            <Link
              key={promo.id}
              href={promo.href || '/san-pham'}
              className={`stripe-brand group relative flex flex-col justify-end overflow-hidden rounded-2xl p-5 text-white transition-transform hover:-translate-y-0.5 md:p-6 ${
                BACKGROUNDS[index % BACKGROUNDS.length]
              } ${big ? 'min-h-[200px] lg:col-span-2 lg:row-span-2 lg:min-h-[280px]' : 'min-h-[150px]'}`}
            >
              {promo.subtitle && (
                <span
                  className={`font-extrabold uppercase leading-none tracking-tight text-gold-300 ${
                    big ? 'text-4xl md:text-5xl' : 'text-2xl'
                  }`}
                >
                  {promo.subtitle}
                </span>
              )}
              <span className={`mt-2 font-bold ${big ? 'text-xl md:text-2xl' : 'text-base'}`}>
                {promo.title}
              </span>
              {promo.body && <span className="mt-1 text-sm text-white/85">{promo.body}</span>}
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white">
                Xem mẫu
                <ArrowRight
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
