// Danh sách yêu thích ("Diều tôi thích"). Thay cho giỏ hàng: shop chốt đơn qua Zalo/điện thoại
// nên web không cần số lượng, không cần tổng tiền — chỉ cần nhớ khách ưng mẫu nào.
//
// Nguồn lưu trữ có HAI: localStorage (khách vãng lai) và bảng public.wishlists (khách đã đăng
// nhập). File này giữ THUẦN — không React, không chạm window ở top level, không gọi Supabase —
// để unit test được. Phần chạm localStorage gom ở cuối, luôn bọc try/catch: Safari private mode
// ném khi setItem. Phần chạm DB nằm ở wishlist-remote.ts.
import { formatVnd } from './format'

export type WishlistItem = {
  productId: string
  slug: string
  name: string
  // Ảnh chụp lúc bấm thích — CHỈ để hiển thị nhanh khi mở lại trang. Giá thật luôn lấy lại
  // từ DB ở trang chi tiết; danh sách để lâu thì snapshot có thể cũ.
  //
  // Chuỗi đã sẵn sàng hiển thị ("3 triệu – 5 triệu"). Rỗng = shop không công khai giá mẫu
  // này, UI bỏ trống chỗ đó.
  priceText: string
  imagePath: string | null
  // ISO. Dùng để xếp mới nhất lên đầu và để merge local ↔ DB có kết quả xác định.
  addedAt: string
}

export type Wishlist = WishlistItem[]

// Product (src/lib/products.ts) → dòng yêu thích. Nhận tham số theo cấu trúc thay vì import
// kiểu Product: products.ts kéo theo adapter server (next/headers), không đụng vào từ client.
export function toWishlistItem(product: {
  id: string
  slug: string
  name: string
  priceText: string
  showPrice: boolean
  imagePath: string | null
}): Omit<WishlistItem, 'addedAt'> {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    // Chụp lại đúng thứ khách đang nhìn thấy: shop tắt hiện giá thì danh sách cũng không hiện.
    priceText: product.showPrice ? product.priceText : '',
    imagePath: product.imagePath,
  }
}

const STORAGE_KEY = 'kite_wishlist_v1'

// Mới nhất lên đầu. Tách riêng để local và DB xếp cùng một luật, không lệch nhau khi merge.
function byNewest(a: WishlistItem, b: WishlistItem): number {
  return b.addedAt.localeCompare(a.addedAt)
}

export function hasItem(list: Wishlist, productId: string): boolean {
  return list.some((item) => item.productId === productId)
}

// Thích một sản phẩm. Đã có rồi thì LÀM MỚI SNAPSHOT chứ không nhân đôi dòng — nút thích là
// nút bật/tắt nên đường này chỉ đi qua khi state client lệch với thực tế (vd merge từ tab khác).
export function addItem(
  list: Wishlist,
  item: Omit<WishlistItem, 'addedAt'>,
  addedAt = new Date().toISOString(),
): Wishlist {
  const existing = list.find((line) => line.productId === item.productId)
  if (!existing) {
    return [{ ...item, addedAt }, ...list].sort(byNewest)
  }
  // Giữ addedAt CŨ: đó là lúc khách thật sự ưng mẫu này, không phải lúc đồng bộ lại.
  return list
    .map((line) =>
      line.productId === item.productId ? { ...line, ...item, addedAt: line.addedAt } : line,
    )
    .sort(byNewest)
}

export function removeItem(list: Wishlist, productId: string): Wishlist {
  return list.filter((line) => line.productId !== productId)
}

export function wishlistCount(list: Wishlist): number {
  return list.length
}

// Gộp danh sách local (khách vãng lai) với danh sách trên DB lúc đăng nhập.
// Luật: hợp của hai bên, trùng productId thì giữ addedAt SỚM HƠN (lần ưng đầu tiên) nhưng lấy
// snapshot tên/giá của bên `remote` — DB là nguồn tin cậy hơn localStorage để lâu.
export function mergeWishlists(local: Wishlist, remote: Wishlist): Wishlist {
  const merged = new Map<string, WishlistItem>()

  for (const item of local) merged.set(item.productId, item)

  for (const item of remote) {
    const mine = merged.get(item.productId)
    merged.set(
      item.productId,
      mine ? { ...item, addedAt: mine.addedAt < item.addedAt ? mine.addedAt : item.addedAt } : item,
    )
  }

  return [...merged.values()].sort(byNewest)
}

// localStorage chứa dữ liệu người dùng sửa được và dữ liệu của bản build cũ — không tin cấu trúc.
// Dòng nào không đúng hình dạng thì bỏ qua, thà mất một dòng còn hơn vỡ cả trang.
// priceText CỐ Ý không bắt buộc: dòng lưu trước 2026-07-27 mang `priceVnd` dạng số thay vì
// chuỗi. Từ chối chúng là xoá sạch danh sách của khách chỉ vì ta đổi schema — thà nhận vào
// rồi dựng lại chuỗi giá ở normaliseItem.
function isValidItem(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false
  const line = value as Record<string, unknown>
  return (
    typeof line.productId === 'string' &&
    typeof line.slug === 'string' &&
    typeof line.name === 'string' &&
    (typeof line.imagePath === 'string' || line.imagePath === null) &&
    typeof line.addedAt === 'string'
  )
}

// Dựng dòng đúng kiểu hiện tại từ dòng bất kỳ đã qua isValidItem.
// Dòng cũ có priceVnd (số) → format lại thành chuỗi để khách không mất phần giá đã lưu.
function normaliseItem(line: Record<string, unknown>): WishlistItem {
  const priceText =
    typeof line.priceText === 'string'
      ? line.priceText
      : typeof line.priceVnd === 'number' && Number.isFinite(line.priceVnd)
        ? formatVnd(line.priceVnd)
        : ''

  return {
    productId: line.productId as string,
    slug: line.slug as string,
    name: line.name as string,
    priceText,
    imagePath: (line.imagePath ?? null) as string | null,
    addedAt: line.addedAt as string,
  }
}

export function parseWishlist(raw: string | null): Wishlist {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidItem).map(normaliseItem).sort(byNewest)
  } catch {
    return []
  }
}

export function loadWishlist(): Wishlist {
  if (typeof window === 'undefined') return []
  try {
    return parseWishlist(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return []
  }
}

export function saveWishlist(list: Wishlist): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    // Hết quota hoặc trình duyệt chặn storage — danh sách vẫn chạy trong phiên này, chỉ không bền.
  }
}

export { STORAGE_KEY as WISHLIST_STORAGE_KEY }
