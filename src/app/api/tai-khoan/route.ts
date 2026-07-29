// PUT /api/tai-khoan — khách tự sửa hồ sơ của mình (tên, số điện thoại, địa chỉ, ảnh).
//
// Không có route đổi vai trò ở đây: việc đó nằm ở /api/admin/tai-khoan/[id] và chỉ chủ shop
// gọi được. Trigger profiles_prevent_role_change ở DB chặn lớp cuối.
import { z } from 'zod'
import { fail } from '@/lib/api'
import { updateMyProfile } from '@/lib/profiles'
import { createServerSupabase } from '@/lib/supabase'

// Số điện thoại Việt Nam: 10 - 11 chữ số, cho phép dấu cách và dấu chấm khách hay gõ.
// Không ép định dạng chặt hơn — đây là số để shop gọi lại, không phải khoá dữ liệu.
const PHONE = /^[0-9\s.+-]{9,15}$/

const ProfileSchema = z.object({
  fullName: z.string().trim().max(80, 'Họ tên tối đa 80 ký tự'),
  phone: z
    .string()
    .trim()
    .max(15)
    .refine((value) => value === '' || PHONE.test(value), 'Số điện thoại không hợp lệ'),
  address: z.string().trim().max(200, 'Địa chỉ tối đa 200 ký tự'),
  avatarPath: z.string().trim().max(300).nullable(),
})

export async function PUT(request: Request) {
  const parsed = ProfileSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return fail(400, 'INVALID_INPUT', parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ')
  }

  // Khách thường nên không dùng requireAdmin; vẫn phải có session thật (getUser đọc từ
  // Supabase chứ không tin cookie suông).
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return fail(401, 'UNAUTHENTICATED', 'Bạn cần đăng nhập')

  try {
    const profile = await updateMyProfile(parsed.data)
    if (!profile) return fail(404, 'NOT_FOUND', 'Không tìm thấy hồ sơ')
    return Response.json({ data: profile })
  } catch {
    return fail(500, 'INTERNAL', 'Không lưu được hồ sơ')
  }
}
