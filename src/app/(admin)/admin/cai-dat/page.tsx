import { PageHeader, Panel } from '@/components/admin/Panel'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { getSiteSettings } from '@/lib/site-settings'
import { requireAdmin } from '@/lib/supabase'

// Bảng `content_blocks` và mọi thứ quanh nó đã XOÁ HẲN 2026-07-28 theo yêu cầu user.
// Nó từng là dải cam kết 4 ô dưới banner; cuối cùng còn 0 dòng nên panel admin không có gì để
// sửa, còn trang chủ thì không hiện gì. Đừng dựng lại: chữ trên trang chủ giờ nằm hết trong
// site_settings, sửa ngay ở form dưới đây.
export default async function AdminSettingsPage() {
  // Layout /admin đã chặn người lạ, nhưng kiểm lại ở đây: layout chỉ che giao diện,
  // trang này tự đọc dữ liệu nên tự chịu trách nhiệm về quyền (xem CLAUDE.md).
  await requireAdmin()

  const settings = await getSiteSettings()

  return (
    <div>
      <PageHeader
        title="Thông tin shop"
        description="Số điện thoại, email, các đoạn giới thiệu và tiêu đề những khối hiện trên trang chủ."
      />

      <Panel>
        <SettingsForm settings={settings} />
      </Panel>
    </div>
  )
}
