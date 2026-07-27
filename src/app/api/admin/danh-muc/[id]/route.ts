// PUT    /api/admin/danh-muc/[id] — sửa danh mục.
// DELETE /api/admin/danh-muc/[id] — gỡ (xoá MỀM), ?khoi-phuc=1 để bỏ gỡ.
//
// Xoá mềm chứ không xoá cứng: sản phẩm đang trỏ vào danh mục này, xoá hẳn là mất phân loại
// của chúng (FK để on delete set null).
import { z } from 'zod'
import { fail, failFromAuthError } from '@/lib/api'
import { setCategoryArchived, updateCategory } from '@/lib/categories'
import { CategorySchema } from '@/lib/content-schema'
import { isDuplicateSlugError } from '@/lib/products'
import { requireAdmin } from '@/lib/supabase'

const IdSchema = z.uuid()

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã danh mục không hợp lệ')
  }

  const parsed = CategorySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const category = await updateCategory(id, parsed.data)
    if (!category) return fail(404, 'NOT_FOUND', 'Không tìm thấy danh mục')
    return Response.json({ data: category })
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return fail(409, 'CONFLICT', 'Slug này đã có danh mục khác dùng')
    }
    return fail(500, 'INTERNAL', 'Không lưu được danh mục')
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã danh mục không hợp lệ')
  }

  const restore = new URL(request.url).searchParams.get('khoi-phuc') === '1'

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const category = await setCategoryArchived(id, !restore)
    if (!category) return fail(404, 'NOT_FOUND', 'Không tìm thấy danh mục')
    return Response.json({ data: category })
  } catch {
    return fail(500, 'INTERNAL', restore ? 'Không khôi phục được' : 'Không gỡ được danh mục')
  }
}
