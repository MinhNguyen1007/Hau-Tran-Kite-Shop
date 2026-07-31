// Nâng một tài khoản ĐÃ CÓ lên vai chủ shop ('owner').
//
//   node scripts/nang-chu-shop.mjs <email>
//   OWNER_EMAIL=... node scripts/nang-chu-shop.mjs
//
// Thay cho `tao-chu-shop.mjs` (xoá 2026-07-31, hồi còn đăng nhập bằng tên tài khoản + mật
// khẩu). Giờ mọi người vào bằng Google, mà tài khoản Google thì KHÔNG tạo sẵn được bằng
// script — Google mới là nơi giữ danh tính. Nên thứ tự bắt buộc là:
//
//   1. Người đó tự vào /dang-nhap bấm "Tiếp tục với Google" một lần
//      (Gmail của họ phải nằm trong Test users của Google nếu app còn ở trạng thái Testing).
//   2. Trigger handle_new_user tạo hồ sơ role 'user'.
//   3. Chạy script này để nâng lên 'owner'.
//
// Chạy được nhiều lần. CHỈ CÓ MỘT chủ shop (unique index profiles_one_owner), nên nếu đang có
// chủ khác thì script tự hạ người cũ xuống 'admin' — cố ý không hạ thẳng về 'user' để bàn
// giao xong người cũ vẫn sửa được nội dung, khỏi tự khoá mình ra ngoài giữa chừng.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Script chạy bằng Node thuần nên không có sẵn env của Next — tự đọc .env.local.
function loadEnv() {
  const text = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (match) process.env[match[1]] ??= match[2].trim().replace(/^["']|["']$/g, '')
  }
}

const email = (process.argv[2] ?? process.env.OWNER_EMAIL ?? '').trim().toLowerCase()

if (!email || !email.includes('@')) {
  console.error('Thiếu email. Dùng: node scripts/nang-chu-shop.mjs <email>')
  process.exit(1)
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local')
  process.exit(1)
}

// Service role BỎ QUA RLS — đúng chỗ cần dùng: policy update profiles đòi người gọi đã là
// owner, mà lúc bootstrap thì chưa có owner nào. Key này chỉ sống trong script chạy tay.
const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const { data: list, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 })
if (listError) {
  console.error('Không đọc được danh sách tài khoản:', listError.message)
  process.exit(1)
}

const target = list.users.find((user) => user.email?.toLowerCase() === email)
if (!target) {
  console.error(`Chưa có tài khoản nào dùng email ${email}.`)
  console.error('Người đó phải vào /dang-nhap bấm "Tiếp tục với Google" một lần trước đã.')
  console.error('App Google còn ở trạng thái Testing thì Gmail đó cũng phải nằm trong Test users.')
  process.exit(1)
}

// Hạ chủ cũ TRƯỚC, không thì unique index profiles_one_owner chặn với lỗi 23505.
const { data: current, error: currentError } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('role', 'owner')
  .maybeSingle()

if (currentError) {
  console.error('Không đọc được chủ shop hiện tại:', currentError.message)
  process.exit(1)
}

if (current && current.id === target.id) {
  console.log(`${email} đã là chủ shop rồi, không phải đổi gì.`)
  process.exit(0)
}

if (current) {
  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', current.id)
  if (error) {
    console.error('Không hạ được chủ shop cũ:', error.message)
    process.exit(1)
  }
  console.log(`Đã hạ ${current.email} từ chủ shop xuống admin phụ.`)
}

const { error: promoteError } = await supabase
  .from('profiles')
  .update({ role: 'owner' })
  .eq('id', target.id)

if (promoteError) {
  console.error(
    promoteError.code === '23505'
      ? 'Vẫn còn một chủ shop khác. Hạ tài khoản đó xuống trước.'
      : `Không nâng được vai trò: ${promoteError.message}`,
  )
  process.exit(1)
}

console.log(`Xong. ${email} giờ là chủ shop, vào /admin/tai-khoan quản lý được tài khoản.`)
