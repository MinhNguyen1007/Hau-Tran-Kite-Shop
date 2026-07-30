import { NavMenuForm } from '@/components/admin/NavMenuForm'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { getNavItemsForAdmin } from '@/lib/nav-items'
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

  const [settings, navItems] = await Promise.all([getSiteSettings(), getNavItemsForAdmin()])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Thông tin shop"
        description="Số điện thoại, email, các đoạn giới thiệu, menu chính và tiêu đề những khối hiện trên trang chủ."
      />

      <Panel>
        <SettingsForm settings={settings} />
      </Panel>

      {/* Menu để RIÊNG một panel chứ không nhét vào SettingsForm: nó là một DANH SÁCH có thứ tự,
          lưu bằng route khác (/api/admin/menu), và trộn vào form 15 ô kia thì một chữ gõ sai ở
          menu chặn luôn việc lưu số điện thoại. */}
      <Panel
        title="Menu chính trên header"
        bodyClassName="p-4 md:p-5"
      >
        <p className="mb-4 text-sm leading-relaxed text-stone-600">
          Các mục hiện ở giữa thanh header và trong menu trên điện thoại. Kéo thứ tự bằng hai nút
          mũi tên; bỏ dấu “Hiện trên menu” để tạm ẩn một mục mà không mất chữ đã ghi.
        </p>
        <NavMenuForm items={navItems} />
      </Panel>
    </div>
  )
}
