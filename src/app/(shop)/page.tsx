// Trang chủ: hero → các mẫu sản phẩm (tab + lưới) → danh mục → giới thiệu → dải liên hệ.
//
// Dải cam kết (TrustStrip cũ) đã gộp thẳng vào hero từ 2026-07-28 theo mẫu user đưa, nên
// không còn section riêng. Khối khuyến mãi cũng đã bỏ hẳn cùng ngày theo yêu cầu user —
// kéo theo cả `content_blocks` section 'promo' và mục nav '/#khuyen-mai'. Đừng dựng lại.
import { AboutStrip } from '@/components/home/AboutStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { ContactBand } from '@/components/home/ContactBand'
import { HeroBanner } from '@/components/home/HeroBanner'
import { NewArrivals } from '@/components/home/NewArrivals'
import { getCategories } from '@/lib/categories'
import { getProducts, type Product } from '@/lib/products'
import { getSiteSettings } from '@/lib/site-settings'

// Trang chủ không được trắng chỉ vì Supabase local đang tắt — hỏng thì lưới sản phẩm rỗng,
// phần còn lại vẫn lên. (Trang /san-pham vẫn để lỗi nổi lên như cũ.)
async function loadProducts(): Promise<Product[]> {
  try {
    return await getProducts()
  } catch {
    return []
  }
}

export default async function Home() {
  const [products, categories, settings] = await Promise.all([
    loadProducts(),
    getCategories(),
    getSiteSettings(),
  ])

  return (
    <>
      <HeroBanner />
      <NewArrivals products={products} categories={categories} title={settings.productsTitle} />
      <CategoryGrid />
      <AboutStrip />
      <ContactBand />
    </>
  )
}
