'use client'

// Hồ sơ khách: tên, số điện thoại, địa chỉ, ảnh đại diện. Gửi lên PUT /api/tai-khoan
// (validate + kiểm session ở đó), form này chỉ lo trải nghiệm nhập liệu.
//
// Mấy trường này KHÔNG phải để giao hàng tự động — web không nhận đơn. Chúng tồn tại để lúc
// khách nhắn Zalo, chủ shop đã có sẵn tên và số, khỏi hỏi lại từ đầu.
import { WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { MyProfile } from '@/lib/profiles'
import { AvatarUploader } from './AvatarUploader'

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-ink-950 placeholder:text-stone-500 focus:border-ink-950 focus:outline-none focus:ring-2 focus:ring-ink-950/15'

export function ProfileForm({ profile }: { profile: MyProfile }) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.fullName)
  const [phone, setPhone] = useState(profile.phone)
  const [address, setAddress] = useState(profile.address)
  const [avatarPath, setAvatarPath] = useState<string | null>(profile.avatarPath)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const response = await fetch('/api/tai-khoan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          avatarPath,
        }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        setError(result?.error?.message ?? 'Không lưu được hồ sơ')
        setSaving(false)
        return
      }

      setSaved(true)
      setSaving(false)
      // Header và các Server Component khác đọc lại hồ sơ mới (tên, ảnh).
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <AvatarUploader
        userId={profile.id}
        path={avatarPath}
        onChange={(next) => {
          setAvatarPath(next)
          setSaved(false)
        }}
      />

      <Field label="Họ và tên" htmlFor="profile-name" hint="Shop gọi tên bạn khi nhắn Zalo.">
        <input
          id="profile-name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={80}
          autoComplete="name"
          className={inputClass}
        />
      </Field>

      <Field
        label="Số điện thoại"
        htmlFor="profile-phone"
        hint="Số này chỉ shop nhìn thấy, dùng để gọi lại lúc chốt đơn."
      >
        <input
          id="profile-phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          inputMode="tel"
          maxLength={15}
          autoComplete="tel"
          className={inputClass}
        />
      </Field>

      <Field
        label="Địa chỉ nhận hàng"
        htmlFor="profile-address"
        hint="Lưu sẵn để lúc chốt đơn khỏi gõ lại. Bỏ trống cũng được."
      >
        <textarea
          id="profile-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          rows={2}
          maxLength={200}
          autoComplete="street-address"
          className={inputClass}
        />
      </Field>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-ink-950 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
        >
          {saving ? 'Đang lưu…' : 'Lưu thông tin'}
        </button>
        {saved && (
          <span role="status" className="text-sm font-semibold text-stone-600">
            Đã lưu
          </span>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-950">
        {label}
      </label>
      {children}
      {hint && <span className="text-xs text-stone-600">{hint}</span>}
    </div>
  )
}
