// Khối các mẫu diều: tab lọc theo danh mục + rail cuộn ngang, đúng nhịp của thiết kế tham chiếu.
// Server Component — dựng sẵn nội dung từng tab rồi mới đưa vào ProductTabs (client).
//
// Tab lấy từ bảng `categories` thật, không còn đoán nhóm từ slug như kite-categories.ts ngày trước.
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import type { Category } from '@/lib/categories'
import type { Product } from '@/lib/products'
import { ProductTabs, type ProductTab } from './ProductTabs'

function ProductRail({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-14 text-center text-sm text-stone-500 dark:text-stone-400">
        Nhóm này chưa có mẫu nào. Nhắn Zalo cho xưởng để đặt riêng.
      </p>
    )
  }

  return (
    <ul className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 md:gap-4">
      {products.map((product, i) => (
        <li key={product.id} className="w-[64vw] max-w-[248px] shrink-0 snap-start sm:w-[236px]">
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
    { id: 'all', label: 'Tất cả', content: <ProductRail products={products} /> },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
      content: (
        <ProductRail products={products.filter((p) => p.categoryId === category.id)} />
      ),
    })),
  ]

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading title={title} />
      <ProductTabs tabs={tabs} />
      <div className="mt-5 text-center">
        <Link
          href="/san-pham"
          className="inline-flex rounded-full border-2 border-brand-500 px-6 py-2.5 text-sm font-bold text-brand-700 transition-colors hover:bg-brand-600 hover:text-white dark:text-brand-400 dark:hover:text-white"
        >
          Xem tất cả diều
        </Link>
      </div>
    </section>
  )
}
