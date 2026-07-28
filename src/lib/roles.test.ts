import { describe, expect, it } from 'vitest'
import { hasAdminAccess, hasOwnerAccess } from './roles'

describe('hasAdminAccess', () => {
  // Bài test quan trọng nhất file này: quên owner ở một chỗ nào đó là khoá chính chủ shop
  // ra khỏi khu quản trị của mình.
  it('cho chủ shop qua như admin', () => {
    expect(hasAdminAccess('owner')).toBe(true)
  })

  it('cho admin phụ qua', () => {
    expect(hasAdminAccess('admin')).toBe(true)
  })

  it('chặn khách thường', () => {
    expect(hasAdminAccess('user')).toBe(false)
  })
})

describe('hasOwnerAccess', () => {
  it('chỉ chủ shop qua', () => {
    expect(hasOwnerAccess('owner')).toBe(true)
  })

  // Đây là ranh giới của cả tính năng: admin phụ đứng DƯỚI chủ shop, không tự nâng mình lên,
  // không hạ được ai.
  it('chặn admin phụ khỏi việc quản lý tài khoản', () => {
    expect(hasOwnerAccess('admin')).toBe(false)
  })

  it('chặn khách thường', () => {
    expect(hasOwnerAccess('user')).toBe(false)
  })
})
