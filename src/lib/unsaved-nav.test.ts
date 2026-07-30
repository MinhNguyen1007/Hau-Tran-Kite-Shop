import { describe, expect, it } from 'vitest'
import { type NavClick, shouldWarnBeforeLeaving } from './unsaved-nav'

// Mốc: đang sửa một sản phẩm, click chuột trái vào link nội bộ khác trang.
function click(overrides: Partial<NavClick> = {}): NavClick {
  return {
    button: 0,
    modifierPressed: false,
    href: 'http://localhost:3000/admin/san-pham',
    anchorTarget: '',
    isDownload: false,
    currentUrl: 'http://localhost:3000/admin/san-pham/abc-123',
    ...overrides,
  }
}

describe('shouldWarnBeforeLeaving', () => {
  it('chặn click thường sang trang khác trong app', () => {
    expect(shouldWarnBeforeLeaving(click())).toBe(true)
  })

  it('KHÔNG chặn khi giữ Ctrl/Cmd/Shift/Alt — người dùng mở tab mới, không rời trang', () => {
    expect(shouldWarnBeforeLeaving(click({ modifierPressed: true }))).toBe(false)
  })

  it('KHÔNG chặn chuột giữa và chuột phải', () => {
    expect(shouldWarnBeforeLeaving(click({ button: 1 }))).toBe(false)
    expect(shouldWarnBeforeLeaving(click({ button: 2 }))).toBe(false)
  })

  it('KHÔNG chặn link mở tab mới', () => {
    expect(shouldWarnBeforeLeaving(click({ anchorTarget: '_blank' }))).toBe(false)
  })

  it('chặn link khai target="_self" — vẫn là rời trang', () => {
    expect(shouldWarnBeforeLeaving(click({ anchorTarget: '_self' }))).toBe(true)
  })

  it('KHÔNG chặn link tải file', () => {
    expect(shouldWarnBeforeLeaving(click({ isDownload: true }))).toBe(false)
  })

  it('KHÔNG chặn link ra ngoài site — beforeunload lo phần đó', () => {
    expect(shouldWarnBeforeLeaving(click({ href: 'https://zalo.me/0387315341' }))).toBe(false)
  })

  it('KHÔNG chặn href không phải http (tel, mailto)', () => {
    expect(shouldWarnBeforeLeaving(click({ href: 'tel:0387315341' }))).toBe(false)
    expect(shouldWarnBeforeLeaving(click({ href: 'mailto:shop@example.com' }))).toBe(false)
  })

  it('KHÔNG chặn neo trong cùng trang — chỉ khác #hash', () => {
    expect(
      shouldWarnBeforeLeaving(
        click({ href: 'http://localhost:3000/admin/san-pham/abc-123#anh' }),
      ),
    ).toBe(false)
  })

  it('CHẶN khi chỉ khác query — ?danh-muc=sao là trang khác', () => {
    expect(
      shouldWarnBeforeLeaving(
        click({
          currentUrl: 'http://localhost:3000/admin/san-pham',
          href: 'http://localhost:3000/admin/san-pham?danh-muc=sao',
        }),
      ),
    ).toBe(true)
  })
})
