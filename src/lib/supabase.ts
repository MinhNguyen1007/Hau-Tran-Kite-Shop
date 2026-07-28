// Adapter Supabase phía SERVER (Server Components, Route Handlers, Server Actions).
// Import 'next/headers' khiến file này chỉ chạy được ở server — không import vào client.
// Mọi truy cập DB đi qua đây, không rải rác Supabase trong component (xem CLAUDE.md).
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { hasAdminAccess, hasOwnerAccess, type Role } from './roles'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client gắn với session của request (đọc/ghi cookie auth). Dùng anon key → RLS bảo vệ.
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Gọi từ Server Component (cookies read-only) — bỏ qua, middleware sẽ refresh session.
        }
      },
    },
  })
}

// User đã xác thực với Auth server (getUser, không tin cookie suông). null nếu chưa đăng nhập.
export async function getCurrentUser() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Kiểm quyền Ở TẦNG API (lớp 1). RLS trong DB là lớp 2 — route admin phải kiểm CẢ HAI.
// Ném 'UNAUTHORIZED' nếu chưa đăng nhập, 'FORBIDDEN' nếu thiếu quyền.
async function requireRole(allowed: (role: Role) => boolean) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHORIZED')

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (error || !allowed((data as { role: Role } | null)?.role ?? 'user')) {
    throw new Error('FORBIDDEN')
  }
  return user
}

// Admin phụ VÀ chủ shop đều qua được — dùng cho mọi route quản trị nội dung.
export async function requireAdmin() {
  return requireRole(hasAdminAccess)
}

// Chỉ chủ shop. Dùng cho route đổi vai trò: admin phụ không được tự nâng mình hay hạ người khác.
export async function requireOwner() {
  return requireRole(hasOwnerAccess)
}

// Client SERVICE ROLE — BỎ QUA RLS. Chỉ dùng server-side cho tác vụ hệ thống cần ghi
// thay mặt người dùng. TUYỆT ĐỐI không đưa ra client.
export function createServiceRoleSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY chưa cấu hình')
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
