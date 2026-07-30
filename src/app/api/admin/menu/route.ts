// PUT /api/admin/menu — lưu toàn bộ menu chính (bảng nav_items).
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { NavMenuSchema } from '@/lib/content-schema'
import { replaceNavItems } from '@/lib/nav-items'
import { requireAdmin } from '@/lib/supabase'

// PUT cả danh sách chứ không POST/DELETE từng mục: thứ tự các mục là một phần của dữ liệu,
// mà thứ tự chỉ có nghĩa khi nhìn cả danh sách. Gửi lẻ thì hai lần lưu xen nhau ra menu lai.
export async function PUT(request: Request) {
  const parsed = NavMenuSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  // Kiểm quyền ở tầng API dù RLS đã chặn insert/update/delete theo is_admin() — kiểm CẢ HAI.
  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const items = await replaceNavItems(parsed.data.items)
    return Response.json({ data: items })
  } catch {
    return fail(500, 'INTERNAL', 'Không lưu được menu')
  }
}
