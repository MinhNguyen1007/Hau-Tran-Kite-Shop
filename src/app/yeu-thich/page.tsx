import type { Metadata } from 'next'
import { WishlistView } from '@/components/wishlist/WishlistView'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Diều tôi thích | Diều Cánh Cốc Hậu Trần',
  // Danh sách riêng của từng khách, không có gì để Google index.
  robots: { index: false, follow: true },
}

export default async function WishlistPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl dark:text-stone-50">
        Diều tôi thích
      </h1>
      <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
        Những mẫu bạn đã lưu. Đăng nhập để danh sách theo bạn sang máy khác.
      </p>
      <WishlistView hotline={settings.hotline} zaloPhone={settings.zaloPhone} />
    </div>
  )
}
