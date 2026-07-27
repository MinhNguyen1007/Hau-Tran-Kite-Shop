'use client'

// Hai đường đăng nhập: Google (đường chính) và magic link qua email (đường dự phòng, và là
// đường DUY NHẤT test được ở local khi chưa có credential Google — xem supabase/config.toml).
import { EnvelopeSimple, GoogleLogo, WarningCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'

// Thông báo lỗi do callback route đẩy về qua query string.
const CALLBACK_ERRORS: Record<string, string> = {
  'thieu-ma': 'Liên kết đăng nhập không hợp lệ. Thử lại giúp shop nhé.',
  'ma-khong-hop-le': 'Liên kết đã dùng rồi hoặc hết hạn. Gửi lại liên kết mới nhé.',
}

export function LoginForm({ next, callbackError }: { next: string; callbackError?: string }) {
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState<'google' | 'email' | null>(null)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(
    callbackError ? (CALLBACK_ERRORS[callbackError] ?? 'Đăng nhập không thành công.') : null,
  )

  // Dựng ở lúc bấm chứ không phải lúc render: window không tồn tại khi server render.
  function callbackUrl() {
    return `${window.location.origin}/auth/callback?tiep-tuc=${encodeURIComponent(next)}`
  }

  async function signInWithGoogle() {
    setPending('google')
    setError(null)

    const supabase = createBrowserSupabase()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl() },
    })

    if (oauthError) {
      // Hay gặp nhất ở local: chưa bật [auth.external.google] trong config.toml.
      setError('Chưa bật đăng nhập Google. Dùng magic link phía dưới giúp shop nhé.')
      setPending(null)
    }
    // Thành công thì trình duyệt đã rời trang, không cần dọn state.
  }

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending('email')
    setError(null)

    const supabase = createBrowserSupabase()
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    })

    if (otpError) {
      setError('Không gửi được liên kết. Kiểm tra lại email giúp shop nhé.')
      setPending(null)
      return
    }

    setSent(true)
    setPending(null)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-ink-900">
        <span className="flex items-center gap-2 text-base font-bold text-brand-700 dark:text-brand-400">
          <EnvelopeSimple size={22} weight="fill" />
          Đã gửi liên kết đăng nhập
        </span>
        <p className="text-sm text-stone-700 dark:text-stone-300">
          Mở hộp thư <strong className="font-semibold">{email}</strong> và bấm vào liên kết để vào
          tài khoản.
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false)
            setError(null)
          }}
          className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
        >
          Dùng email khác
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={pending !== null}
        className="flex items-center justify-center gap-2.5 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-stone-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:text-stone-500 dark:border-ink-700 dark:bg-ink-900 dark:text-stone-100 dark:hover:bg-ink-800"
      >
        <GoogleLogo size={20} weight="bold" className="text-brand-600 dark:text-brand-400" />
        {pending === 'google' ? 'Đang chuyển tới Google…' : 'Đăng nhập bằng Google'}
      </button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-stone-200 dark:bg-ink-700" />
        <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          hoặc
        </span>
        <span className="h-px flex-1 bg-stone-200 dark:bg-ink-700" />
      </div>

      <form onSubmit={sendMagicLink} className="flex flex-col gap-2">
        <label htmlFor="login-email" className="text-sm font-semibold text-ink-900 dark:text-stone-100">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ban@example.com"
          className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 dark:border-ink-700 dark:bg-ink-900 dark:text-stone-100 dark:placeholder:text-stone-400"
        />
        <span className="text-xs text-stone-600 dark:text-stone-400">
          Shop gửi một liên kết đăng nhập, không cần mật khẩu.
        </span>

        <button
          type="submit"
          disabled={pending !== null}
          className="mt-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-ink-800 dark:disabled:text-stone-400"
        >
          {pending === 'email' ? 'Đang gửi…' : 'Gửi liên kết đăng nhập'}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-brand-700 dark:text-brand-400"
        >
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
