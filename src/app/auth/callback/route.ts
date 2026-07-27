// Đích quay về sau khi xác thực. Dùng chung cho CẢ Google OAuth lẫn magic link:
// @supabase/ssr chạy luồng PKCE nên hai đường đều đổ về đây kèm ?code=...
import { NextResponse } from 'next/server'
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

  return NextResponse.redirect(`${origin}${next}`)
}
