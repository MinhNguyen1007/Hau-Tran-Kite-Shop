import { SettingsForm } from '@/components/admin/SettingsForm'
import { getSiteSettings } from '@/lib/site-settings'
import { requireAdmin } from '@/lib/supabase'

export default async function AdminSettingsPage() {
  // Layout /admin đã chặn người lạ, nhưng kiểm lại ở đây: layout chỉ che giao diện,
  // trang này tự đọc dữ liệu nên tự chịu trách nhiệm về quyền (xem CLAUDE.md).
  await requireAdmin()

  const settings = await getSiteSettings()

  return (
    <div>
      <h1 className="text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Thông tin shop
      </h1>
      <p className="mb-6 mt-1 text-sm text-stone-600 dark:text-stone-400">
        Số điện thoại, email và các đoạn giới thiệu hiện trên toàn bộ trang web.
      </p>

      <SettingsForm settings={settings} />
    </div>
  )
}
