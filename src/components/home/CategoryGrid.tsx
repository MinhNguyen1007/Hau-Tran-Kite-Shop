// Lưới danh mục. Mỗi ô dẫn sang /san-pham?danh-muc=<slug> nên bấm vào là ra đúng nhóm.
//
// Đọc từ bảng `categories` (danh mục THẬT gắn với sản phẩm), admin sửa ở /admin/danh-muc.
//
// Bản 2026-07-28 bỏ ô cam sọc chéo + ruy-băng nghiêng, đổi sang thẻ trắng ảnh vuông + tên
// nằm dưới, cùng ngôn ngữ với card sản phẩm.
import { Wind } from '@phosphor-icons/react/ssr'
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
    // scroll-mt: header dính trên đầu, không chừa chỗ thì nhảy neo bị header che mất tiêu đề.
    <section id="danh-muc" className="mx-auto w-full max-w-7xl scroll-mt-24 px-4 py-8 md:py-10">
      <SectionHeading title={settings.categoryTitle} />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/san-pham?danh-muc=${encodeURIComponent(category.slug)}`}
            className="reveal-on-scroll group overflow-hidden rounded-2xl border border-stone-200 bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-stone-900/5"
          >
            {/* Ô thấp hơn trên điện thoại: sáu ô 4/3 xếp hai cột ăn gần hết một màn hình,
                khách phải vuốt rất lâu mới qua hết khối này. */}
            <div className="relative aspect-[5/3] overflow-hidden bg-stone-50 sm:aspect-[4/3]">
              {category.imagePath ? (
                <Image
                  src={getProductImageUrl(category.imagePath)}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 45vw, 300px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                // Danh mục chưa có ảnh thì ô này phải trông CỐ Ý, không phải trông hỏng. Bản cũ
                // là một hình thoi viền xám giữa ô trắng: sáu ô như vậy cạnh nhau đọc ra thành
                // "web chưa làm xong". Nền chuyển sắc + dấu gió của thương hiệu thì vẫn là chỗ
                // trống, nhưng là chỗ trống có chủ ý.
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200/70"
                  aria-hidden
                >
                  <Wind size={30} weight="fill" className="text-stone-300" />
                </div>
              )}
            </div>
            <span className="block px-3 py-2.5 text-[13px] font-semibold text-ink-950 sm:px-4 sm:py-3 sm:text-sm">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
