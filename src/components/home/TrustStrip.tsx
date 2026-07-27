// Dải cam kết 4 ô ngay dưới banner (nhịp giống thiết kế tham chiếu).
// Nội dung do admin sửa ở /admin/noi-dung (section 'trust').
import { ContentIcon } from '@/components/ui/ContentIcon'
import { getBlocks } from '@/lib/content-blocks'
import { getSiteSettings } from '@/lib/site-settings'

export async function TrustStrip() {
  const [items, settings] = await Promise.all([getBlocks('trust'), getSiteSettings()])
  if (items.length === 0) return null

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-3 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3.5 dark:border-ink-700 dark:bg-ink-900"
        >
          {/* Chip cam đặc + icon trắng: bản duotone trên nền sáng bị nhạt gần như mất hút. */}
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
            <ContentIcon name={item.icon} size={22} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-ink-900 dark:text-stone-50">
              {item.title}
            </span>
            {/* Ô nào bỏ trống mô tả thì lấy hotline — số điện thoại chỉ khai ở site_settings,
                đổi số không phải sửa từng ô nội dung. */}
            <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
              {item.body || `Gọi ${settings.hotline}`}
            </span>
          </span>
        </div>
      ))}
    </section>
  )
}
