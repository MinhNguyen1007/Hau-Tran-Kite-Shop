import { describe, expect, it } from 'vitest'
import { visiblePrice } from './product-shared'

describe('visiblePrice', () => {
  it('trả về chữ giá khi admin bật hiện giá', () => {
    expect(visiblePrice({ priceText: '3 triệu – 5 triệu', showPrice: true })).toBe(
      '3 triệu – 5 triệu',
    )
  })

  // Hai đường ẩn giá khác nhau, cả hai đều phải ra null — nếu không, chỗ này hiện giá
  // chỗ kia không, khách thấy mâu thuẫn.
  it('ẩn khi admin tắt hiện giá, dù đã ghi giá', () => {
    expect(visiblePrice({ priceText: '3 triệu', showPrice: false })).toBeNull()
  })

  it('ẩn khi chưa ghi giá', () => {
    expect(visiblePrice({ priceText: '', showPrice: true })).toBeNull()
  })

  it('coi chuỗi toàn khoảng trắng là chưa ghi giá', () => {
    expect(visiblePrice({ priceText: '   ', showPrice: true })).toBeNull()
  })
})
