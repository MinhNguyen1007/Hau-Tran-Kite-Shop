// Số liệu cho trang tổng quan /admin. Mọi con số ở đây LẤY TỪ DB, không có số bịa để
// trang trí — nhìn thấy "0" là thật sự chưa có dữ liệu.
//
// Đọc qua client thường (không service role) nên RLS vẫn chặn: events chỉ trả dòng khi
// is_admin(). Layout /admin đã requireAdmin, đây là lớp thứ hai.
import { createServerSupabase } from './supabase'

export type AdminOverview = {
  visibleProducts: number
  archivedProducts: number
  categories: number
  // Bảy ngày gần nhất, tính từ bảng events.
  pageViews: number
  wishlistAdds: number
  contactClicks: number
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

// Đếm hỏng thì trả 0 chứ không throw: một con số hụt trên trang tổng quan không đáng để
// làm trắng cả khu quản trị.
function safeCount(result: { count: number | null; error: unknown }): number {
  if (result.error) return 0
  return result.count ?? 0
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createServerSupabase()
  const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString()

  const countEventsSince = (type: string) =>
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', type)
      .gte('occurred_at', since)

  // Sáu truy vấn đếm, không cái nào phụ thuộc cái nào — chạy song song.
  const [products, archived, categories, views, wishlist, contacts] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).is('archived_at', null),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .not('archived_at', 'is', null),
    supabase.from('categories').select('id', { count: 'exact', head: true }).is('archived_at', null),
    countEventsSince('page_view'),
    countEventsSince('add_to_wishlist'),
    countEventsSince('contact_click'),
  ])

  return {
    visibleProducts: safeCount(products),
    archivedProducts: safeCount(archived),
    categories: safeCount(categories),
    pageViews: safeCount(views),
    wishlistAdds: safeCount(wishlist),
    contactClicks: safeCount(contacts),
  }
}

// ---------------------------------------------------------------------------
// Số liệu cho biểu đồ. Gộp trong bộ nhớ chứ không group by trong SQL: PostgREST không làm
// được GROUP BY, mà viết hẳn một RPC cho vài nghìn dòng là đổi lấy phức tạp không cần thiết.
// Có `limit` chặn trên để một ngày nào đó events phình lên thì trang vẫn không treo — lúc đó
// mới là lúc dựng view/materialized view trong Postgres.
// ---------------------------------------------------------------------------

export type DailyCount = { day: string; count: number }
export type ProductCount = { productId: string; count: number }
export type ActivityItem = {
  id: number
  type: string
  productId: string | null
  occurredAt: string
}

export type AdminInsights = {
  // 14 ngày gần nhất, đủ cả ngày không có lượt nào (0) để biểu đồ không co lại méo mó.
  dailyViews: DailyCount[]
  // TOÀN BỘ lượt xem theo mẫu, đã xếp giảm dần — trang tổng quan vừa lấy 5 mẫu đầu cho bảng
  // xếp hạng, vừa gộp theo danh mục cho biểu đồ tròn, nên không cắt sẵn ở đây.
  productViews: ProductCount[]
  topWishlisted: ProductCount[]
  viewsToday: number
  wishlistToday: number
  recent: ActivityItem[]
}

const DAYS_ON_CHART = 14
const LOOKBACK_DAYS = 30
const MAX_EVENTS = 5000

// Ngày theo múi giờ Việt Nam chứ không theo UTC: 7 giờ sáng ở VN vẫn là "hôm qua" theo UTC,
// biểu đồ sẽ dồn nhầm cột.
const dayKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function toDayKey(iso: string): string {
  return dayKeyFormatter.format(new Date(iso))
}

function topN(counts: Map<string, number>, n: number): ProductCount[] {
  return [...counts.entries()]
    .map(([productId, count]) => ({ productId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
}

export async function getAdminInsights(): Promise<AdminInsights> {
  const supabase = await createServerSupabase()
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('events')
    .select('id, event_type, product_id, occurred_at')
    .gte('occurred_at', since)
    .order('occurred_at', { ascending: false })
    .limit(MAX_EVENTS)

  const rows = error
    ? []
    : ((data ?? []) as {
        id: number
        event_type: string
        product_id: string | null
        occurred_at: string
      }[])

  const viewsByDay = new Map<string, number>()
  const viewsByProduct = new Map<string, number>()
  const wishlistByProduct = new Map<string, number>()

  const today = dayKeyFormatter.format(new Date())
  let viewsToday = 0
  let wishlistToday = 0

  for (const row of rows) {
    const day = toDayKey(row.occurred_at)

    if (row.event_type === 'page_view') {
      viewsByDay.set(day, (viewsByDay.get(day) ?? 0) + 1)
      if (day === today) viewsToday += 1
    }

    if (row.event_type === 'product_view' && row.product_id) {
      viewsByProduct.set(row.product_id, (viewsByProduct.get(row.product_id) ?? 0) + 1)
    }

    if (row.event_type === 'add_to_wishlist' && row.product_id) {
      wishlistByProduct.set(row.product_id, (wishlistByProduct.get(row.product_id) ?? 0) + 1)
      if (day === today) wishlistToday += 1
    }
  }

  // Dựng đủ 14 cột kể cả ngày rỗng, cũ → mới.
  const dailyViews: DailyCount[] = []
  for (let offset = DAYS_ON_CHART - 1; offset >= 0; offset -= 1) {
    const day = dayKeyFormatter.format(new Date(Date.now() - offset * 24 * 60 * 60 * 1000))
    dailyViews.push({ day, count: viewsByDay.get(day) ?? 0 })
  }

  return {
    dailyViews,
    productViews: topN(viewsByProduct, Number.MAX_SAFE_INTEGER),
    topWishlisted: topN(wishlistByProduct, 5),
    viewsToday,
    wishlistToday,
    recent: rows.slice(0, 12).map((row) => ({
      id: row.id,
      type: row.event_type,
      productId: row.product_id,
      occurredAt: row.occurred_at,
    })),
  }
}
