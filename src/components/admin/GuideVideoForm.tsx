'use client'

// Form tạo/sửa bài hướng dẫn có link YouTube (trang /huong-dan).
// Gửi lên /api/admin/huong-dan (validate + kiểm quyền ở đó).
import { WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { GuideVideo } from '@/lib/guide-videos'
import { Field, inputClass } from './FormField'

export function GuideVideoForm({ guide }: { guide?: GuideVideo }) {
  const router = useRouter()
  const editing = guide !== undefined

  const [title, setTitle] = useState(guide?.title ?? '')
  const [description, setDescription] = useState(guide?.description ?? '')
  const [youtubeUrl, setYoutubeUrl] = useState(guide?.youtubeUrl ?? '')
  const [sortOrder, setSortOrder] = useState(String(guide?.sortOrder ?? 100))
  const [active, setActive] = useState(guide?.active ?? true)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const order = Number(sortOrder)
    if (!Number.isInteger(order)) {
      setError('Thứ tự phải là số nguyên')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(
        editing ? `/api/admin/huong-dan/${guide.id}` : '/api/admin/huong-dan',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            youtubeUrl: youtubeUrl.trim(),
            sortOrder: order,
            active,
          }),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không lưu được bài hướng dẫn')
        setSaving(false)
        return
      }

      router.push('/admin/huong-dan')
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Tiêu đề" htmlFor="guide-title">
        <input
          id="guide-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <Field label="Mô tả ngắn" htmlFor="guide-description" hint="Không bắt buộc">
        <textarea
          id="guide-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </Field>

      <Field
        label="Link YouTube"
        htmlFor="guide-url"
        hint="Dán link video. ĐỂ TRỐNG được — mục vẫn hiện nhưng chưa bấm vào được, kèm dòng “Video đang được chuẩn bị”."
      >
        <input
          id="guide-url"
          type="url"
          value={youtubeUrl}
          onChange={(event) => setYoutubeUrl(event.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          maxLength={500}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Thứ tự" htmlFor="guide-order" hint="Số nhỏ hiện trước. Nên cách nhau 10.">
        <input
          id="guide-order"
          type="number"
          inputMode="numeric"
          step={1}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          required
          className={inputClass}
        />
      </Field>

      <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-900 dark:text-stone-100">
        <input
          type="checkbox"
          checked={active}
          onChange={(event) => setActive(event.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        Đang hiện trên web
      </label>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-brand-700 dark:text-brand-400"
        >
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-ink-800 dark:disabled:text-stone-400"
        >
          {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo bài hướng dẫn'}
        </button>
        <Link
          href="/admin/huong-dan"
          className="text-sm font-semibold text-stone-600 hover:underline dark:text-stone-400"
        >
          Huỷ
        </Link>
      </div>
    </form>
  )
}
