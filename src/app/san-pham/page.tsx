import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchTracker } from '@/components/analytics/SearchTracker'
import { ProductCard } from '@/components/product/ProductCard'
import { getProducts } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Sản phẩm | Diều Cánh Cốc Hậu Trần',
  description: 'Diều cánh cốc thủ công: khung tre, phất giấy dó, làm theo lối truyền thống.',
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = q?.trim() ?? ''
  const products = await getProducts({ query })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      {query && <SearchTracker query={query} resultCount={products.length} />}

      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl dark:text-stone-50">
          {query ? `Kết quả cho “${query}”` : 'Tất cả diều'}
        </h1>
        <p className="mt-2 max-w-prose text-sm text-stone-600 dark:text-stone-400">
          {query
            ? `${products.length} mẫu khớp từ khoá.`
            : 'Diều thủ công khung tre, phất giấy dó, làm theo lối truyền thống.'}
        </p>
        {query && (
          <Link
            href="/san-pham"
            className="mt-3 inline-flex text-sm font-bold text-brand-700 hover:underline dark:text-brand-400"
          >
            Bỏ lọc, xem tất cả
          </Link>
        )}
      </header>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 px-4 py-20 text-center dark:border-ink-700">
          <p className="font-semibold text-ink-900 dark:text-stone-100">
            {query ? 'Không tìm thấy mẫu nào khớp từ khoá.' : 'Chưa có sản phẩm nào.'}
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Xưởng nhận đặt riêng theo kích cỡ và hoạ tiết, gọi để được tư vấn mẫu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} priority={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}
