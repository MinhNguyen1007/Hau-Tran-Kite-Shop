import { describe, expect, it } from 'vitest'
import { ACCOUNT_EMAIL_DOMAIN, toDisplayName, toLoginEmail } from './login-identifier'

describe('toLoginEmail', () => {
  it('ghép tên tài khoản với tên miền nội bộ', () => {
    expect(toLoginEmail('adminhautran')).toBe(`adminhautran@${ACCOUNT_EMAIL_DOMAIN}`)
  })

  // Admin phụ nâng lên từ tài khoản Google đăng nhập bằng chính email của họ — ghép thêm
  // tên miền vào là biến email thật thành một địa chỉ không tồn tại.
  it('giữ nguyên khi người dùng gõ email thật', () => {
    expect(toLoginEmail('minhnguyen10072004@gmail.com')).toBe('minhnguyen10072004@gmail.com')
  })

  it('bỏ khoảng trắng thừa và chuẩn hoá chữ hoa', () => {
    expect(toLoginEmail('  AdminHauTran  ')).toBe(`adminhautran@${ACCOUNT_EMAIL_DOMAIN}`)
  })

  // Chuỗi rỗng phải ra rỗng chứ không phải '@hautran-kite.local' — gửi chuỗi đó lên Supabase
  // là một request rác chắc chắn hỏng.
  it('trả rỗng khi chưa nhập gì', () => {
    expect(toLoginEmail('   ')).toBe('')
  })
})

describe('toDisplayName', () => {
  it('cắt tên miền nội bộ, chỉ hiện tên tài khoản', () => {
    expect(toDisplayName(`adminhautran@${ACCOUNT_EMAIL_DOMAIN}`)).toBe('adminhautran')
  })

  it('giữ nguyên email thật', () => {
    expect(toDisplayName('khach@gmail.com')).toBe('khach@gmail.com')
  })

  it('có câu thay thế khi tài khoản chưa có email', () => {
    expect(toDisplayName(null)).toBe('(chưa có email)')
  })
})
