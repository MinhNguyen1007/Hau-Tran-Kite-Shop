import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductOrderPanel } from '@/components/product/ProductOrderPanel'
import { ProductViewTracker } from '@/components/product/ProductViewTracker'
import { formatProductPrice } from '@/lib/product-shared'
import { getProductBySlug } from '@/lib/products'
import { getSiteSettings } from '@/lib/site-settings'
import { toWishlistItem } from '@/lib/wishlist'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  return {
    title: product ? `${product.name} | ${settings.shopName}` : 'Không tìm thấy sản phẩm',
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  // Ảnh bìa đứng đầu rồi tới bộ ảnh chi tiết. Lọc trùng phòng khi admin lỡ thêm lại ảnh bìa.
  const gallery = [
    ...(product.imagePath ? [product.imagePath] : []),
    ...product.images.map((image) => image.imagePath),
  ].filter((path, index, all) => all.indexOf(path) === index)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      <ProductViewTracker productId={product.id} />

      <Link
        href="/san-pham"
        className="mb-6 inline-block text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
      >
        ← Tất cả sản phẩm
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <ProductGallery paths={gallery} name={product.name} />

        <div className="flex flex-col gap-5">
          {product.categoryName && (
            <span className="w-fit rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-ink-800 dark:text-brand-400">
              {product.categoryName}
            </span>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
            {product.name}
          </h1>

          <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {formatProductPrice(product)}
          </p>

          {product.description && (
            <p className="leading-relaxed text-stone-600 dark:text-stone-300">
              {product.description}
            </p>
          )}

          {/* Web không nhận đơn: khách chọn cỡ, lưu mẫu rồi nhắn Zalo/gọi để shop chốt. */}
          <ProductOrderPanel
            productId={product.id}
            sizes={product.sizes}
            wishlistItem={toWishlistItem(product)}
            hotline={settings.hotline}
            zaloPhone={settings.zaloPhone}
          />
        </div>
      </div>
    </div>
  )
}
