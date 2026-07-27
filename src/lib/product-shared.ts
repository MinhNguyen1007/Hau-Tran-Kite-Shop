// Kiểu và hàm tính giá của sản phẩm, KHÔNG chạm DB.
//
// Tách khỏi products.ts vì file kia import adapter server (next/headers): Client Component
// (nút yêu thích, form admin) cần các kiểu này. Client import nhầm file server là gãy build,
// và lỗi chỉ lộ lúc `npm run build` (xem bộ nhớ nextjs-client-server-import).
import { formatVnd } from './format'

export type ProductSize = {
  id: string
  // Nhãn tự do: "3 mét", "5 mét", "cuộn 100m"… Shop không chỉ bán thứ đo bằng sải cánh.
  label: string
  priceVnd: number
  sortOrder: number
}

export type ProductImage = {
  id: string
  imagePath: string
  alt: string
  sortOrder: number
}

// Khoảng giá của một sản phẩm.
//  - Có bảng cỡ  → từ giá nhỏ nhất tới lớn nhất trong bảng đó.
//  - Không có cỡ → một mức duy nhất, min = max = priceVnd.
// Trả về min/max thay vì chuỗi để nơi gọi tự chọn cách hiển thị (card ngắn, chi tiết dài).
export function priceRange(product: {
  priceVnd: number
  sizes?: { priceVnd: number }[]
}): { min: number; max: number } {
  const prices = (product.sizes ?? []).map((size) => size.priceVnd)
  if (prices.length === 0) return { min: product.priceVnd, max: product.priceVnd }
  return { min: Math.min(...prices), max: Math.max(...prices) }
}

// "1.000.000 ₫" khi một mức, "1.000.000 – 3.000.000 ₫" khi có khoảng.
// Dấu – là en dash (U+2013), đúng dấu của khoảng giá trị, không phải dấu trừ.
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatVnd(min)
  // Bỏ ký hiệu ₫ ở vế đầu để không lặp hai lần trong cùng một chuỗi.
  return `${formatVnd(min).replace(/\s*₫\s*$/, '')} – ${formatVnd(max)}`
}

export function formatProductPrice(product: { priceVnd: number; sizes?: { priceVnd: number }[] }): string {
  const { min, max } = priceRange(product)
  return formatPriceRange(min, max)
}
