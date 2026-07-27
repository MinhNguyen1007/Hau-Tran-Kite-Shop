// POST /api/admin/san-pham — tạo sản phẩm mới.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
import { fail, failFromAuthError } from '@/lib/api'
import { ProductInputSchema } from '@/lib/product-schema'
import { createProduct, isDuplicateSlugError } from '@/lib/products'
import { requireAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const parsed = ProductInputSchema.safeParse(await request.json().catch(() => null))
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
    const product = await createProduct(parsed.data)
    return Response.json({ data: product }, { status: 201 })
  } catch (error) {
    if (isDuplicateSlugError(error)) {
      return fail(409, 'CONFLICT', 'Slug này đã có sản phẩm khác dùng')
    }
    return fail(500, 'INTERNAL', 'Không tạo được sản phẩm')
  }
}
