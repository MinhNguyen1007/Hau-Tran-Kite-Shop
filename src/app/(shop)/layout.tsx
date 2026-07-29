import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'

// Vỏ của phần khách nhìn thấy. Tách khỏi root layout 2026-07-28 để /admin dùng được vỏ
// riêng — route group (shop) không đổi đường dẫn, /san-pham vẫn là /san-pham.
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  )
}
