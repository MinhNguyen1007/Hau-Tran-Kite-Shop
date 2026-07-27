// PUT    /api/admin/huong-dan/[id] — sửa bài hướng dẫn.
// DELETE /api/admin/huong-dan/[id] — xoá hẳn. Không bảng nào tham chiếu tới nên xoá cứng
//        an toàn; muốn giấu tạm thì đặt active = false.
import { z } from 'zod'
import { fail, failFromAuthError } from '@/lib/api'
import { GuideVideoSchema } from '@/lib/content-schema'
import { deleteGuideVideo, getGuideVideoById, updateGuideVideo } from '@/lib/guide-videos'
import { requireAdmin } from '@/lib/supabase'

const IdSchema = z.uuid()

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã bài hướng dẫn không hợp lệ')
  }

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
    const guide = await updateGuideVideo(id, parsed.data)
    if (!guide) return fail(404, 'NOT_FOUND', 'Không tìm thấy bài hướng dẫn')
    return Response.json({ data: guide })
  } catch {
    return fail(500, 'INTERNAL', 'Không lưu được bài hướng dẫn')
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã bài hướng dẫn không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    // delete không báo được "có xoá trúng dòng nào không", nên hỏi trước để trả 404 cho đúng.
    const existing = await getGuideVideoById(id)
    if (!existing) return fail(404, 'NOT_FOUND', 'Không tìm thấy bài hướng dẫn')

    await deleteGuideVideo(id)
    return Response.json({ data: { id } })
  } catch {
    return fail(500, 'INTERNAL', 'Không xoá được bài hướng dẫn')
  }
}
