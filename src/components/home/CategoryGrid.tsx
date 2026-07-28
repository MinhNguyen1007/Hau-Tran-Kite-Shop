// Lưới danh mục. Mỗi ô dẫn sang /san-pham?danh-muc=<slug> nên bấm vào là ra đúng nhóm.
//
// Đọc từ bảng `categories` (danh mục THẬT gắn với sản phẩm), admin sửa ở /admin/danh-muc.
//
// Bản 2026-07-28 bỏ ô cam sọc chéo + ruy-băng nghiêng, đổi sang thẻ trắng ảnh vuông + tên
// nằm dưới, cùng ngôn ngữ với card sản phẩm.
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
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <SectionHeading id="danh-muc" title={settings.categoryTitle} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/san-pham?danh-muc=${encodeURIComponent(category.slug)}`}
            className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-900/5"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-stone-50">
              {category.imagePath ? (
                <Image
                  src={getProductImageUrl(category.imagePath)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <div
                    className="h-12 w-12 rotate-45 rounded-md border-2 border-stone-300"
                    aria-hidden
                  />
                </div>
              )}
            </div>
            <span className="block px-4 py-3 text-sm font-semibold text-ink-950">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
