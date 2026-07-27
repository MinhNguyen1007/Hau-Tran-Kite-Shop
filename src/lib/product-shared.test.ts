import { describe, expect, it } from 'vitest'
import { formatVnd } from './format'
import { formatPriceRange, formatProductPrice, priceRange } from './product-shared'

describe('priceRange', () => {
  it('mẫu không có cỡ thì min = max = priceVnd', () => {
    expect(priceRange({ priceVnd: 450_000 })).toEqual({ min: 450_000, max: 450_000 })
  })

  it('mảng cỡ rỗng cũng rơi về priceVnd', () => {
    expect(priceRange({ priceVnd: 450_000, sizes: [] })).toEqual({ min: 450_000, max: 450_000 })
  })

  it('có cỡ thì lấy khoảng từ bảng cỡ, KHÔNG dùng priceVnd', () => {
    const range = priceRange({
      priceVnd: 999,
      sizes: [{ priceVnd: 2_200_000 }, { priceVnd: 1_000_000 }, { priceVnd: 3_000_000 }],
    })
    expect(range).toEqual({ min: 1_000_000, max: 3_000_000 })
  })

  it('một cỡ duy nhất thì min = max', () => {
    expect(priceRange({ priceVnd: 0, sizes: [{ priceVnd: 1_400_000 }] })).toEqual({
      min: 1_400_000,
      max: 1_400_000,
    })
  })
})

// Intl.NumberFormat('vi-VN') ngăn số với ký hiệu ₫ bằng NBSP (U+00A0), không phải dấu cách
// thường — so chuỗi bằng literal gõ tay sẽ trượt dù nhìn y hệt. Dựng mốc so sánh từ chính
// formatVnd thay vì chép chuỗi.
describe('formatPriceRange', () => {
  it('một mức thì hiện đúng một con số', () => {
    expect(formatPriceRange(450_000, 450_000)).toBe(formatVnd(450_000))
  })

  it('khoảng giá dùng en dash và chỉ mang MỘT ký hiệu ₫ ở cuối', () => {
    const text = formatPriceRange(1_000_000, 3_000_000)
    expect(text).toBe(`1.000.000 – ${formatVnd(3_000_000)}`)
    expect(text.match(/₫/g)).toHaveLength(1)
    expect(text.endsWith(formatVnd(3_000_000))).toBe(true)
  })
})

describe('formatProductPrice', () => {
  it('ghép priceRange và formatPriceRange', () => {
    expect(
      formatProductPrice({
        priceVnd: 0,
        sizes: [{ priceVnd: 1_000_000 }, { priceVnd: 3_000_000 }],
      }),
    ).toBe(`1.000.000 – ${formatVnd(3_000_000)}`)
  })
})
