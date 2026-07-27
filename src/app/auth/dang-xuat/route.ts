// POST /auth/dang-xuat — đăng xuất rồi về trang chủ.
// Là POST chứ không phải GET có chủ ý: link GET sẽ bị trình duyệt/tiện ích prefetch,
// người dùng đang xem trang tự dưng bị đăng xuất.
import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  // 303: đổi POST thành GET khi chuyển hướng, không thì trình duyệt POST lại vào trang chủ.
  return NextResponse.redirect(origin, { status: 303 })
}
