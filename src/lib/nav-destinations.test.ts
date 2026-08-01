import { describe, expect, it } from 'vitest'
import { checkNavHref, KNOWN_ANCHORS, NAV_DESTINATIONS } from './nav-destinations'

describe('checkNavHref', () => {
  it('nhận mọi đích trong danh sách thả xuống', () => {
    for (const item of NAV_DESTINATIONS) {
      expect(checkNavHref(item.href), item.href).toBeNull()
    }
  })

  // Hai hằng này rời nhau nên dễ lệch: thêm neo vào KNOWN_ANCHORS mà quên thêm dòng tương ứng
  // vào NAV_DESTINATIONS thì admin gõ tay mới tới được khối đó, ô chọn không bày ra.
  it('mọi neo đã biết đều có mặt trong danh sách thả xuống', () => {
    const hrefs = NAV_DESTINATIONS.map((item) => item.href)
    for (const anchor of KNOWN_ANCHORS) {
      expect(hrefs, anchor).toContain(`/#${anchor}`)
    }
  })

  it('nhận đường dẫn nội bộ gõ tay, kể cả có tham số truy vấn', () => {
    expect(checkNavHref('/san-pham?danh-muc=sao')).toBeNull()
    expect(checkNavHref('  /lien-he  ')).toBeNull()
  })

  it('từ chối ô trống', () => {
    expect(checkNavHref('')).toBe('Chưa nhập đường dẫn')
    expect(checkNavHref('   ')).toBe('Chưa nhập đường dẫn')
  })

  it('từ chối link ngoài', () => {
    expect(checkNavHref('https://facebook.com')).toContain('bắt đầu bằng dấu /')
    expect(checkNavHref('san-pham')).toContain('bắt đầu bằng dấu /')
  })

  // Đây là ca dễ lọt nhất: bắt đầu bằng '/' nên nhìn như đường dẫn nội bộ, mà trình duyệt
  // hiểu là địa chỉ ngoài.
  it('từ chối địa chỉ protocol-relative', () => {
    expect(checkNavHref('//evil.com')).toContain('không nhận link ngoài')
    expect(checkNavHref('/\\evil.com')).toContain('không nhận link ngoài')
  })

  it('từ chối khoảng trắng giữa đường dẫn', () => {
    expect(checkNavHref('/san pham')).toContain('khoảng trắng')
  })

  it('từ chối neo trỏ vào khối không có trên trang chủ', () => {
    expect(checkNavHref('/#khuyen-mai')).toContain('không có khối nào tên')
    expect(checkNavHref('/#kinh-nghiem')).toContain('không có khối nào tên')
  })

  it('từ chối neo gắn vào trang không phải trang chủ', () => {
    expect(checkNavHref('/san-pham#danh-muc')).toContain('chỉ dùng được với trang chủ')
  })

  it('từ chối nhiều hơn một dấu #', () => {
    expect(checkNavHref('/#danh-muc#gioi-thieu')).toContain('một dấu #')
  })

  it('từ chối đường dẫn quá dài', () => {
    expect(checkNavHref('/' + 'a'.repeat(300))).toContain('quá dài')
  })
})
