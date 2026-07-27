import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ContactCta } from '@/components/contact/ContactCta'
import { ProductViewTracker } from '@/components/product/ProductViewTracker'
import { WishlistButton } from '@/components/product/WishlistButton'
import { formatVnd } from '@/lib/format'
import { getProductBySlug } from '@/lib/products'
import { getSiteSettings } from '@/lib/site-settings'
import { getProductImageUrl } from '@/lib/storage'
import { toWishlistItem } from '@/lib/wishlist'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return { title: product ? `${product.name} | Diều Cánh Cốc Hậu Trần` : 'Không tìm thấy sản phẩm' }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()])
  if (!product) notFound()

  const soldOut = product.stock === 0

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
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800">
          {product.imagePath ? (
            <Image
              src={getProductImageUrl(product.imagePath)}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover ${soldOut ? 'opacity-60' : ''}`}
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100 dark:from-ink-800 dark:to-ink-900">
              <div
                className="h-24 w-24 rotate-45 rounded-lg border-2 border-brand-300 dark:border-brand-700"
                aria-hidden
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
            {product.name}
          </h1>
          <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">
            {formatVnd(product.priceVnd)}
          </p>
          {product.description && (
            <p className="leading-relaxed text-stone-600 dark:text-stone-300">{product.description}</p>
          )}
          <p className="text-sm text-stone-500 dark:text-stone-400">
            {soldOut ? 'Tạm hết hàng — shop nhận đặt làm' : `Còn ${product.stock} chiếc`}
          </p>

          {/* Web không nhận đơn: khách lưu mẫu rồi nhắn Zalo/gọi để shop tư vấn và chốt. */}
          <div className="flex flex-col gap-3">
            <div className="max-w-xs">
              <WishlistButton item={toWishlistItem(product)} variant="detail" />
            </div>
            <ContactCta
              hotline={settings.hotline}
              zaloPhone={settings.zaloPhone}
              productId={product.id}
              source="product_detail"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
