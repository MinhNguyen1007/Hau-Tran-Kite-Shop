// Hero theo mẫu user đưa 2026-07-28: cột chữ bên trái (nhãn pill, tiêu đề lớn, đoạn mô tả,
// hai nút, dải cam kết), bên phải banner của shop.
//
// Banner là poster thật shop_background.jpg (user chọn 2026-07-28). Poster đã in sẵn tên shop,
// ba dòng cam kết và số điện thoại nên KHÔNG overlay chữ lên nó, và để `object-contain` chứ
// không `object-cover` — cắt là mất chữ trong ảnh.
//
// Cũng vì poster là ảnh NGANG 16:9 nên ở đây không có vòng tròn xám như mẫu gốc: vòng tròn đó
// để ôm một tấm sản phẩm cắt nền, nhét ảnh ngang vào là thừa ra hai mảng trống hai bên.
import { ArrowRight, Phone } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

export async function HeroBanner() {
  const settings = await getSiteSettings()

  return (
    // Tỉ lệ cột nghiêng hẳn về phía ảnh (user 2026-08-02: "banner to ra"). Poster là tài sản
    // quảng cáo thật của shop - nó đã in tên shop, cam kết và số điện thoại - nên nó xứng đáng
    // nhiều chỗ hơn cột chữ. minmax(0,…) chứ không để `0.7fr` trần: item lưới mặc định
    // min-width:auto, ảnh rộng sẽ tự nống cột ra và phá đúng tỉ lệ vừa đặt.
    <section className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 pb-10 pt-6 sm:gap-10 sm:pb-12 sm:pt-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-10 lg:pb-16 lg:pt-12">
      <div className="max-w-xl">
        <h1 className="reveal text-balance text-4xl font-bold leading-[1.05] tracking-tighter text-ink-950 sm:text-5xl lg:text-6xl">
          {settings.shopName}
        </h1>

        {settings.heroNote && (
          <p className="reveal mt-5 max-w-md text-pretty text-[15px] leading-relaxed text-stone-600 sm:mt-6 lg:text-base [animation-delay:160ms]">
            {settings.heroNote}
          </p>
        )}

        <div className="reveal mt-8 flex flex-wrap gap-3 [animation-delay:240ms]">
          <Link
            href="/san-pham"
            className="group inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
          >
            Xem sản phẩm
            <ArrowRight
              size={16}
              weight="bold"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
          {/* Gọi/Zalo là "nút chốt đơn" thật của shop nên đứng ngang hàng nút xem hàng. */}
          <a
            href={telHref(settings.hotline)}
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50 active:scale-[0.98]"
          >
            <Phone size={16} weight="fill" />
            Gọi {settings.hotline}
          </a>
        </div>

        {/* Dải cam kết đã XOÁ 2026-07-28 cùng bảng content_blocks: bảng đó không còn dòng
            nào, panel admin của nó rỗng nên user cho gỡ hẳn. Đừng dựng lại. */}
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white sm:rounded-3xl">
        <Image
          src="/images/shop_background.jpg"
          alt="Bộ sưu tập diều cánh cốc của xưởng Hậu Trần trải trên sân thượng lúc hoàng hôn"
          width={1671}
          height={949}
          priority
          // Phải khớp bề rộng THẬT sau khi đổi tỉ lệ cột (~780px ở khung 1280px), không thì
          // trình duyệt chọn bản ảnh nhỏ hơn ô hiển thị và poster bị nhoè đúng chỗ có chữ.
          sizes="(max-width: 1024px) 100vw, 800px"
          className="w-full object-contain"
        />
      </div>
    </section>
  )
}
