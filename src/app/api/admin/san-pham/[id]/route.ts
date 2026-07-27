// PATCH  /api/admin/san-pham/[id] — sửa sản phẩm.
// DELETE /api/admin/san-pham/[id] — lưu trữ (xoá mềm), xem migration products_archive.
import { z } from 'zod'
import { fail, failFromAuthError } from '@/lib/api'
import { ProductInputSchema } from '@/lib/product-schema'
import { isDuplicateSlugError, setProductArchived, updateProduct } from '@/lib/products'
import { requireAdmin } from '@/lib/supabase'

const IdSchema = z.uuid()

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã sản phẩm không hợp lệ')
  }

  const parsed = ProductInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const product = await updateProduct(id, parsed.data)
    // RLS trả về 0 dòng khi không có quyền HOẶC khi id không tồn tại. Đã qua requireAdmin
    // ở trên nên ở đây chỉ còn khả năng không tìm thấy.
    if (!product) return fail(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm')
    return Response.json({ data: product })
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return fail(409, 'CONFLICT', 'Slug này đã có sản phẩm khác dùng')
    }
    return fail(500, 'INTERNAL', 'Không lưu được sản phẩm')
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã sản phẩm không hợp lệ')
  }

  // ?khoi-phuc=1 để bỏ lưu trữ. Dùng chung DELETE cho cả hai chiều vì với admin thì đây là
  // một nút bật/tắt trên cùng một dòng, không phải hai hành động khác nhau.
  const restore = new URL(request.url).searchParams.get('khoi-phuc') === '1'

  try {
    await requireAdmin()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  try {
    const product = await setProductArchived(id, !restore)
    if (!product) return fail(404, 'NOT_FOUND', 'Không tìm thấy sản phẩm')
    return Response.json({ data: product })
  } catch {
    return fail(500, 'INTERNAL', restore ? 'Không khôi phục được' : 'Không gỡ được sản phẩm')
  }
}
