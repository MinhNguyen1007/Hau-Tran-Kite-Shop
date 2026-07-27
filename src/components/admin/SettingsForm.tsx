'use client'

// Form cấu hình chung của shop. Gửi lên /api/admin/cai-dat (validate + kiểm quyền ở đó),
// form này chỉ lo trải nghiệm nhập liệu.
import { CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SiteSettings } from '@/lib/site-settings'
import { Field, inputClass } from './FormField'

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const router = useRouter()

  // Một state cho cả form: 11 ô mà mỗi ô một useState thì phần render dài gấp đôi phần việc.
  const [form, setForm] = useState<SiteSettings>(settings)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setSaved(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/cai-dat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không lưu được cấu hình')
        setSaving(false)
        return
      }

      setSaved(true)
      setSaving(false)
      // Header/footer là Server Component đọc cùng bảng này — refresh để thấy số mới ngay.
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Tên shop" htmlFor="shop-name" hint="Hiện ở header, footer và thẻ tiêu đề trình duyệt">
        <input
          id="shop-name"
          value={form.shopName}
          onChange={(event) => set('shopName', event.target.value)}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <Field label="Câu mô tả ngắn" htmlFor="shop-tagline">
        <input
          id="shop-tagline"
          value={form.tagline}
          onChange={(event) => set('tagline', event.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Hotline" htmlFor="shop-hotline" hint="Số hiện trên nút Gọi">
          <input
            id="shop-hotline"
            type="tel"
            value={form.hotline}
            onChange={(event) => set('hotline', event.target.value)}
            required
            maxLength={20}
            className={inputClass}
          />
        </Field>

        <Field label="Số Zalo" htmlFor="shop-zalo" hint="Thường trùng hotline, nhưng để riêng được">
          <input
            id="shop-zalo"
            type="tel"
            value={form.zaloPhone}
            onChange={(event) => set('zaloPhone', event.target.value)}
            required
            maxLength={20}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Email" htmlFor="shop-email" hint="Để trống nếu shop không dùng email">
        <input
          id="shop-email"
          type="email"
          value={form.email}
          onChange={(event) => set('email', event.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <Field label="Khu vực phục vụ" htmlFor="shop-area" hint="Ví dụ: Nhận đặt và giao diều toàn quốc">
        <input
          id="shop-area"
          value={form.area}
          onChange={(event) => set('area', event.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <Field
        label="Địa chỉ"
        htmlFor="shop-address"
        hint="Để trống thì footer và trang liên hệ hiện khu vực phục vụ thay thế"
      >
        <input
          id="shop-address"
          value={form.address}
          onChange={(event) => set('address', event.target.value)}
          maxLength={300}
          className={inputClass}
        />
      </Field>

      <Field label="Giờ mở cửa" htmlFor="shop-hours" hint="Hiện ở trang liên hệ. Để trống thì ẩn.">
        <input
          id="shop-hours"
          value={form.openHours}
          onChange={(event) => set('openHours', event.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <hr className="border-stone-200 dark:border-ink-700" />

      <Field label="Đoạn chữ dưới banner" htmlFor="hero-note" hint="Dòng mô tả ngay dưới ảnh đầu trang chủ">
        <textarea
          id="hero-note"
          value={form.heroNote}
          onChange={(event) => set('heroNote', event.target.value)}
          rows={3}
          maxLength={500}
          className={inputClass}
        />
      </Field>

      <Field label="Tiêu đề khối giới thiệu" htmlFor="about-title">
        <input
          id="about-title"
          value={form.aboutTitle}
          onChange={(event) => set('aboutTitle', event.target.value)}
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <Field
        label="Nội dung giới thiệu"
        htmlFor="about-body"
        hint="Cách nhau MỘT DÒNG TRỐNG để tách thành nhiều đoạn văn"
      >
        <textarea
          id="about-body"
          value={form.aboutBody}
          onChange={(event) => set('aboutBody', event.target.value)}
          rows={8}
          maxLength={4000}
          className={inputClass}
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-brand-700 dark:text-brand-400"
        >
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-ink-800 dark:disabled:text-stone-400"
        >
          {saving ? 'Đang lưu…' : 'Lưu cấu hình'}
        </button>

        {saved && (
          <span
            role="status"
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-400"
          >
            <CheckCircle size={18} weight="fill" />
            Đã lưu
          </span>
        )}
      </div>
    </form>
  )
}
