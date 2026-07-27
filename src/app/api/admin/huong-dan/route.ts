// POST /api/admin/huong-dan — tạo bài hướng dẫn (link YouTube) cho trang /huong-dan.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { GuideVideoSchema } from '@/lib/content-schema'
import { createGuideVideo } from '@/lib/guide-videos'
import { requireAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = GuideVideoSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const guide = await createGuideVideo(parsed.data)
    return Response.json({ data: guide }, { status: 201 })
  } catch {
    return fail(500, 'INTERNAL', 'Không tạo được bài hướng dẫn')
  }
}
