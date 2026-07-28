// Tạo (hoặc đặt lại mật khẩu cho) tài khoản CHỦ SHOP — vai trò 'owner', duy nhất một cái.
//
//   node scripts/tao-chu-shop.mjs <tên tài khoản> <mật khẩu>
//   OWNER_USERNAME=... OWNER_PASSWORD=... node scripts/tao-chu-shop.mjs
//
// Mật khẩu truyền lúc chạy chứ KHÔNG nằm trong repo: viết thẳng vào migration hay vào file
// nào đó trong git là commit secret, và migration thì ai clone cũng đọc được.
//
// Chạy được nhiều lần: đã có tài khoản thì đổi mật khẩu, không tạo trùng.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// PHẢI khớp ACCOUNT_EMAIL_DOMAIN trong src/lib/login-identifier.ts. Chép ra đây chứ không
// import: script chạy bằng Node thuần, import file .ts cần loader mà dự án chưa có.
// Lệch hai chỗ này là tạo tài khoản một đằng, đăng nhập tìm một nẻo.
const ACCOUNT_EMAIL_DOMAIN = 'hautran-kite.local'

// Script chạy bằng Node thuần nên không có sẵn env của Next — tự đọc .env.local.
function loadEnv() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (match) process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '')
  }
}

const [argUser, argPassword] = process.argv.slice(2)
const username = (argUser ?? process.env.OWNER_USERNAME ?? '').trim().toLowerCase()
const password = argPassword ?? process.env.OWNER_PASSWORD ?? ''

if (!username || !password) {
  console.error('Thiếu tham số. Dùng: node scripts/tao-chu-shop.mjs <tên tài khoản> <mật khẩu>')
  process.exit(1)
}
if (password.length < 8) {
  console.error('Mật khẩu phải từ 8 ký tự trở lên (Supabase Auth từ chối mật khẩu ngắn hơn).')
  process.exit(1)
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local')
  process.exit(1)
}

// Service role BỎ QUA RLS — đúng chỗ cần dùng: chưa có chủ shop nào thì không ai có quyền
// tự phong. Key này chỉ sống trong script chạy tay ở máy, không bao giờ ra tới trình duyệt.
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const email = username.includes('@') ? username : `${username}@${ACCOUNT_EMAIL_DOMAIN}`

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (listError) {
  console.error('Không đọc được danh sách tài khoản:', listError.message)
  process.exit(1)
}

const existing = list.users.find((user) => user.email === email)
let userId

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { password })
  if (error) {
    console.error('Không đặt lại được mật khẩu:', error.message)
    process.exit(1)
  }
  userId = existing.id
  console.log(`Đã đặt lại mật khẩu cho ${email}`)
} else {
  // email_confirm: hộp thư .local không nhận được thư nên phải xác nhận sẵn, không thì
  // Supabase chặn đăng nhập với lỗi "Email not confirmed".
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('Không tạo được tài khoản:', error.message)
    process.exit(1)
  }
  userId = data.user.id
  console.log(`Đã tạo tài khoản ${email}`)
}

// Trigger handle_new_user đã tạo profile với role 'user'; nâng lên 'owner' ở đây.
// Unique index profiles_one_owner sẽ báo lỗi nếu đã có chủ shop khác — cố ý, để không
// lỡ tay tạo ra hai chủ.
const { error: roleError } = await supabase
  .from('profiles')
  .update({ role: 'owner' })
  .eq('id', userId)

if (roleError) {
  console.error(
    roleError.code === '23505'
      ? 'Đã có một tài khoản chủ shop khác. Hạ tài khoản đó xuống trước, hoặc dùng chính nó.'
      : `Không đặt được vai trò chủ shop: ${roleError.message}`,
  )
  process.exit(1)
}

console.log(`Xong. Đăng nhập bằng tài khoản "${username}" tại /dang-nhap`)
