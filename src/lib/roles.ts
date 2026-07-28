// Ba bậc phân quyền — xem migration 20260727160000_owner_role.sql.
//
//   owner  — CHỦ SHOP, duy nhất một tài khoản (DB có unique index chặn cái thứ hai).
//            Làm được mọi thứ admin làm, cộng quản lý tài khoản.
//   admin  — admin phụ do owner nâng lên. Toàn quyền nội dung, KHÔNG đụng vai trò của ai.
//   user   — khách thường.
//
// File này CỐ Ý thuần tuý, không import gì: cả Server Component, Route Handler lẫn Client
// Component đều dùng. Để trong auth.ts thì kéo theo next/headers và gãy build phía client.
export type Role = 'user' | 'admin' | 'owner'

// Owner LUÔN là admin. Dùng hàm này thay cho `role === 'admin'` rải rác — viết so sánh
// thẳng ở từng chỗ là kiểu gì cũng sót một chỗ và khoá chính chủ shop ra ngoài.
export function hasAdminAccess(role: Role): boolean {
  return role === 'admin' || role === 'owner'
}

// Quản lý tài khoản (nâng/hạ vai trò) là việc RIÊNG của chủ shop, admin phụ không đụng vào.
export function hasOwnerAccess(role: Role): boolean {
  return role === 'owner'
}

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Chủ shop',
  admin: 'Admin phụ',
  user: 'Khách',
}
