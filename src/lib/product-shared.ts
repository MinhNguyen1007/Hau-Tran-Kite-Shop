// Kiểu dữ liệu sản phẩm dùng chung, KHÔNG chạm DB.
//
// Tách khỏi products.ts vì file kia import adapter server (next/headers): Client Component
// (nút yêu thích, form admin) cần các kiểu này. Client import nhầm file server là gãy build,
// và lỗi chỉ lộ lúc `npm run build` (xem bộ nhớ nextjs-client-server-import).
//
// Giá KHÔNG còn là số (đổi 2026-07-27): shop báo khoảng ("3 triệu – 5 triệu") chứ không có
// bảng giá cố định, nên `priceText` là chữ tự do và không có hàm format nào ở đây nữa.

export type ProductImage = {
  id: string
  imagePath: string
  alt: string
  sortOrder: number
}

// Có hiện giá lên UI hay không. Gom thành hàm để card, trang chi tiết và danh sách yêu thích
// dùng chung một luật, không nơi nào lỡ quên kiểm showPrice.
export function visiblePrice(product: { priceText: string; showPrice: boolean }): string | null {
  if (!product.showPrice) return null
  const text = product.priceText.trim()
  return text === '' ? null : text
}
