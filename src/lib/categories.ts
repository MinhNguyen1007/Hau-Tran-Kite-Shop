// Danh mục diều (bảng public.categories). Mỗi sản phẩm thuộc đúng một danh mục.
//
// Thay cho src/lib/kite-categories.ts ngày trước — file đó ĐOÁN nhóm từ slug bằng
// keyword matching, sai ngay khi tên mẫu không chứa từ khoá.
import { createServerSupabase } from './supabase'

export type Category = {
  id: string
  slug: string
  name: string
  description: string
  imagePath: string | null
  sortOrder: number
  archivedAt: string | null
}

export type CategoryInput = Omit<Category, 'id' | 'archivedAt'>

type CategoryRow = {
  id: string
  slug: string
  name: string
  description: string
  image_path: string | null
  sort_order: number
  archived_at: string | null
}

const COLUMNS = 'id, slug, name, description, image_path, sort_order, archived_at'

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imagePath: row.image_path,
    sortOrder: row.sort_order,
    archivedAt: row.archived_at,
  }
}

function toRow(input: CategoryInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    image_path: input.imagePath,
    sort_order: input.sortOrder,
  }
}

// Dùng ở trang chủ và ô lọc. KHÔNG ném lỗi: một danh mục hỏng không được làm trắng trang chủ.
export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('categories')
      .select(COLUMNS)
      .is('archived_at', null)
      .order('sort_order', { ascending: true })
    if (error) return []
    return (data ?? []).map((row) => mapCategory(row as CategoryRow))
  } catch {
    return []
  }
}

// Kèm cả danh mục đã gỡ. Người gọi PHẢI requireAdmin() trước.
export async function getCategoriesForAdmin(): Promise<Category[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('categories')
    .select(COLUMNS)
    .order('archived_at', { ascending: true, nullsFirst: true })
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => mapCategory(row as CategoryRow))
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('categories').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapCategory(data as CategoryRow) : null
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('categories').insert(toRow(input)).select(COLUMNS).single()
  if (error) throw error
  return mapCategory(data as CategoryRow)
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('categories')
    .update(toRow(input))
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapCategory(data as CategoryRow) : null
}

// Xoá MỀM như sản phẩm: sản phẩm cũ vẫn trỏ vào đây, xoá cứng là mất phân loại của chúng.
export async function setCategoryArchived(id: string, archived: boolean): Promise<Category | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('categories')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapCategory(data as CategoryRow) : null
}
