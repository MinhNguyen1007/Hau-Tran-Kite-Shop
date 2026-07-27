import { describe, expect, it } from 'vitest'
import { formatVnd } from './format'

describe('formatVnd', () => {
  it('định dạng số đồng theo locale vi-VN', () => {
    const out = formatVnd(450000)
    expect(out).toContain('450.000') // ngăn cách nghìn bằng dấu chấm
    expect(out).toContain('₫')
  })

  it('xử lý giá 0', () => {
    expect(formatVnd(0)).toContain('0')
  })
})
