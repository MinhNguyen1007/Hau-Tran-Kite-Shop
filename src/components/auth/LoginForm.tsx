'use client'

// Hai đường đăng nhập (magic link qua email đã BỎ 2026-07-28 theo yêu cầu user):
//   - Google — đường của khách và của admin phụ nâng từ tài khoản Google.
//   - Tài khoản + mật khẩu — đường của chủ shop; tên tài khoản được ghép thành email nội bộ.
//
// Cả hai bày ra cùng lúc chứ không giấu cái nào sau liên kết nhỏ như trước: khi chỉ còn hai
// lựa chọn thì giấu bớt một cái chỉ làm người dùng phải mò.
import { GoogleLogo, WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toLoginEmail } from '@/lib/login-identifier'
import { createBrowserSupabase } from '@/lib/supabase-browser'

// Thông báo lỗi do callback route đẩy về qua query string. Route đó giờ chỉ còn phục vụ
// luồng Google (đổi code lấy session).
const CALLBACK_ERRORS: Record<string, string> = {
  'thieu-ma': 'Đăng nhập Google không thành công. Thử lại giúp shop nhé.',
  'ma-khong-hop-le': 'Phiên đăng nhập đã hết hạn. Bấm đăng nhập Google lại nhé.',
}

export function LoginForm({ next, callbackError }: { next: string; callbackError?: string }) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<'google' | 'password' | null>(null)
  const [error, setError] = useState<string | null>(
    callbackError ? (CALLBACK_ERRORS[callbackError] ?? 'Đăng nhập không thành công.') : null,
  )

  async function signInWithGoogle() {
    setPending('google')
    setError(null)

    const supabase = createBrowserSupabase()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      // Dựng ở lúc bấm chứ không phải lúc render: window không tồn tại khi server render.
      options: { redirectTo: `${window.location.origin}/auth/callback?tiep-tuc=${encodeURIComponent(next)}` },
    })

    if (oauthError) {
      // Hay gặp nhất ở local: chưa bật [auth.external.google] trong config.toml.
      setError('Chưa bật đăng nhập Google. Dùng tài khoản và mật khẩu phía dưới nhé.')
      setPending(null)
    }
    // Thành công thì trình duyệt đã rời trang, không cần dọn state.
  }

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending('password')
    setError(null)

    const supabase = createBrowserSupabase()
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      // Tên tài khoản được ghép thành email nội bộ; gõ email thật thì giữ nguyên.
      email: toLoginEmail(identifier),
      password,
    })

    if (passwordError) {
      // CỐ Ý không nói rõ sai tên tài khoản hay sai mật khẩu: tách hai câu là cho phép dò ra
      // tên tài khoản quản trị nào có thật.
      setError('Tài khoản hoặc mật khẩu không đúng.')
      setPending(null)
      return
    }

    // Không dùng window.location: router.refresh() để Server Component đọc lại session mới,
    // rồi mới điều hướng — không thì trang đích render bằng session cũ và đá về đăng nhập.
    router.refresh()
    router.replace(next)
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending !== null}
        className="flex items-center justify-center gap-2.5 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:text-stone-500"
      >
        <GoogleLogo size={20} weight="bold" className="text-stone-400" />
        {pending === 'google' ? 'Đang chuyển tới Google…' : 'Đăng nhập bằng Google'}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-200" />
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">hoặc</span>
        <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form onSubmit={signInWithPassword} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="login-identifier" className="text-sm font-semibold text-ink-900">
            Tài khoản
          </label>
          <input
            id="login-identifier"
            type="text"
            required
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            // KHÔNG đặt tên tài khoản thật làm gợi ý: thông báo lỗi bên dưới cố ý không tách
            // "sai tài khoản" với "sai mật khẩu" để không ai dò được tên quản trị nào có thật,
            // mà một cái placeholder thì đưa luôn tên đó ra cho người chưa đăng nhập.
            placeholder="Tên tài khoản hoặc email"
            className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="login-password" className="text-sm font-semibold text-ink-900">
            Mật khẩu
          </label>
          <input
            id="login-password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
          />
        </div>

        <button
          type="submit"
          disabled={pending !== null}
          className="mt-1 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
        >
          {pending === 'password' ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
      </form>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
