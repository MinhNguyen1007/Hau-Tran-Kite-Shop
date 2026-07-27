// PUT /api/admin/cai-dat — sửa cấu hình chung của shop (bảng site_settings, một dòng duy nhất).
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { SiteSettingsSchema } from '@/lib/content-schema'
import { updateSiteSettings } from '@/lib/site-settings'
import { requireAdmin } from '@/lib/supabase'

// PUT chứ không PATCH: form gửi lên TOÀN BỘ cấu hình mỗi lần lưu, không gửi phần lẻ.
export async function PUT(request: Request) {
  const parsed = SiteSettingsSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  // Kiểm quyền ở tầng API dù RLS đã chặn update theo is_admin() — kiểm CẢ HAI (xem CLAUDE.md).
  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const settings = await updateSiteSettings(parsed.data)
    return Response.json({ data: settings })
  } catch {
    return fail(500, 'INTERNAL', 'Không lưu được cấu hình')
  }
}
