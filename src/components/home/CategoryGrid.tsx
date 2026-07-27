// Lưới danh mục: ô cam sọc chéo + ruy-băng tối nghiêng, mô phỏng đúng khối tile trong ảnh
// tham chiếu. Mỗi ô dẫn thẳng sang /san-pham với từ khoá tương ứng nên bấm vào là ra kết quả thật.
// Nội dung do admin sửa ở /admin/noi-dung (section 'category').
import Link from 'next/link'
import { ContentIcon } from '@/components/ui/ContentIcon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBlocks } from '@/lib/content-blocks'

export async function CategoryGrid() {
  const categories = await getBlocks('category')
  // Admin ẩn hết danh mục thì bỏ luôn cả khối, không để tiêu đề trơ ra trên khoảng trống.
  if (categories.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading id="danh-muc" title="Danh mục diều" />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href || '/san-pham'}
            className="stripe-brand group relative flex aspect-[4/3] items-end overflow-hidden rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 p-3 transition-transform hover:-translate-y-0.5 md:p-4"
          >
            <ContentIcon
              name={category.icon}
              size={104}
              weight="duotone"
              className="absolute -right-3 -top-3 text-white/25 transition-transform duration-300 group-hover:scale-110"
            />
            <span className="relative -rotate-2 rounded-md bg-ink-950/85 px-3 py-2 text-[13px] font-extrabold uppercase leading-tight tracking-wide text-white shadow-lg md:text-sm">
              {category.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
