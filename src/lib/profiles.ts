// Lớp truy cập dữ liệu tài khoản. Chỉ CHỦ SHOP gọi tới — RLS trên profiles đã chặn
// (select: chính mình hoặc owner; update: chỉ owner và không đụng được dòng owner), nhưng
// người gọi VẪN phải requireOwner() trước, kiểm hai lớp như mọi route admin khác.
import type { Role } from './roles'
import { AVATAR_BUCKET } from './storage'
import { createServerSupabase } from './supabase'

export type ManagedProfile = {
  id: string
  email: string | null
  fullName: string | null
  avatarPath: string | null
  role: Role
  createdAt: string
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  avatar_path: string | null
  role: Role
  created_at: string
}

const COLUMNS = 'id, email, full_name, avatar_path, role, created_at'

function mapProfile(row: ProfileRow): ManagedProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatarPath: row.avatar_path,
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

// ---------------------------------------------------------------------------
// Danh tính người đứng sau mỗi dòng nhật ký, cho bảng "Hoạt động gần đây" ở /admin.
// ---------------------------------------------------------------------------

export type ActorProfile = {
  id: string
  email: string | null
  fullName: string | null
  avatarPath: string | null
}

// KHÔNG requireOwner ở đây: admin phụ cũng mở được trang tổng quan. Trả về bao nhiêu là do
// RLS quyết định — policy profiles_select_self_or_owner nên CHỦ SHOP đọc được đủ tên, còn
// admin phụ chỉ thấy dòng của chính mình, người khác rơi về nhãn chung "Khách đã đăng nhập".
// Đó là CỐ Ý chứ không phải thiếu sót: admin phụ không quản lý tài khoản thì cũng không có
// lý do đọc danh sách khách. Muốn admin phụ thấy tên thì phải nới policy, không phải sửa ở đây.
export async function getActorProfiles(ids: string[]): Promise<Map<string, ActorProfile>> {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return new Map()

  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_path')
    .in('id', unique)

  // Nuốt lỗi chứ không throw: thiếu tên người thì dòng nhật ký vẫn đọc được, còn ném lỗi
  // là trắng cả trang tổng quan — cùng lý do với safeCount trong admin-stats.
  if (error) return new Map()

  const rows = (data ?? []) as {
    id: string
    email: string | null
    full_name: string | null
    avatar_path: string | null
  }[]

  return new Map(
    rows.map((row) => [
      row.id,
      { id: row.id, email: row.email, fullName: row.full_name, avatarPath: row.avatar_path },
    ]),
  )
}

// ---------------------------------------------------------------------------
// Hồ sơ của chính người đang đăng nhập (trang /tai-khoan). Khác khối trên: khách thường
// cũng gọi được, và RLS chỉ cho đụng đúng dòng của mình.
// ---------------------------------------------------------------------------

export type MyProfile = {
  id: string
  email: string | null
  fullName: string
  phone: string
  address: string
  avatarPath: string | null
  role: Role
}

export type MyProfileInput = {
  fullName: string
  phone: string
  address: string
  avatarPath: string | null
}

const MY_COLUMNS = 'id, email, full_name, phone, address, avatar_path, role'

type MyProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  address: string | null
  avatar_path: string | null
  role: Role
}

function mapMyProfile(row: MyProfileRow): MyProfile {
  return {
    id: row.id,
    email: row.email,
    // Cột để null được (tài khoản tạo trước khi có mấy ô này), nhưng UI luôn làm việc với
    // chuỗi — bớt một nhánh null ở mọi ô nhập.
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    address: row.address ?? '',
    avatarPath: row.avatar_path,
    role: row.role,
  }
}

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select(MY_COLUMNS)
    .eq('id', user.id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  return mapMyProfile(data as MyProfileRow)
}

// KHÔNG nhận role: trigger profiles_prevent_role_change ở DB cũng chặn, nhưng không gửi lên
// thì không có gì để chặn ngay từ đầu.
export async function updateMyProfile(input: MyProfileInput): Promise<MyProfile | null> {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Đọc path CŨ trước khi ghi đè: sau update thì không còn chỗ nào biết file nào vừa bị bỏ lại.
  const { data: current } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle()
  const previousAvatar = (current as { avatar_path: string | null } | null)?.avatar_path ?? null

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName,
      phone: input.phone,
      address: input.address,
      avatar_path: input.avatarPath,
    })
    .eq('id', user.id)
    .select(MY_COLUMNS)
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const profile = mapMyProfile(data as MyProfileRow)

  // Dọn ảnh cũ CHỈ khi dòng hồ sơ đã ghi xong. Xoá trước mà update hỏng là hồ sơ trỏ vào một
  // file không còn tồn tại. Đi bằng session của chính khách nên RLS avatars_objects_delete_self
  // vẫn là lớp chặn cuối: path ngoài thư mục '<uid>/' thì xoá không được.
  if (previousAvatar && previousAvatar !== profile.avatarPath) {
    try {
      await supabase.storage.from(AVATAR_BUCKET).remove([previousAvatar])
    } catch {
      // Hồ sơ đã lưu rồi; một file thừa trong bucket không đáng để trả lỗi về cho khách.
    }
  }

  return profile
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
