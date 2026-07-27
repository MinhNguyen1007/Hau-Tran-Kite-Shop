// PUT    /api/admin/noi-dung/[id] — sửa khối nội dung.
// DELETE /api/admin/noi-dung/[id] — xoá hẳn khối (khác sản phẩm: khối nội dung không bị bảng
//        nào tham chiếu tới, xem ghi chú ở deleteBlock). Muốn giấu tạm thì đặt active = false.
import { z } from 'zod'
import { fail, failFromAuthError } from '@/lib/api'
import { deleteBlock, getBlockById, updateBlock } from '@/lib/content-blocks'
import { ContentBlockSchema } from '@/lib/content-schema'
import { requireAdmin } from '@/lib/supabase'

const IdSchema = z.uuid()

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã khối nội dung không hợp lệ')
  }

  const parsed = ContentBlockSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const block = await updateBlock(id, parsed.data)
    // RLS trả 0 dòng khi không có quyền HOẶC khi id không tồn tại. Đã qua requireAdmin ở trên
    // nên ở đây chỉ còn khả năng không tìm thấy.
    if (!block) return fail(404, 'NOT_FOUND', 'Không tìm thấy khối nội dung')
    return Response.json({ data: block })
  } catch {
    return fail(500, 'INTERNAL', 'Không lưu được khối nội dung')
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã khối nội dung không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    // delete không báo được "có xoá trúng dòng nào không", nên hỏi trước để trả 404 cho đúng
    // thay vì báo thành công trên một id không tồn tại.
    const existing = await getBlockById(id)
    if (!existing) return fail(404, 'NOT_FOUND', 'Không tìm thấy khối nội dung')

    await deleteBlock(id)
    return Response.json({ data: { id } })
  } catch {
    return fail(500, 'INTERNAL', 'Không xoá được khối nội dung')
  }
}
