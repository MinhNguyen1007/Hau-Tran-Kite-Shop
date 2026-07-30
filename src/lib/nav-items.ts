// Menu chính của header (bảng public.nav_items).
//
// Trước 2026-07-30 đây là mảng hằng trong shop.ts. Chuyển vào DB để admin sửa được ở
// /admin/cai-dat, đúng luật "cái gì hiện trên web thì admin sửa được".
//
// KHÔNG import file này vào Client Component: nó kéo theo createServerSupabase → next/headers
// → gãy build, mà lỗi chỉ lộ ra lúc `npm run build`. Header đọc ở đây rồi truyền xuống
// MainNav/MobileMenu bằng prop. Kiểu NavLink nằm ở shop.ts (file thuần) chính vì vậy.
import { FALLBACK_NAV_ITEMS, type NavLink } from './shop'
import { createServerSupabase } from './supabase'

export type NavItem = {
  id: string
  label: string
  href: string
  sortOrder: number
  active: boolean
}

// id null = mục admin vừa thêm, chưa có dòng trong DB.
export type NavItemInput = {
  id: string | null
  label: string
  href: string
  active: boolean
}

type NavItemRow = {
  id: string
  label: string
  href: string
  sort_order: number
  active: boolean
}

const COLUMNS = 'id, label, href, sort_order, active'

function mapNavItem(row: NavItemRow): NavItem {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    sortOrder: row.sort_order,
    active: row.active,
  }
}

// Dùng cho header và menu mobile. KHÔNG ném lỗi: mất menu là mất đường đi của cả web, nên
// DB hỏng thì rơi về mảng hằng chứ không để header trống.
//
// Bảng RỖNG thì trả về rỗng chứ KHÔNG rơi về hằng: admin tắt hết các mục là ý muốn có thật,
// mà rơi về hằng thì mục cũ hiện lại như phần mềm không nghe lời.
export async function getNavLinks(): Promise<NavLink[]> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('nav_items')
      .select(COLUMNS)
      .eq('active', true)
      .order('sort_order', { ascending: true })
    if (error) return [...FALLBACK_NAV_ITEMS]
    return (data ?? []).map((row) => {
      const item = mapNavItem(row as NavItemRow)
      return { label: item.label, href: item.href }
    })
  } catch {
    return [...FALLBACK_NAV_ITEMS]
  }
}

// Kèm cả mục đang tắt. Người gọi PHẢI requireAdmin() trước.
export async function getNavItemsForAdmin(): Promise<NavItem[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('nav_items')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => mapNavItem(row as NavItemRow))
}

// Lưu cả danh sách một lượt, vì admin sửa cả menu trong một form: đổi tên mục 2, kéo mục 4 lên
// trên, xoá mục 5 rồi mới bấm Lưu. Gửi từng dòng một thì thứ tự mới có thể lưu được một nửa.
//
// Thứ tự lấy từ VỊ TRÍ trong mảng chứ không bắt admin gõ số: nhìn thấy gì thì lưu đúng thế.
export async function replaceNavItems(items: NavItemInput[]): Promise<NavItem[]> {
  const supabase = await createServerSupabase()

  const rows = items.map((item, index) => ({
    id: item.id ?? crypto.randomUUID(),
    label: item.label,
    href: item.href,
    active: item.active,
    sort_order: (index + 1) * 10,
  }))

  // Ghi TRƯỚC, xoá SAU. Đảo lại thì có một khoảnh khắc bảng rỗng, ai tải trang đúng lúc đó
  // thấy header không có menu nào.
  const { error: writeError } = await supabase.from('nav_items').upsert(rows)
  if (writeError) throw writeError

  // Uuid không tồn tại để câu lệnh vẫn hợp lệ khi danh sách rỗng — `in ()` là lỗi cú pháp.
  const keep = rows.length > 0 ? rows.map((row) => row.id) : ['00000000-0000-0000-0000-000000000000']
  const { error: deleteError } = await supabase
    .from('nav_items')
    .delete()
    .not('id', 'in', `(${keep.join(',')})`)
  if (deleteError) throw deleteError

  return getNavItemsForAdmin()
}
