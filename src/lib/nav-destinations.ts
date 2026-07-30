// Đích hợp lệ cho một mục menu chính, và luật kiểm đường dẫn gõ tay.
//
// File THUẦN, không chạm next/headers: cả zod ở server lẫn form phía client dùng chung một
// định nghĩa. Hai nơi tự định nghĩa "đường dẫn thế nào là hợp lệ" thì sớm muộn cũng lệch nhau,
// và cái lệch đó chỉ lộ ra khi admin gõ đúng thứ form cho qua mà API chặn.

// Danh sách thả xuống trong form. Cố ý KHÔNG sinh tự động từ cây route: /admin và các trang
// chỉ dành cho admin không được phép lọt vào menu của khách.
export const NAV_DESTINATIONS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/san-pham', label: 'Tất cả sản phẩm' },
  { href: '/#danh-muc', label: 'Trang chủ — khối Danh mục' },
  { href: '/#gioi-thieu', label: 'Trang chủ — khối Giới thiệu' },
  { href: '/lien-he', label: 'Liên hệ' },
  { href: '/yeu-thich', label: 'Danh sách yêu thích' },
] as const

// Id của những khối THẬT SỰ có trên trang chủ: CategoryGrid.tsx và AboutStrip.tsx.
// Thêm neo mới vào đây thì phải có element mang đúng id đó, không thì bấm vào nhảy hụt —
// đúng cái bẫy đã dính với mục 'Kinh nghiệm' và 'Khuyến mãi' hồi 2026-07-28.
export const KNOWN_ANCHORS = ['danh-muc', 'gioi-thieu'] as const

export const NAV_HREF_MAX = 200

// Trả về câu lỗi tiếng Việt, hoặc null nếu đường dẫn dùng được.
export function checkNavHref(raw: string): string | null {
  const href = raw.trim()

  if (href === '') return 'Chưa nhập đường dẫn'
  if (href.length > NAV_HREF_MAX) return `Đường dẫn quá dài (tối đa ${NAV_HREF_MAX} ký tự)`
  if (!href.startsWith('/')) return 'Đường dẫn phải bắt đầu bằng dấu /'

  // '//example.com' và '/\example.com' bắt đầu bằng '/' nhưng trình duyệt hiểu là địa chỉ
  // NGOÀI (protocol-relative). Không chặn thì một mục menu đưa thẳng khách ra khỏi web mà
  // nhìn vào ô nhập vẫn tưởng là đường dẫn nội bộ.
  if (/^\/[/\\]/.test(href)) return 'Menu chính chỉ nhận đường dẫn trong web, không nhận link ngoài'

  if (/\s/.test(href)) return 'Đường dẫn không được có khoảng trắng'

  const hashCount = (href.match(/#/g) ?? []).length
  if (hashCount > 1) return 'Đường dẫn chỉ được có một dấu #'

  if (hashCount === 1) {
    const [path, anchor] = href.split('#')
    // Neo chỉ tồn tại trên trang chủ; '/san-pham#danh-muc' cuộn không tới đâu cả.
    if (path !== '/') return 'Neo (dấu #) chỉ dùng được với trang chủ, ví dụ /#danh-muc'
    if (!KNOWN_ANCHORS.includes(anchor as (typeof KNOWN_ANCHORS)[number])) {
      return `Trang chủ không có khối nào tên “${anchor}”. Đang có: ${KNOWN_ANCHORS.join(', ')}`
    }
  }

  return null
}
