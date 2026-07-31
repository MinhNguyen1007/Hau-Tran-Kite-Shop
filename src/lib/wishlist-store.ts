// Store danh sách yêu thích dạng external store (không React) để hook dùng useSyncExternalStore.
//
// Vì sao không phải useState + useEffect: danh sách nằm ở localStorage, mà localStorage chỉ có ở
// client. Đọc nó trong useEffect rồi setState là cascading render (React Compiler chặn thẳng).
// useSyncExternalStore là đúng công cụ: server snapshot = danh sách rỗng, client snapshot =
// danh sách thật. Tiện thể có luôn đồng bộ giữa các tab qua sự kiện 'storage'.
//
// logEvent gọi ngay trong các action ở đây chứ không rải ở từng nút: mọi đường vào/ra đều đi qua
// store, đặt ở đây thì không có cửa nào thích/bỏ thích mà quên log (xem skill event-logging).
import { logEvent } from './analytics'
import {
  addItem,
  clearStored,
  loadStored,
  reconcileForUser,
  removeItem,
  saveStored,
  WISHLIST_STORAGE_KEY,
  type Wishlist,
  type WishlistItem,
} from './wishlist'
import { addRemote, fetchRemoteWishlist, removeRemote } from './wishlist-remote'

export type WishlistState = {
  items: Wishlist
  // false = chưa đọc xong localStorage. UI dùng để không nháy "chưa thích gì" ở render đầu.
  hydrated: boolean
}

// Cùng một object cho server snapshot và client snapshot đầu tiên → markup hai bên khớp nhau.
const INITIAL: WishlistState = { items: [], hydrated: false }

let state: WishlistState = INITIAL
let subscribed = false
const listeners = new Set<() => void>()

// Tài khoản đang sở hữu danh sách trong `state`. null = của khách vãng lai.
// Để NGOÀI snapshot vì không component nào cần vẽ theo nó; đổi giá trị này không phải là
// đổi thứ hiện trên màn hình.
let ownerId: string | null = null

function emit(): void {
  for (const listener of listeners) listener()
}

function commit(items: Wishlist): void {
  state = { items, hydrated: true }
  saveStored({ ownerId, items })
  emit()
}

// Tab khác vừa đổi danh sách → nạp lại. Chỉ phản ứng đúng key; key === null là lệnh clear().
function handleStorage(event: StorageEvent): void {
  if (event.key !== null && event.key !== WISHLIST_STORAGE_KEY) return
  // Nhận cả dấu chủ sở hữu: tab kia vừa đăng xuất thì tab này cũng phải quên tài khoản cũ,
  // không thì lần đồng bộ sau nó tưởng danh sách rỗng vẫn là của người vừa đi.
  const stored = loadStored()
  ownerId = stored.ownerId
  state = { items: stored.items, hydrated: true }
  emit()
}

// Hợp nhất bản local với bản trên DB. Chạy một lần lúc trang mở, KHÔNG await ở đường đi của
// người dùng: bản local đã hiển thị được ngay rồi, DB về sau thì cập nhật thêm.
//
// Chưa đăng nhập → fetchRemoteWishlist trả null → không làm gì, cứ dùng localStorage.
async function syncWithRemote(): Promise<void> {
  const remote = await fetchRemoteWishlist()
  if (!remote) return // Chưa đăng nhập — cứ dùng localStorage như khách vãng lai.

  // Đọc DB hỏng: KHÔNG merge, nhưng vẫn phải gỡ danh sách của tài khoản khác khỏi màn hình.
  // Bỏ qua nhánh này là để nguyên cửa hậu cho đúng cái bug đang vá.
  if (!remote.items) {
    if (ownerId !== null && ownerId !== remote.userId) {
      ownerId = remote.userId
      commit([])
    }
    return
  }

  const items = reconcileForUser({ ownerId, items: state.items }, remote.items, remote.userId)

  // Đóng dấu TRƯỚC commit: commit ghi xuống localStorage kèm ownerId hiện tại.
  ownerId = remote.userId
  commit(items)

  // Thứ có ở local mà DB chưa có = khách đã thích lúc chưa đăng nhập. Đẩy lên kèm addedAt gốc.
  // Ca "vứt bản local" không rơi vào đây: items lúc đó CHÍNH LÀ bản DB nên không thiếu dòng nào.
  const remoteIds = new Set(remote.items.map((item) => item.productId))
  const missing = items.filter((item) => !remoteIds.has(item.productId))
  if (missing.length > 0) {
    await addRemote(missing.map((item) => ({ productId: item.productId, addedAt: item.addedAt })))
  }
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  // Lần subscribe đầu tiên mới đọc localStorage. React gọi subscribe sau khi mount và tự
  // kiểm lại snapshot ngay sau đó, nên đổi state đồng bộ ở đây là an toàn.
  if (!subscribed) {
    subscribed = true
    const stored = loadStored()
    ownerId = stored.ownerId
    state = { items: stored.items, hydrated: true }
    window.addEventListener('storage', handleStorage)
    // Đăng nhập bằng magic link/Google đi qua /auth/callback rồi redirect → trang tải lại từ
    // đầu → subscribe chạy lại → merge diễn ra đúng lúc đó. Không cần nghe onAuthStateChange.
    void syncWithRemote()
  }

  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): WishlistState {
  return state
}

export function getServerSnapshot(): WishlistState {
  return INITIAL
}

export function add(item: Omit<WishlistItem, 'addedAt'>): void {
  const addedAt = new Date().toISOString()
  commit(addItem(state.items, item, addedAt))
  // Fire-and-forget: danh sách đã cập nhật ở dòng trên, không await log lẫn ghi DB.
  logEvent('add_to_wishlist', { productId: item.productId })
  void addRemote([{ productId: item.productId, addedAt }])
}

export function remove(productId: string): void {
  if (!state.items.some((item) => item.productId === productId)) return

  commit(removeItem(state.items, productId))
  logEvent('remove_from_wishlist', { productId })
  void removeRemote(productId)
}

// Đăng xuất — quên sạch danh sách trên MÁY NÀY. Trên DB vẫn còn nguyên, đăng nhập lại là thấy.
//
// Cần cả cái này lẫn dấu ownerId, không thay nhau được: dấu chặn danh sách người trước chui
// vào DB người sau, còn xoá ở đây để người dùng máy chung không nhìn thấy diều người trước
// đã thích ngay lúc vừa đăng xuất.
//
// CỐ Ý không bắn remove_from_wishlist: khách không bỏ thích mẫu nào cả. Bắn ở đây là bơm rác
// vào thống kê và làm hỏng ý nghĩa của loại event đó (xem skill event-logging).
export function clearWishlist(): void {
  ownerId = null
  state = { items: [], hydrated: true }
  clearStored()
  emit()
}

// Nút trái tim là nút bật/tắt. Trả về trạng thái SAU khi bấm để nút tự đổi nhãn mà không
// phải đọc lại store.
export function toggle(item: Omit<WishlistItem, 'addedAt'>): boolean {
  const liked = state.items.some((line) => line.productId === item.productId)
  if (liked) {
    remove(item.productId)
    return false
  }
  add(item)
  return true
}
