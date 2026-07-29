// Đích quay về sau khi xác thực Google OAuth: @supabase/ssr chạy luồng PKCE nên Google đổ về
// đây kèm ?code=... rồi mới đổi lấy session.
//
// Trước đây magic link cũng đi qua route này; đường đó đã bỏ 2026-07-28. Đăng nhập bằng tài
// khoản + mật khẩu KHÔNG qua đây (signInWithPassword trả session thẳng ở client).
import { NextResponse } from 'next/server'
import { getProfile } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/roles'
import { createServerSupabase } from '@/lib/supabase'

// Chỉ nhận đường dẫn nội bộ. Không kiểm thì `?tiep-tuc=https://site-la.com` biến trang đăng nhập
// của shop thành bàn đạp phishing (open redirect). '//host' cũng là URL tuyệt đối nên phải chặn.
function safeNextPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/tai-khoan'
  return value
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = safeNextPath(searchParams.get('tiep-tuc'))

  if (!code) {
    return NextResponse.redirect(`${origin}/dang-nhap?loi=thieu-ma`)
  }

  const supabase = await createServerSupabase()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    // Mã dùng rồi hoặc hết hạn (link magic để quá lâu). Cho nhập lại email chứ không báo lỗi trần.
    return NextResponse.redirect(`${origin}/dang-nhap?loi=ma-khong-hop-le`)
  }

  // Admin đăng nhập là để làm việc, không phải để ngắm trang cá nhân: đổ thẳng vào khu quản
  // trị. Chỉ làm vậy khi không ai chỉ định đích cụ thể — bấm link ?tiep-tuc=/yeu-thich thì
  // phải tới đúng chỗ đó.
  if (next === '/tai-khoan') {
    const profile = await getProfile()
    if (profile && hasAdminAccess(profile.role)) {
      return NextResponse.redirect(`${origin}/admin`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
