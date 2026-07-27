// Kiểu và hằng số của khối nội dung, KHÔNG chạm DB.
//
// Tách khỏi content-blocks.ts vì file kia import adapter server (next/headers): form admin là
// Client Component mà cần đúng danh sách section này để đổ dropdown. Client import nhầm file
// server là gãy build, và lỗi chỉ lộ lúc `npm run build` (xem bộ nhớ nextjs-client-server-import).
// 'category' đã BỎ 2026-07-27: danh mục giờ là bảng thật (src/lib/categories.ts) gắn với
// sản phẩm, không còn là ô trang trí. Đừng thêm lại vào đây.
export const SECTIONS = ['promo', 'guide', 'trust'] as const
export type Section = (typeof SECTIONS)[number]

export const SECTION_LABEL: Record<Section, string> = {
  promo: 'Khuyến mãi',
  guide: 'Kinh nghiệm chơi diều',
  trust: 'Cam kết',
}

// Nói cho admin biết mỗi khối hiện ở đâu và ô nào có tác dụng — schema chung cho bốn loại nên
// không phải ô nào cũng dùng đến.
export const SECTION_HINT: Record<Section, string> = {
  promo:
    'Dải khuyến mãi. Dùng: tiêu đề, dòng chữ vàng, mô tả, ảnh nền, đường dẫn. Khối đầu tiên hiện to gấp đôi.',
  guide:
    'Thẻ kinh nghiệm cuối trang chủ. Dùng: tiêu đề, mô tả, icon. Bỏ trống đường dẫn thì thẻ không bấm được.',
  trust: 'Dải 4 ô ngay dưới banner. Dùng: tiêu đề, mô tả, icon. Bỏ trống mô tả thì tự hiện hotline.',
}

export type ContentBlock = {
  id: string
  section: Section
  sortOrder: number
  title: string
  subtitle: string
  body: string
  href: string
  icon: string
  imagePath: string | null
  active: boolean
}

export type ContentBlockInput = Omit<ContentBlock, 'id'>
