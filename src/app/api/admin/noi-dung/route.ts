// POST /api/admin/noi-dung — tạo khối nội dung mới cho trang chủ.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { createBlock } from '@/lib/content-blocks'
import { ContentBlockSchema } from '@/lib/content-schema'
import { requireAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = ContentBlockSchema.safeParse(await request.json().catch(() => null))
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
    const block = await createBlock(parsed.data)
    return Response.json({ data: block }, { status: 201 })
  } catch {
    return fail(500, 'INTERNAL', 'Không tạo được khối nội dung')
  }
}
