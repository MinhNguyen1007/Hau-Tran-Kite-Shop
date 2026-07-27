// Chạy trước mọi request: refresh session Supabase và chặn sớm các trang cần đăng nhập.
// (Next 16 đổi tên quy ước `middleware.ts` thành `proxy.ts`, nội dung vẫn là middleware.)
//
// Chặn ở đây CHỈ để UX (khỏi vào trang rồi mới báo lỗi). Nó KHÔNG phải lớp bảo mật —
// quyền thật vẫn do requireAdmin() ở tầng API/page và RLS trong DB quyết định (xem CLAUDE.md).
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

const PROTECTED_PREFIXES = ['/tai-khoan', '/admin']

export default async function proxy(request: NextRequest) {
  const { response, userId } = await updateSession(request)

  const { pathname } = request.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (needsAuth && !userId) {
    const loginUrl = new URL('/dang-nhap', request.url)
    // Đăng nhập xong quay lại đúng trang đang muốn vào.
    loginUrl.searchParams.set('tiep-tuc', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Bỏ qua asset tĩnh và ảnh: chúng không cần session, chạy proxy chỉ tốn thời gian.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
