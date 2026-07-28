// Khối các mẫu sản phẩm: hàng pill lọc theo danh mục + LƯỚI sản phẩm.
// Server Component — dựng sẵn nội dung từng tab rồi mới đưa vào ProductTabs (client).
//
// Đổi từ rail cuộn ngang sang lưới 3 cột (mẫu 2026-07-28): rail chỉ khoe được 2-3 mẫu rồi
// bắt khách kéo, lưới cho thấy hết kho hàng ngay.
//
// Tab lấy từ bảng `categories` thật, không còn đoán nhóm từ slug như kite-categories.ts ngày trước.
import { ArrowRight } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Category } from '@/lib/categories'
import type { Product } from '@/lib/products'
import { ProductTabs, type ProductTab } from './ProductTabs'

function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-stone-300 py-14 text-center text-sm text-stone-500">
        Nhóm này chưa có mẫu nào. Nhắn Zalo cho xưởng để đặt riêng.
      </p>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id}>
          {/* Chỉ ảnh đầu tiên đặt priority: đặt cho cả lưới là ép trình duyệt tải song song
              hàng loạt ảnh lớn, LCP xấu đi chứ không tốt lên. */}
          <ProductCard product={product} priority={i === 0} />
        </li>
      ))}
    </ul>
  )
}

export function NewArrivals({
  products,
  categories,
  title,
}: {
  products: Product[]
  categories: Category[]
  title: string
}) {
  // Hiện ĐỦ mọi danh mục, kể cả danh mục chưa có sản phẩm nào (yêu cầu user 2026-07-27):
  // hàng tab là cách khách thấy shop bán những gì, giấu nhóm rỗng đi thì trông như shop
  // không làm mặt hàng đó. Tab rỗng có sẵn lời mời nhắn Zalo đặt riêng.
  const tabs: ProductTab[] = [
    { id: 'all', label: 'Tất cả', content: <ProductGrid products={products} /> },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      content: <ProductGrid products={products.filter((p) => p.categoryId === category.id)} />,
    })),
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:py-10">
      <SectionHeading title={title} />
      <ProductTabs tabs={tabs} />
      <div className="mt-8 text-center">
        <Link
          href="/san-pham"
          className="group inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-6 py-2.5 text-sm font-semibold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50"
        >
          Xem tất cả sản phẩm
          <ArrowRight
            size={15}
            weight="bold"
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
      </div>
    </section>
  )
}
