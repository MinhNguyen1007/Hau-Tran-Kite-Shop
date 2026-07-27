// Lớp truy cập dữ liệu sản phẩm. Đọc DB qua client trong supabase.ts (không query thẳng
// trong component). Map snake_case (DB) sang camelCase (app) tại đây, một chỗ duy nhất.
//
// Sản phẩm đã lưu trữ (archived_at khác null) bị RLS giấu khỏi khách, admin vẫn thấy —
// nên các hàm dưới đây không cần tự lọc, trừ hàm nói rõ là dành cho admin.
//
// KHÔNG còn tồn kho (bỏ 2026-07-27): diều làm thủ công theo đơn, không có kho.
// Giá: mẫu có nhiều cỡ thì giá nằm ở product_sizes; mẫu bán một mức thì dùng priceVnd.
import type { ProductImage, ProductSize } from './product-shared'
import { createServerSupabase } from './supabase'

export type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  // Giá của mẫu bán MỘT mức. Mẫu có bảng cỡ thì bỏ qua giá này, xem `sizes`.
  priceVnd: number
  // Ảnh ĐẠI DIỆN (hiện trên card). Bộ ảnh chi tiết nằm ở `images`.
  imagePath: string | null
  categoryId: string | null
  categoryName: string | null
  archivedAt: string | null
  sizes: ProductSize[]
  images: ProductImage[]
}

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  price_vnd: number
  image_path: string | null
  category_id: string | null
  archived_at: string | null
  categories: { name: string } | null
  product_sizes: { id: string; label: string; price_vnd: number; sort_order: number }[] | null
  product_images: { id: string; image_path: string; alt: string; sort_order: number }[] | null
}

// Dữ liệu admin gửi lên khi tạo/sửa. Không có id, không có archived_at (đổi bằng hàm riêng).
// sizes/images gửi kèm và được ghi đè TOÀN BỘ mỗi lần lưu — xem replaceSizes/replaceImages.
export type ProductInput = {
  slug: string
  name: string
  description: string | null
  priceVnd: number
  imagePath: string | null
  categoryId: string | null
  sizes: { label: string; priceVnd: number }[]
  images: { imagePath: string; alt: string }[]
}

const COLUMNS = `
  id, slug, name, description, price_vnd, image_path, category_id, archived_at,
  categories(name),
  product_sizes(id, label, price_vnd, sort_order),
  product_images(id, image_path, alt, sort_order)
`

const bySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceVnd: row.price_vnd,
    imagePath: row.image_path,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    archivedAt: row.archived_at,
    // PostgREST không đảm bảo thứ tự của quan hệ lồng nhau — sắp lại ở đây cho chắc.
    sizes: (row.product_sizes ?? [])
      .map((size) => ({
        id: size.id,
        label: size.label,
        priceVnd: size.price_vnd,
        sortOrder: size.sort_order,
      }))
      .sort(bySortOrder),
    images: (row.product_images ?? [])
      .map((image) => ({
        id: image.id,
        imagePath: image.image_path,
        alt: image.alt,
        sortOrder: image.sort_order,
      }))
      .sort(bySortOrder),
  }
}

function toRow(input: ProductInput) {
  return {
    slug: input.slug,
    name: input.name,
    description: input.description,
    price_vnd: input.priceVnd,
    image_path: input.imagePath,
    category_id: input.categoryId,
  }
}

export async function getProducts(options?: { query?: string; categorySlug?: string }): Promise<Product[]> {
  const supabase = await createServerSupabase()
  let request = supabase.from('products').select(COLUMNS).order('created_at', { ascending: false })

  const term = options?.query?.trim()
  if (term) {
    // PostgREST tách các filter trong .or() bằng dấu phẩy và dùng % làm wildcard —
    // bỏ những ký tự đó khỏi từ khoá của người dùng để không vỡ cú pháp filter.
    const safe = term.replace(/[,()*%\\]/g, ' ').trim()
    if (safe) request = request.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  if (options?.categorySlug) request = request.eq('categories.slug', options.categorySlug)

  const { data, error } = await request
  if (error) throw error
  return (data ?? []).map((row) => mapProduct(row as unknown as ProductRow))
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').select(COLUMNS).eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as unknown as ProductRow) : null
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapProduct(data as unknown as ProductRow) : null
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
  return (data ?? []).map((row) => mapProduct(row as unknown as ProductRow))
}

// Cỡ và ảnh ghi theo lối XOÁ SẠCH RỒI CHÈN LẠI thay vì so từng dòng: form admin gửi lên
// nguyên danh sách, và số dòng luôn nhỏ (vài cỡ, vài ảnh). Đổi lại id dòng thay đổi mỗi
// lần lưu — không sao, không bảng nào tham chiếu tới chúng.
async function replaceChildren(
  productId: string,
  sizes: ProductInput['sizes'],
  images: ProductInput['images'],
): Promise<void> {
  const supabase = await createServerSupabase()

  await supabase.from('product_sizes').delete().eq('product_id', productId)
  if (sizes.length > 0) {
    const { error } = await supabase.from('product_sizes').insert(
      sizes.map((size, index) => ({
        product_id: productId,
        label: size.label,
        price_vnd: size.priceVnd,
        sort_order: index * 10,
      })),
    )
    if (error) throw error
  }

  await supabase.from('product_images').delete().eq('product_id', productId)
  if (images.length > 0) {
    const { error } = await supabase.from('product_images').insert(
      images.map((image, index) => ({
        product_id: productId,
        image_path: image.imagePath,
        alt: image.alt,
        sort_order: index * 10,
      })),
    )
    if (error) throw error
  }
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').insert(toRow(input)).select('id').single()
  if (error) throw error

  const id = (data as { id: string }).id
  await replaceChildren(id, input.sizes, input.images)

  const product = await getProductById(id)
  if (!product) throw new Error('PRODUCT_MISSING_AFTER_INSERT')
  return product
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .update(toRow(input))
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  await replaceChildren(id, input.sizes, input.images)
  return getProductById(id)
}

// "Xoá" theo nghĩa người dùng = gỡ khỏi trang bán hàng. Dòng dữ liệu vẫn còn để bảng events
// không bị đứt tham chiếu. archived = false là khôi phục.
export async function setProductArchived(id: string, archived: boolean): Promise<Product | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('products')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error) throw error
  return data ? getProductById(id) : null
}

// Slug trùng là lỗi unique của Postgres (23505). Đổi sang CONFLICT để route trả 409
// thay vì 500, và để câu báo lỗi nói đúng chỗ sai cho admin.
export function isDuplicateSlugError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505'
}
