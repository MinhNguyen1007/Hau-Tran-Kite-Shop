'use client'

// MỘT cửa đăng nhập duy nhất cho tất cả: Google. Khách, admin phụ và chủ shop bấm chung nút
// này; ai vào được khu quản trị là do `role` trong public.profiles quyết định SAU khi đăng
// nhập (xem src/lib/roles.ts), không phải do một form riêng bày ngoài trang.
//
// Ô tài khoản + mật khẩu đã BỎ HẲN 2026-07-31 cùng tài khoản `adminhautran`. ĐỪNG DỰNG LẠI:
// một cửa riêng cho admin vừa thừa (phân quyền đã nằm ở tầng role) vừa nói cho người lạ biết
// web này có khu quản trị. Nếu có ngày mất đường vào, lối thoát hiểm là đổi role bằng SQL
// trong Supabase Dashboard — quy trình ghi ở docs/deploy.md, không phải dựng lại form.
import { GoogleLogo, WarningCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'

// Lỗi do /auth/callback đẩy về qua query string sau khi đổi code lấy session thất bại.
const CALLBACK_ERRORS: Record<string, string> = {
  'thieu-ma': 'Đăng nhập Google không thành công. Thử lại giúp shop nhé.',
  'ma-khong-hop-le': 'Phiên đăng nhập đã hết hạn. Bấm đăng nhập Google lại nhé.',
}

export function LoginForm({ next, callbackError }: { next: string; callbackError?: string }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(
    callbackError ? (CALLBACK_ERRORS[callbackError] ?? 'Đăng nhập không thành công.') : null,
  )

  async function signInWithGoogle() {
    setPending(true)
    setError(null)

    const supabase = createBrowserSupabase()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Dựng ở lúc bấm chứ không phải lúc render: window không tồn tại khi server render.
      options: { redirectTo: `${window.location.origin}/auth/callback?tiep-tuc=${encodeURIComponent(next)}` },
    })

    if (oauthError) {
      // Hay gặp nhất ở local: chưa bật [auth.external.google] trong config.toml. Giờ Google là
      // đường DUY NHẤT nên hỏng cái này là không ai vào được, kể cả chủ shop.
      setError('Đăng nhập Google đang trục trặc. Nhắn Zalo cho shop giúp nhé.')
      setPending(false)
    }
    // Thành công thì trình duyệt đã rời trang, không cần dọn state.
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending}
        className="flex items-center justify-center gap-2.5 rounded-full bg-ink-950 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
      >
        <GoogleLogo size={20} weight="bold" />
        {pending ? 'Đang chuyển tới Google…' : 'Tiếp tục với Google'}
      </button>

      <p className="text-sm leading-relaxed text-stone-600">
        Lần đầu bấm là shop tạo tài khoản cho bạn luôn, không phải đăng ký riêng.
      </p>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
