// Đọc/ghi bảng public.wishlists từ phía CLIENT. Chỉ chạy khi khách đã đăng nhập —
// bảng có user_id not null, khách vãng lai dùng localStorage (xem wishlist.ts).
//
// Mọi hàm ở đây NUỐT LỖI và trả về giá trị trung tính. Lý do: danh sách yêu thích luôn có bản
// local chạy song song, nên mất mạng hay RLS chặn thì UI vẫn phải dùng được — không khác gì
// luật của logEvent, hỏng thì im lặng chứ không chặn khách xem diều.
import { createBrowserSupabase } from './supabase-browser'
import type { Wishlist, WishlistItem } from './wishlist'

// Hình dạng PostgREST trả về khi join products. Supabase suy kiểu quan hệ thành mảng hay
// object tuỳ ngữ cảnh, nên khai báo tay rồi tự chuẩn hoá ở dưới.
type WishlistRow = {
  product_id: string
  created_at: string
  products: {
    slug: string
    name: string
    price_text: string
    show_price: boolean
    image_path: string | null
  } | null
}

const SELECT =
  'product_id, created_at, products(slug, name, price_text, show_price, image_path)'

function mapRow(row: WishlistRow): WishlistItem | null {
  // products null = sản phẩm đã bị RLS giấu (admin lưu trữ hàng) hoặc xoá cứng.
  // Bỏ dòng đó khỏi UI thay vì hiện một ô trống không bấm được.
  if (!row.products) return null

  return {
    productId: row.product_id,
    slug: row.products.slug,
    name: row.products.name,
    // Cùng luật với toWishlistItem trong wishlist.ts: shop tắt hiện giá thì không lưu giá,
    // để bản local và bản DB hiển thị giống hệt nhau.
    priceText: row.products.show_price ? row.products.price_text : '',
    imagePath: row.products.image_path,
    addedAt: row.created_at,
  }
}

// Trả kèm userId chứ không chỉ mảng: người gọi phải biết danh sách này của AI mới đối chiếu
// được với dấu chủ sở hữu trên bản local (xem reconcileForUser).
export type RemoteWishlist = {
  userId: string
  // null = ĐỌC HỎNG (mạng rớt, RLS chặn). Khác hẳn [] = đã đăng nhập mà chưa thích mẫu nào.
  // Nhập hai ca này làm một là đẩy nhầm danh sách local lên DB của người vừa đăng nhập.
  items: Wishlist | null
}

// null = CHƯA ĐĂNG NHẬP. Người gọi cần phân biệt với ca đã đăng nhập mà đọc hỏng ở trên:
// chưa đăng nhập thì bản local cứ dùng tiếp, còn đã đăng nhập thì phải soi dấu chủ sở hữu.
export async function fetchRemoteWishlist(): Promise<RemoteWishlist | null> {
  try {
    const supabase = createBrowserSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return null

    // Lọc user_id dù RLS đã ràng — giống removeRemote ở dưới, policy là lớp cuối chứ không
    // phải lớp duy nhất (xem CLAUDE.md). Ở ĐÂY nó còn là lớp DUY NHẤT đúng: policy
    // `wishlists_select` cố ý cho admin đọc dòng của mọi người để đếm mẫu được ưng nhiều.
    // Thiếu dòng này thì tài khoản admin/owner nhận về danh sách của KHÁCH KHÁC và tưởng là
    // của mình: /yeu-thich hiện nhầm mẫu, tim của chính họ không bao giờ ghi được vào DB
    // (mẫu "đã có trên DB" nên syncWithRemote thấy không thiếu gì để đẩy lên), và bỏ tim thì
    // lần đồng bộ sau dòng của người kia lại kéo nó về.
    const { data, error } = await supabase
      .from('wishlists')
      .select(SELECT)
      .eq('user_id', session.user.id)
    if (error) return { userId: session.user.id, items: null }

    return {
      userId: session.user.id,
      items: (data as unknown as WishlistRow[])
        .map(mapRow)
        .filter((item): item is WishlistItem => item !== null),
    }
  } catch {
    return null
  }
}

// Ghi thêm. `created_at` để DB tự đặt trừ khi truyền vào — lúc merge phải giữ đúng mốc
// khách đã thích từ trước ở máy khác, không dập thành "vừa mới thích".
export async function addRemote(items: { productId: string; addedAt?: string }[]): Promise<void> {
  if (items.length === 0) return
  try {
    const supabase = createBrowserSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('wishlists').upsert(
      items.map((item) => ({
        user_id: session.user.id,
        product_id: item.productId,
        ...(item.addedAt ? { created_at: item.addedAt } : {}),
      })),
      // Thích lại thứ đã thích không được dựng lại mốc thời gian — ignoreDuplicates giữ dòng cũ.
      { onConflict: 'user_id,product_id', ignoreDuplicates: true },
    )
  } catch {
    // Im lặng: bản local đã cập nhật rồi, lần đồng bộ sau sẽ đẩy lên lại.
  }
}

export async function removeRemote(productId: string): Promise<void> {
  try {
    const supabase = createBrowserSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    // Lọc cả user_id dù RLS đã ràng: policy là lớp cuối, không phải lớp duy nhất (xem CLAUDE.md).
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', session.user.id)
      .eq('product_id', productId)
  } catch {
    // Im lặng — xem ghi chú đầu file.
  }
}
