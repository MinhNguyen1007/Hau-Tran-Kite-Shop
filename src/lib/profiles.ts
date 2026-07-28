// Lớp truy cập dữ liệu tài khoản. Chỉ CHỦ SHOP gọi tới — RLS trên profiles đã chặn
// (select: chính mình hoặc owner; update: chỉ owner và không đụng được dòng owner), nhưng
// người gọi VẪN phải requireOwner() trước, kiểm hai lớp như mọi route admin khác.
import type { Role } from './roles'
import { createServerSupabase } from './supabase'

export type ManagedProfile = {
  id: string
  email: string | null
  fullName: string | null
  role: Role
  createdAt: string
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  role: Role
  created_at: string
}

const COLUMNS = 'id, email, full_name, role, created_at'

function mapProfile(row: ProfileRow): ManagedProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }
}

// Chủ shop lên đầu, rồi admin phụ, rồi khách — người cần thao tác nằm ngay trên màn hình
// thay vì lẫn giữa danh sách khách đăng ký.
const ROLE_ORDER: Record<Role, number> = { owner: 0, admin: 1, user: 2 }

export async function getProfilesForOwner(): Promise<ManagedProfile[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select(COLUMNS)
    .order('created_at', { ascending: true })
  if (error) throw error

  return (data ?? [])
    .map((row) => mapProfile(row as ProfileRow))
    .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role])
}

// Chỉ nhận 'user' | 'admin': vai trò owner KHÔNG bao giờ gán qua đường này. Muốn đổi chủ
// shop thì chạy script tạo chủ, không phải bấm nút trên web.
export async function setProfileRole(
  id: string,
  role: 'user' | 'admin',
): Promise<ManagedProfile | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error

  // null = RLS chặn (nhắm vào dòng owner) hoặc không có tài khoản đó. Người gọi trả 404,
  // KHÔNG phân biệt hai trường hợp: nói rõ "đây là tài khoản chủ" là chỉ điểm cho kẻ dò.
  return data ? mapProfile(data as ProfileRow) : null
}
