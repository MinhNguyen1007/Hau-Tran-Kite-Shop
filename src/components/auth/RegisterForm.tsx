'use client'

// Đăng ký tài khoản khách — email + mật khẩu, không hỏi gì thêm.
//
// Hồ sơ trong bảng `profiles` KHÔNG tạo ở đây: trigger `handle_new_user` trên auth.users tự
// chèn, role mặc định là 'user'. Đừng thêm insert ở client, sẽ đụng RLS và tạo dòng trùng.
//
// Ở local `enable_confirmations = false` nên đăng ký xong có session luôn. Trên cloud có thể
// bật xác nhận email, khi đó signUp trả session = null — nhánh đó vẫn xử lý để không im lặng
// đứng yên khi lên production.
import { WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabase-browser'

// Khớp minimum_password_length trong supabase/config.toml. Lệch xuống thấp hơn thì form nhận
// nhưng Supabase từ chối, người dùng chỉ thấy lỗi chung chung.
const MIN_PASSWORD = 6

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pending, setPending] = useState(false)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    // Chặn TRƯỚC khi gọi Supabase: gõ lệch mật khẩu là lỗi của form, không phải của server.
    // Gửi đi rồi mới biết thì đã lỡ tạo tài khoản bằng mật khẩu người dùng gõ nhầm.
    if (password !== confirm) {
      setError('Mật khẩu nhập lại không khớp.')
      return
    }

    setPending(true)

    const supabase = createBrowserSupabase()
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes('already')
          ? 'Email này đã có tài khoản. Bấm “Đăng nhập” phía dưới nhé.'
          : 'Không tạo được tài khoản. Kiểm tra lại email và mật khẩu giúp shop nhé.',
      )
      setPending(false)
      return
    }

    if (!data.session) {
      setNeedsConfirm(true)
      setPending(false)
      return
    }

    // Không dùng window.location: router.refresh() để Server Component đọc lại session mới,
    // rồi mới điều hướng — không thì trang đích render bằng session cũ và đá về đăng nhập.
    router.refresh()
    router.replace(next)
  }

  if (needsConfirm) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <p className="text-base font-bold text-ink-950">Đã tạo tài khoản</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Mở hộp thư <strong className="font-semibold">{email}</strong> và bấm liên kết xác nhận,
          rồi quay lại đăng nhập.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="register-email" className="text-sm font-semibold text-ink-900">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ban@example.com"
          className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-sm font-semibold text-ink-900">
          Mật khẩu
        </label>
        <input
          id="register-password"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20"
        />
        <span className="text-xs text-stone-600">Ít nhất {MIN_PASSWORD} ký tự.</span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="register-confirm" className="text-sm font-semibold text-ink-900">
          Nhập lại mật khẩu
        </label>
        <input
          id="register-confirm"
          type="password"
          required
          minLength={MIN_PASSWORD}
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          // aria-invalid: trình đọc màn hình phải biết ô NÀO sai, chứ dòng lỗi ở cuối form
          // không nói được nó thuộc về ô nào.
          aria-invalid={confirm !== '' && confirm !== password}
          className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400/20 aria-invalid:border-red-400 aria-invalid:focus:border-red-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
      >
        {pending ? 'Đang tạo tài khoản…' : 'Đăng ký'}
      </button>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </form>
  )
}
