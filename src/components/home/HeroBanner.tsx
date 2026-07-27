// Banner đầu trang. Dùng đúng poster thật của shop (public/images/shop_background.jpg) —
// poster đã có tên shop, cam kết và số điện thoại nên KHÔNG overlay chữ đè lên,
// CTA đặt ở dải tối ngay dưới ảnh.
import Image from 'next/image'
import Link from 'next/link'
import { telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

export async function HeroBanner() {
  const settings = await getSiteSettings()

  return (
    <section className="bg-ink-950">
      <div className="mx-auto w-full max-w-7xl">
        <Image
          src="/images/shop_background.jpg"
          alt="Bộ sưu tập diều cánh cốc của xưởng Hậu Trần trải trên sân thượng lúc hoàng hôn"
          width={1671}
          height={949}
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="max-h-[62vh] w-full object-contain"
        />
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-stone-300 sm:text-base">
            {settings.heroNote}
          </p>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link
              href="/san-pham"
              className="rounded-full bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
            >
              Xem tất cả sản phẩm
            </Link>
            <a
              href={telHref(settings.hotline)}
              className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              Gọi {settings.hotline}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
