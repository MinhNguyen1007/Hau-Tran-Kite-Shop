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

export const HOTLINE_HREF = telHref(SHOP.hotline)

export const NAV_ITEMS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Sản phẩm', href: '/san-pham' },
  { label: 'Khuyến mãi', href: '/#khuyen-mai' },
  { label: 'Danh mục', href: '/#danh-muc' },
  { label: 'Kinh nghiệm', href: '/#kinh-nghiem' },
  { label: 'Giới thiệu', href: '/#gioi-thieu' },
  { label: 'Liên hệ', href: '/lien-he' },
] as const
