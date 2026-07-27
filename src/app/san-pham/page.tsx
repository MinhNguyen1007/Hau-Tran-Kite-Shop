import type { Metadata } from 'next'
import Link from 'next/link'
import { SearchTracker } from '@/components/analytics/SearchTracker'
import { ProductCard } from '@/components/product/ProductCard'
import { getCategories } from '@/lib/categories'
import { getProducts } from '@/lib/products'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: `Sản phẩm | ${settings.shopName}`,
    description: 'Diều cánh cốc thủ công: khung tre, phất giấy dó, làm theo lối truyền thống.',
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; 'danh-muc'?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const categorySlug = params['danh-muc']?.trim() ?? ''

  const [products, categories] = await Promise.all([
    getProducts({ query, categorySlug: categorySlug || undefined }),
    getCategories(),
  ])

  const activeCategory = categories.find((category) => category.slug === categorySlug)
  const filtered = query !== '' || categorySlug !== ''

  const heading = query
    ? `Kết quả cho “${query}”`
    : (activeCategory?.name ?? 'Tất cả diều')

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:py-12">
      {query && <SearchTracker query={query} resultCount={products.length} />}

      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl dark:text-stone-50">
          {heading}
        </h1>
        <p className="mt-2 max-w-prose text-sm text-stone-600 dark:text-stone-400">
          {query
            ? `${products.length} mẫu khớp từ khoá.`
            : (activeCategory?.description ||
              'Diều thủ công khung tre, phất giấy dó, làm theo lối truyền thống.')}
        </p>

        {/* Chip lọc danh mục — cùng dữ liệu với lưới danh mục ở trang chủ. */}
        {categories.length > 0 && (
          <nav className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
            <CategoryChip href="/san-pham" label="Tất cả" active={!activeCategory} />
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                href={`/san-pham?danh-muc=${encodeURIComponent(category.slug)}`}
                label={category.name}
                active={activeCategory?.id === category.id}
              />
            ))}
          </nav>
        )}

        {filtered && (
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
            {filtered ? 'Không tìm thấy mẫu nào.' : 'Chưa có sản phẩm nào.'}
          </p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Xưởng nhận đặt riêng theo kích cỡ và hoạ tiết, nhắn Zalo để được tư vấn mẫu.
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

function CategoryChip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
        active
          ? 'bg-brand-600 text-white'
          : 'border border-stone-300 text-stone-700 hover:border-brand-600 hover:text-brand-700 dark:border-ink-700 dark:text-stone-300 dark:hover:text-brand-400'
      }`}
    >
      {label}
    </Link>
  )
}
