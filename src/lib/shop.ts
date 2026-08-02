// Thông tin shop dùng chung cho header/footer/hero. Gom một chỗ để không rải chuỗi
// hard-code khắp component. Tên + hotline lấy từ banner thật của shop.
// TODO(shop): email và địa chỉ đang là placeholder — thay bằng thông tin thật trước khi deploy.
export const SHOP = {
  name: 'Diều Cánh Cốc Hậu Trần',
  tagline: 'Diều cánh cốc thủ công, khung tre vót tay',
  hotline: '0387315341',
  email: 'lienhe@dieucanhcochautran.vn',
  area: 'Nhận đặt và giao diều toàn quốc',
} as const

// Shop chốt đơn qua Zalo/điện thoại chứ không qua web (quyết định 2026-07-26), nên hai link
// này là "nút mua hàng" thật sự của trang. zalo.me/<số> mở đúng cuộc trò chuyện trên app lẫn web.
//
// Nhận số qua tham số chứ không đọc site_settings: Client Component cũng gọi hai hàm này, mà
// site-settings.ts import next/headers nên kéo vào client là GÃY BUILD — lỗi chỉ lộ ra lúc
// `npm run build`, dev server vẫn chạy bình thường.
export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`
export const zaloHref = (phone: string) => `https://zalo.me/${phone.replace(/\s/g, '')}`

// ĐỪNG thêm lại hằng kiểu `HOTLINE_HREF = telHref(SHOP.hotline)`. Nó từng tồn tại ở đây và
// `MobileMenu` đã lỡ dùng, hậu quả là admin đổi số trong /admin/cai-dat mà nút gọi trên điện
// thoại vẫn quay số dự phòng. Số hiển thị luôn phải đi từ `site_settings` xuống qua prop;
// `SHOP` chỉ được dùng làm giá trị dự phòng trong site-settings.ts khi truy vấn hỏng.

export type NavLink = { label: string; href: string }

// Menu chính giờ nằm trong bảng `nav_items`, admin sửa ở /admin/cai-dat — đọc qua
// getNavLinks() trong src/lib/nav-items.ts.
//
// Mảng dưới đây chỉ còn là DỰ PHÒNG cho lúc truy vấn hỏng, giống hằng SHOP ở trên: mất menu
// là mất đường đi của cả web, tệ hơn nhiều so với hiện tạm 5 mục cũ. Nó KHÔNG phải nguồn
// sự thật nữa — sửa ở đây không đổi được menu đang chạy.
//
// 'Kinh nghiệm' và 'Khuyến mãi' đã gỡ 2026-07-28 cùng lúc với khối của chúng trên trang chủ.
// Mục nav trỏ vào khối không còn tồn tại thì bấm vào nhảy hụt — luật kiểm neo nằm ở
// src/lib/nav-destinations.ts để bẫy đó không lặp lại.
export const FALLBACK_NAV_ITEMS: readonly NavLink[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/#san-pham' },
  { label: 'Danh mục', href: '/#danh-muc' },
  { label: 'Giới thiệu', href: '/#gioi-thieu' },
  { label: 'Liên hệ', href: '/#lien-he' },
]
