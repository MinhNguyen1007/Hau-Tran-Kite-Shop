// Khối nội dung lặp lại trên trang chủ (danh mục / khuyến mãi / kinh nghiệm / cam kết).
// Một bảng cho cả bốn, phân biệt bằng `section` — xem đầu migration 20260727110000.
//
// RLS lo phần lọc `active`: khách chỉ nhận về khối đang bật, admin nhận cả khối đã ẩn.
// Nên hàm cho khách ở đây KHÔNG cần tự lọc, trừ hàm nói rõ là dành cho admin.
import type { ContentBlock, ContentBlockInput, Section } from './content-blocks-shared'
import { createServerSupabase } from './supabase'

type ContentBlockRow = {
  id: string
  section: Section
  sort_order: number
  title: string
  subtitle: string
  body: string
  href: string
  icon: string
  active: boolean
}

const COLUMNS = 'id, section, sort_order, title, subtitle, body, href, icon, active'

function mapBlock(row: ContentBlockRow): ContentBlock {
  return {
    id: row.id,
    section: row.section,
    sortOrder: row.sort_order,
    title: row.title,
    subtitle: row.subtitle,
    body: row.body,
    href: row.href,
    icon: row.icon,
    active: row.active,
  }
}

function toRow(input: ContentBlockInput) {
  return {
    section: input.section,
    sort_order: input.sortOrder,
    title: input.title,
    subtitle: input.subtitle,
    body: input.body,
    href: input.href,
    icon: input.icon,
    active: input.active,
  }
}

// Dùng ở trang chủ (Server Component). KHÔNG ném lỗi: một khối hỏng không được làm trắng
// cả trang chủ — trả mảng rỗng thì khối đó tự biến mất, phần còn lại vẫn chạy.
export async function getBlocks(section: Section): Promise<ContentBlock[]> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('content_blocks')
      .select(COLUMNS)
      .eq('section', section)
      .order('sort_order', { ascending: true })
    if (error) return []
    return (data ?? []).map((row) => mapBlock(row as ContentBlockRow))
  } catch {
    return []
  }
}

// Danh sách cho trang admin: đủ mọi section, kèm khối đã ẩn. Người gọi PHẢI requireAdmin().
export async function getBlocksForAdmin(): Promise<ContentBlock[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('content_blocks')
    .select(COLUMNS)
    .order('section', { ascending: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => mapBlock(row as ContentBlockRow))
}

export async function getBlockById(id: string): Promise<ContentBlock | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('content_blocks').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapBlock(data as ContentBlockRow) : null
}

export async function createBlock(input: ContentBlockInput): Promise<ContentBlock> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('content_blocks').insert(toRow(input)).select(COLUMNS).single()
  if (error) throw error
  return mapBlock(data as ContentBlockRow)
}

export async function updateBlock(id: string, input: ContentBlockInput): Promise<ContentBlock | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('content_blocks')
    .update({ ...toRow(input), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapBlock(data as ContentBlockRow) : null
}

// Xoá CỨNG, khác với sản phẩm (xoá mềm bằng archived_at). Lý do: khối nội dung không bị
// bảng nào tham chiếu tới, xoá đi không làm đứt dữ liệu lịch sử. Muốn giấu tạm thì dùng
// active = false, và đó mới là đường admin hay dùng.
export async function deleteBlock(id: string): Promise<void> {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from('content_blocks').delete().eq('id', id)
  if (error) throw error
}
