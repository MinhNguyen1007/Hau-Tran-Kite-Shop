// PATCH /api/admin/tai-khoan/[id] — nâng một tài khoản lên admin phụ, hoặc hạ về khách.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
//
// requireOwner chứ không phải requireAdmin: admin phụ đứng DƯỚI chủ shop, không được tự
// nâng mình lên, không được nâng thêm đồng minh, không được hạ ai. RLS trên profiles chặn
// lần nữa ở tầng DB — kiểm cả hai (xem CLAUDE.md).
import { z } from 'zod'
import { fail, failFromAuthError } from '@/lib/api'
import { setProfileRole } from '@/lib/profiles'
import { requireOwner } from '@/lib/supabase'

const IdSchema = z.uuid()

// 'owner' CỐ Ý không nằm trong danh sách: chỉ có một chủ shop, và không đổi qua web được.
const BodySchema = z.object({
  role: z.enum(['user', 'admin'], { message: 'Vai trò không hợp lệ' }),
})

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params
  if (!IdSchema.safeParse(id).success) {
    return fail(400, 'INVALID_INPUT', 'Mã tài khoản không hợp lệ')
  }

  const parsed = BodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  let owner
  try {
    owner = await requireOwner()
  } catch (error) {
    return failFromAuthError(error) ?? fail(500, 'INTERNAL', 'Không kiểm tra được quyền')
  }

  // Chặn sớm cho câu báo lỗi dễ hiểu. RLS cũng chặn (policy loại trừ dòng owner) nhưng ở đó
  // chỉ trả về 0 dòng, admin đọc "không tìm thấy tài khoản" thì tưởng dữ liệu hỏng.
  if (id === owner.id) {
    return fail(403, 'FORBIDDEN', 'Không thể tự đổi vai trò của tài khoản chủ shop')
  }

  try {
    const profile = await setProfileRole(id, parsed.data.role)
    if (!profile) return fail(404, 'NOT_FOUND', 'Không tìm thấy tài khoản')
    return Response.json({ data: profile })
  } catch {
    return fail(500, 'INTERNAL', 'Không đổi được vai trò')
  }
}
