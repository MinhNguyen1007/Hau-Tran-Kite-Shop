// Lớp truy cập dữ liệu sản phẩm. Đọc DB qua client trong supabase.ts (không query thẳng
// trong component). Map snake_case (DB) sang camelCase (app) tại đây, một chỗ duy nhất.
//
// Sản phẩm đã lưu trữ (archived_at khác null) bị RLS giấu khỏi khách, admin vẫn thấy —
// nên các hàm dưới đây không cần tự lọc, trừ hàm nói rõ là dành cho admin.
import { createServerSupabase } from './supabase'

export type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  priceVnd: number
  imagePath: string | null
  stock: number
  archivedAt: string | null
}

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  price_vnd: number
  image_path: string | null
  stock: number
  archived_at: string | null
}

// Dữ liệu admin gửi lên khi tạo/sửa. Không có id, không có archived_at (đổi bằng hàm riêng).
export type ProductInput = {
  slug: string
  name: string
  description: string | null
  priceVnd: number
  imagePath: string | null
  stock: number
}

const COLUMNS = 'id, slug, name, description, price_vnd, image_path, stock, archived_at'

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceVnd: row.price_vnd,
    imagePath: row.image_path,
    stock: row.stock,
    archivedAt: row.archived_at,
  }
}

function toRow(input: ProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    price_vnd: input.priceVnd,
    image_path: input.imagePath,
    stock: input.stock,
  }
}

export async function getProducts(options?: { query?: string }): Promise<Product[]> {
  const supabase = await createServerSupabase()
  let request = supabase
    .from('products')
    .select(COLUMNS)
    .order('created_at', { ascending: false })

  const term = options?.query?.trim()
  if (term) {
    // PostgREST tách các filter trong .or() bằng dấu phẩy và dùng % làm wildcard —
    // bỏ những ký tự đó khỏi từ khoá của người dùng để không vỡ cú pháp filter.
    const safe = term.replace(/[,()*%\\]/g, ' ').trim()
    if (safe) request = request.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const { data, error } = await request
  if (error) throw error
  return (data ?? []).map((row) => mapProduct(row as ProductRow))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .select(COLUMNS)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as ProductRow) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as ProductRow) : null
}

// Danh sách cho trang admin: kèm cả hàng đã lưu trữ, hàng còn bán xếp lên trước.
// Người gọi PHẢI requireAdmin() trước — RLS lọc theo is_admin() nhưng đó là lớp thứ hai.
export async function getProductsForAdmin(): Promise<Product[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .select(COLUMNS)
    .order('archived_at', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => mapProduct(row as ProductRow))
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').insert(toRow(input)).select(COLUMNS).single()
  if (error) throw error
  return mapProduct(data as ProductRow)
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .update(toRow(input))
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as ProductRow) : null
}

// "Xoá" theo nghĩa người dùng = gỡ khỏi trang bán hàng. Dòng dữ liệu vẫn còn để đơn cũ
// và bảng events không bị đứt tham chiếu. archived = false là khôi phục.
export async function setProductArchived(id: string, archived: boolean): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as ProductRow) : null
}

// Slug trùng là lỗi unique của Postgres (23505). Đổi sang CONFLICT để route trả 409
// thay vì 500, và để câu báo lỗi nói đúng chỗ sai cho admin.
export function isDuplicateSlugError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}
