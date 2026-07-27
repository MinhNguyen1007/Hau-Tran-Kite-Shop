// Adapter Supabase cho middleware. Tách khỏi supabase.ts vì middleware chạy trên Edge runtime,
// không dùng được 'next/headers' — cookie đọc/ghi qua NextRequest/NextResponse.
//
// Việc của nó: gọi getUser() mỗi request để refresh access token sắp hết hạn rồi ghi cookie mới
// vào response. Không có bước này thì Server Component sẽ thấy user đăng xuất sau ~1 giờ
// (jwt_expiry trong config.toml) dù người dùng vẫn đang thao tác.
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse
  userId: string | null
}> {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Ghi vào CẢ request lẫn response: request để đoạn code sau trong cùng middleware
          // đọc được token mới, response để trình duyệt lưu lại.
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          response = NextResponse.next({ request })
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // getUser chứ không phải getSession: getSession chỉ đọc cookie, không xác thực với Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, userId: user?.id ?? null }
}
