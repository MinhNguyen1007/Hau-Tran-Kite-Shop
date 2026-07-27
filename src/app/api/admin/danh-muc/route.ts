// POST /api/admin/danh-muc — tạo danh mục diều.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { createCategory } from '@/lib/categories'
import { CategorySchema } from '@/lib/content-schema'
import { isDuplicateSlugError } from '@/lib/products'
import { requireAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = CategorySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  // Kiểm quyền ở tầng API dù RLS đã chặn insert theo is_admin() — kiểm CẢ HAI (xem CLAUDE.md).
  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const category = await createCategory(parsed.data)
    return Response.json({ data: category }, { status: 201 })
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return fail(409, 'CONFLICT', 'Slug này đã có danh mục khác dùng')
    }
    return fail(500, 'INTERNAL', 'Không tạo được danh mục')
  }
}
