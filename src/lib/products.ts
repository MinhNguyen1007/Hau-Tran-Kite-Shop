// Lớp truy cập dữ liệu sản phẩm. Đọc DB qua client trong supabase.ts (không query thẳng
// trong component). Map snake_case (DB) sang camelCase (app) tại đây, một chỗ duy nhất.
//
// Sản phẩm đã lưu trữ (archived_at khác null) bị RLS giấu khỏi khách, admin vẫn thấy —
// nên các hàm dưới đây không cần tự lọc, trừ hàm nói rõ là dành cho admin.
//
// KHÔNG còn tồn kho (bỏ 2026-07-27): diều làm thủ công theo đơn, không có kho.
// Giá và kích thước là CHỮ TỰ DO — shop báo khoảng ("3–5 triệu", "làm từ 3m đến 5m") chứ
// không có bảng giá cố định. Admin ẩn giá được bằng showPrice.
import type { ProductImage } from './product-shared'
import { createServerSupabase } from './supabase'

export type Product = {
  id: string
  slug: string
  name: string
  description: string | null
  // Chữ tự do: "3 triệu – 5 triệu", "Liên hệ"… Rỗng hoặc showPrice=false thì không hiện giá.
  priceText: string
  showPrice: boolean
  // Chữ tự do mô tả cỡ làm được: "Làm từ 3m đến 5m tuỳ yêu cầu".
  sizeNote: string
  // Ảnh ĐẠI DIỆN (hiện trên card). Bộ ảnh chi tiết nằm ở `images`.
  imagePath: string | null
  categoryId: string | null
  categoryName: string | null
  archivedAt: string | null
  images: ProductImage[]
}

type ProductRow = {
  id: string
  slug: string
  name: string
  description: string | null
  price_text: string
  show_price: boolean
  size_note: string
  image_path: string | null
  category_id: string | null
  archived_at: string | null
  categories: { name: string } | null
  product_images: { id: string; image_path: string; alt: string; sort_order: number }[] | null
}

// Dữ liệu admin gửi lên khi tạo/sửa. Không có id, không có archived_at (đổi bằng hàm riêng).
// sizes/images gửi kèm và được ghi đè TOÀN BỘ mỗi lần lưu — xem replaceSizes/replaceImages.
export type ProductInput = {
  slug: string
  name: string
  description: string | null
  priceText: string
  showPrice: boolean
  sizeNote: string
  imagePath: string | null
  categoryId: string | null
  images: { imagePath: string; alt: string }[]
}

const COLUMNS = `
  id, slug, name, description, price_text, show_price, size_note,
  image_path, category_id, archived_at,
  categories(name),
  product_images(id, image_path, alt, sort_order)
`

const bySortOrder = (a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceText: row.price_text,
    showPrice: row.show_price,
    sizeNote: row.size_note,
    imagePath: row.image_path,
    categoryId: row.category_id,
    categoryName: row.categories?.name ?? null,
    archivedAt: row.archived_at,
    // PostgREST không đảm bảo thứ tự của quan hệ lồng nhau — sắp lại ở đây cho chắc.
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
    price_text: input.priceText,
    show_price: input.showPrice,
    size_note: input.sizeNote,
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

  if (options?.categorySlug) {
    // Tra slug ra id rồi lọc theo CỘT của chính bảng products.
    //
    // KHÔNG dùng .eq('categories.slug', ...) — trong PostgREST, filter trên bảng nhúng chỉ
    // lọc phần nhúng, dòng cha vẫn trả về đủ (kèm categories = null). Viết thế trông đúng
    // nhưng lọc không ăn gì cả; đã dính đúng lỗi này một lần.
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .maybeSingle()

    // Slug không có thật → trả rỗng, đừng im lặng bỏ qua bộ lọc rồi hiện toàn bộ hàng.
    if (!category) return []
    request = request.eq('category_id', (category as { id: string }).id)
  }

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

// Ảnh ghi theo lối XOÁ SẠCH RỒI CHÈN LẠI thay vì so từng dòng: form admin gửi lên nguyên
// danh sách, và số dòng luôn nhỏ. Đổi lại id dòng thay đổi mỗi lần lưu — không sao,
// không bảng nào tham chiếu tới chúng.
async function replaceImages(productId: string, images: ProductInput['images']): Promise<void> {
  const supabase = await createServerSupabase()

  await supabase.from('product_images').delete().eq('product_id', productId)
  if (images.length === 0) return

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

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('products').insert(toRow(input)).select('id').single()
  if (error) throw error

  const id = (data as { id: string }).id
  await replaceImages(id, input.images)

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

  await replaceImages(id, input.images)
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
