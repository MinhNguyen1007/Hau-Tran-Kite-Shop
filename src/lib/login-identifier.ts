// Tài khoản quản trị đăng nhập bằng TÊN TÀI KHOẢN ("adminhautran") chứ không phải email:
// chủ shop không cần dựng một hộp thư thật chỉ để vào trang quản trị.
//
// Supabase Auth thì chỉ biết email, nên tên tài khoản được ghép với một tên miền cố định
// thành email nội bộ trước khi gửi đi. '.local' là tên miền dành riêng cho mạng nội bộ
// (RFC 6762), không ai đăng ký được ngoài Internet — email nội bộ này không bao giờ đụng
// email thật của khách, và cũng không ai nhận được thư gửi tới nó.
//
// File thuần, không import gì: LoginForm là Client Component, script tạo tài khoản chạy
// bằng Node, cả hai phải dùng chung đúng một quy tắc ghép.
export const ACCOUNT_EMAIL_DOMAIN = 'hautran-kite.local'

// Có '@' thì coi như người dùng gõ email thật và giữ nguyên: admin phụ được nâng lên từ
// tài khoản Google vẫn đăng nhập bằng chính email của họ, không phải bịa ra tên tài khoản.
export function toLoginEmail(identifier: string): string {
  const value = identifier.trim().toLowerCase()
  if (value === '') return ''
  return value.includes('@') ? value : `${value}@${ACCOUNT_EMAIL_DOMAIN}`
}

// Ngược lại, để hiện cho người đọc: email nội bộ thì chỉ hiện tên tài khoản, email thật
// giữ nguyên. Dùng ở trang quản lý tài khoản.
export function toDisplayName(email: string | null): string {
  if (!email) return '(chưa có email)'
  const suffix = `@${ACCOUNT_EMAIL_DOMAIN}`
  return email.endsWith(suffix) ? email.slice(0, -suffix.length) : email
}
