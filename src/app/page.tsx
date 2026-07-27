// Trang chủ — bố cục theo thiết kế tham chiếu (public/images/anh.png):
// banner → dải cam kết → các mẫu diều (tab) → khuyến mãi → danh mục → giới thiệu → kinh nghiệm.
import { AboutStrip } from '@/components/home/AboutStrip'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { GuideCards } from '@/components/home/GuideCards'
import { HeroBanner } from '@/components/home/HeroBanner'
import { NewArrivals } from '@/components/home/NewArrivals'
import { PromoBanners } from '@/components/home/PromoBanners'
import { TrustStrip } from '@/components/home/TrustStrip'
import { getCategories } from '@/lib/categories'
import { getProducts, type Product } from '@/lib/products'
import { getSiteSettings } from '@/lib/site-settings'

// Trang chủ không được trắng chỉ vì Supabase local đang tắt — hỏng thì rail sản phẩm rỗng,
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
      <TrustStrip />
      <NewArrivals products={products} categories={categories} title={settings.productsTitle} />
      <PromoBanners />
      <CategoryGrid />
      <AboutStrip />
      <GuideCards />
    </>
  )
}
