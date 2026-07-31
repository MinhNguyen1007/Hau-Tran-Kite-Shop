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

// Danh sách kèm DẤU CHỦ SỞ HỮU. Bản trên localStorage phải mang theo nó, không thì tài khoản
// nào đăng nhập trên máy này cũng nhận vơ danh sách người trước bỏ lại (xem reconcileForUser).
export type StoredWishlist = {
  // uid của tài khoản đã đồng bộ danh sách này lần cuối.
  // null = của khách vãng lai, chưa thuộc về ai — ca DUY NHẤT được phép merge lên tài khoản.
  ownerId: string | null
  items: Wishlist
}

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

// Danh sách nào thắng khi một tài khoản vừa đăng nhập trên trình duyệt này.
//
// Tới 2026-07-31 bản local KHÔNG mang danh tính, nên mọi tài khoản đăng nhập sau đều nuốt
// luôn danh sách người trước bỏ lại VÀ đẩy nó lên DB của mình — khách mới mở /yeu-thich đã
// thấy sẵn một mẫu diều chưa từng bấm. Từ nay: dấu của tài khoản KHÁC thì vứt bản local đi,
// DB là nguồn đúng. Chỉ danh sách chưa thuộc về ai (khách vãng lai vừa bấm tim rồi đăng
// nhập) mới được merge lên — đó vốn là mục đích của tính năng merge.
export function reconcileForUser(
  stored: StoredWishlist,
  remote: Wishlist,
  userId: string,
): Wishlist {
  if (stored.ownerId !== null && stored.ownerId !== userId) return remote
  return mergeWishlists(stored.items, remote)
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

function parseList(value: unknown): Wishlist {
  if (!Array.isArray(value)) return []
  return value.filter(isValidItem).map(normaliseItem).sort(byNewest)
}

// Đọc cả HAI hình dạng đã từng nằm trong localStorage:
//   - mảng trần            → bản trước 2026-07-31, không có dấu chủ sở hữu
//   - { ownerId, items }   → bản hiện tại
// Mảng trần coi như của khách vãng lai (ownerId null): người đang giữ nó phần lớn là khách
// chưa đăng nhập bao giờ, xoá thẳng là cướp mất danh sách thật của họ. Dấu sẽ được đóng ngay
// lần đồng bộ đầu tiên sau khi đăng nhập, nên cửa rò chỉ mở đúng một lần cho mỗi máy cũ.
export function parseStored(raw: string | null): StoredWishlist {
  if (!raw) return { ownerId: null, items: [] }
  try {
    const parsed: unknown = JSON.parse(raw)
    if (Array.isArray(parsed)) return { ownerId: null, items: parseList(parsed) }
    if (typeof parsed !== 'object' || parsed === null) return { ownerId: null, items: [] }

    const record = parsed as Record<string, unknown>
    return {
      ownerId: typeof record.ownerId === 'string' ? record.ownerId : null,
      items: parseList(record.items),
    }
  } catch {
    return { ownerId: null, items: [] }
  }
}

export function loadStored(): StoredWishlist {
  if (typeof window === 'undefined') return { ownerId: null, items: [] }
  try {
    return parseStored(window.localStorage.getItem(STORAGE_KEY))
  } catch {
    return { ownerId: null, items: [] }
  }
}

export function saveStored(stored: StoredWishlist): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch {
    // Hết quota hoặc trình duyệt chặn storage — danh sách vẫn chạy trong phiên này, chỉ không bền.
  }
}

// Xoá hẳn KEY chứ không lưu danh sách rỗng: không để lại dấu tài khoản vừa đăng xuất trên
// máy chung. removeItem cũng bắn sự kiện 'storage' nên các tab khác tự dọn theo.
export function clearStored(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Xem saveStored.
  }
}

export { STORAGE_KEY as WISHLIST_STORAGE_KEY }
