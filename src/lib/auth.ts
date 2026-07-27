// Đọc hồ sơ + role của người đang đăng nhập. Role KHÔNG nằm trong JWT (tự sửa được)
// mà ở public.profiles, nên phải query — xem skill auth-rls.
import { createServerSupabase } from './supabase'

export type Role = 'user' | 'admin'

export type Profile = {
  id: string
  email: string | null
  fullName: string | null
  role: Role
}

// null = chưa đăng nhập. Gọi được từ Server Component lẫn Route Handler.
export async function getProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email ?? null,
    // Trigger handle_new_user chép full_name từ metadata Google. Magic link không có tên
    // nên rơi về null — UI hiển thị email thay thế.
    fullName: (data?.full_name as string | null) ?? null,
    // Thiếu dòng profiles (trigger lỗi, dữ liệu cũ) thì coi như user thường, không phải admin.
    role: (data?.role as Role | undefined) ?? 'user',
  }
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getProfile()
  return profile?.role === 'admin'
}
