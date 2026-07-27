'use client'

// Form liên hệ. Gửi lên POST /api/lien-he (validate + ghi DB ở đó), rồi mới bắn
// logEvent('contact_submitted') — chỉ log khi server đã nhận thật, không log lúc bấm nút.
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { logEvent } from '@/lib/analytics'

type Status = 'idle' | 'sending' | 'sent'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    setStatus('sending')
    setError(null)

    try {
      const response = await fetch('/api/lien-he', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          phone: data.get('phone'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không gửi được tin nhắn, thử lại giúp shop nhé')
        setStatus('idle')
        return
      }

      form.reset()
      setStatus('sent')
      logEvent('contact_submitted')
    } catch {
      // Mất mạng giữa chừng — fetch ném trước khi có response.
      setError('Mất kết nối. Kiểm tra mạng rồi gửi lại giúp shop nhé')
      setStatus('idle')
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-start gap-3 rounded-xl border border-brand-200 bg-brand-50 p-6 dark:border-brand-800 dark:bg-ink-900">
        <span className="flex items-center gap-2 text-base font-bold text-brand-700 dark:text-brand-400">
          <CheckCircle size={22} weight="fill" />
          Đã gửi tin nhắn
        </span>
        <p className="text-sm text-stone-700 dark:text-stone-300">
          Shop sẽ gọi lại trong ngày. Nếu gấp, bạn gọi thẳng hotline giúp shop.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-sm font-semibold text-brand-700 hover:underline dark:text-brand-400"
        >
          Gửi tin khác
        </button>
      </div>
    )
  }

  const sending = status === 'sending'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field label="Tên của bạn" name="name" required maxLength={100} autoComplete="name" />
      <Field
        label="Số điện thoại"
        name="phone"
        type="tel"
        required
        maxLength={20}
        autoComplete="tel"
        hint="Shop gọi lại qua số này."
      />
      <Field
        label="Email"
        name="email"
        type="email"
        maxLength={200}
        autoComplete="email"
        hint="Không bắt buộc."
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-semibold text-ink-900 dark:text-stone-100">
          Nội dung
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={2000}
          placeholder="Bạn muốn đặt diều cỡ nào, hoạ tiết ra sao?"
          className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 dark:border-ink-700 dark:bg-ink-900 dark:text-stone-100 dark:placeholder:text-stone-400"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-brand-700 dark:text-brand-400"
        >
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="mt-1 self-start rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-ink-800 dark:disabled:text-stone-400"
      >
        {sending ? 'Đang gửi…' : 'Gửi tin nhắn'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  hint,
  type = 'text',
  ...inputProps
}: {
  label: string
  name: string
  hint?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = `contact-${name}`
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-ink-900 dark:text-stone-100">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        {...inputProps}
        className="rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-stone-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30 dark:border-ink-700 dark:bg-ink-900 dark:text-stone-100 dark:placeholder:text-stone-400"
      />
      {hint && <span className="text-xs text-stone-600 dark:text-stone-400">{hint}</span>}
    </div>
  )
}
