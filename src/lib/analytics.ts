// logEvent — clickstream GĐ1 (xem skill event-logging). Gọi ở MỌI chỗ khách chạm vào.
//
// Ràng buộc BẤT BIẾN:
//  - Fire-and-forget: người gọi KHÔNG await. Bấm thêm giỏ thì giỏ cập nhật ngay, không đợi log.
//  - KHÔNG BAO GIỜ throw: toàn bộ bọc try/catch nuốt lỗi. Analytics chết thì im lặng chết.
//  - KHÔNG chặn UI, không toast lỗi khi log hỏng.
//
import { createBrowserSupabase } from './supabase-browser'

// CẤM đổi tên loại đã dùng — dữ liệu lịch sử sẽ lệch không sửa được (xem CLAUDE.md).
// Cần loại mới thì THÊM vào cuối.
export type EventType =
  // Đang dùng
  | 'page_view'
  | 'product_view'
  | 'add_to_wishlist'
  | 'remove_from_wishlist'
  // Bấm nút gọi / Zalo — đây là "chuyển đổi" của web này, thay chỗ order_paid ngày trước.
  | 'contact_click'
  | 'search'
  | 'contact_submitted'
  // NGỪNG BẮN từ 2026-07-27 (bỏ thanh toán online, giỏ hàng thành danh sách yêu thích).
  // Giữ lại trong union để dữ liệu cũ trong bảng events vẫn đọc được bằng đúng kiểu này.
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_started'
  | 'order_paid'

const SESSION_COOKIE = 'kite_sid'
const ONE_YEAR = 60 * 60 * 24 * 365

// session_id là BẮT BUỘC (nối chuỗi hành vi khách chưa login). Sinh uuid ở lần ghé đầu, giữ nguyên.
function getSessionId(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)kite_sid=([^;]+)/)
  if (match) return match[1]
  const sid = crypto.randomUUID()
  document.cookie = `${SESSION_COOKIE}=${sid}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`
  return sid
}

export async function logEvent(
  type: EventType,
  payload?: { productId?: string; properties?: Record<string, unknown> },
): Promise<void> {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const supabase = createBrowserSupabase()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    await supabase.from('events').insert({
      session_id: sessionId,
      user_id: session?.user?.id ?? null,
      event_type: type,
      product_id: payload?.productId ?? null,
      properties: payload?.properties ?? {},
    })
  } catch {
    // Im lặng — không bao giờ làm sập luồng bán hàng vì analytics.
  }
}
