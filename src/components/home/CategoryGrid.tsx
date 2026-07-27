// Lưới danh mục: ô cam sọc chéo + ruy-băng tối nghiêng, mô phỏng đúng khối tile trong ảnh
// tham chiếu. Mỗi ô dẫn sang /san-pham?danh-muc=<slug> nên bấm vào là ra đúng nhóm.
//
// Đọc từ bảng `categories` (danh mục THẬT gắn với sản phẩm), admin sửa ở /admin/danh-muc.
// Danh mục có ảnh thì dùng ảnh làm nền; chưa có ảnh thì rơi về dải cam + hình thoi.
import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getCategories } from '@/lib/categories'
import { getSiteSettings } from '@/lib/site-settings'
import { getProductImageUrl } from '@/lib/storage'

export async function CategoryGrid() {
  const [categories, settings] = await Promise.all([getCategories(), getSiteSettings()])
  // Admin gỡ hết danh mục thì bỏ luôn cả khối, không để tiêu đề trơ ra trên khoảng trống.
  if (categories.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading id="danh-muc" title={settings.categoryTitle} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/san-pham?danh-muc=${encodeURIComponent(category.slug)}`}
            className="stripe-brand group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-3 transition-transform hover:-translate-y-0.5 md:p-4"
          >
            {category.imagePath ? (
              <Image
                src={getProductImageUrl(category.imagePath)}
                alt=""
                fill
                sizes="(max-width: 768px) 45vw, 300px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div
                className="absolute -right-4 -top-4 h-28 w-28 rotate-45 rounded-2xl border-4 border-white/25 transition-transform duration-300 group-hover:scale-110"
                aria-hidden
              />
            )}

            <span className="relative -rotate-2 rounded-md bg-ink-950/85 px-3 py-2 text-[13px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-lg md:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
