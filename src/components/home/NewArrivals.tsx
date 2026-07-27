// Mục "Diều mới về": tab lọc + rail cuộn ngang, đúng nhịp của thiết kế tham chiếu.
// Server Component — dựng sẵn nội dung từng tab rồi mới đưa vào ProductTabs (client).
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { CATEGORY_TABS, filterByCategory } from '@/lib/kite-categories'
import type { Product } from '@/lib/products'
import { ProductTabs, type ProductTab } from './ProductTabs'

function ProductRail({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <p className="py-14 text-center text-sm text-stone-500 dark:text-stone-400">
        Nhóm này chưa có mẫu nào. Gọi cho xưởng để đặt riêng.
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

export function NewArrivals({ products }: { products: Product[] }) {
  const tabs: ProductTab[] = CATEGORY_TABS.map((tab) => ({
    id: tab.id,
    label: tab.label,
    content: <ProductRail products={filterByCategory(products, tab.id)} />,
  }))

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading title="Diều mới về" />
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
