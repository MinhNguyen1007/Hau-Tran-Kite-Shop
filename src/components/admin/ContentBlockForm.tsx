'use client'

// Form dùng chung cho tạo mới và sửa khối nội dung trang chủ. Gửi lên /api/admin/noi-dung
// (validate + kiểm quyền ở đó), form này chỉ lo trải nghiệm nhập liệu.
//
// Bốn loại khối (danh mục / khuyến mãi / kinh nghiệm / cam kết) dùng CHUNG một schema, nên
// không phải ô nào cũng có tác dụng với mọi loại — SECTION_HINT nói rõ ô nào ăn cho loại nào,
// và các ô không dùng đến bị ẩn hẳn thay vì để admin điền vào chỗ vô nghĩa.
import { WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  SECTIONS,
  SECTION_HINT,
  SECTION_LABEL,
  type ContentBlock,
  type Section,
} from '@/lib/content-blocks-shared'
import { CONTENT_ICON_NAMES } from '@/lib/content-icons'
import { Field, inputClass } from './FormField'

// Ô nào có tác dụng với loại khối nào — khớp với các component trong src/components/home.
const USES_SUBTITLE: Record<Section, boolean> = { category: false, promo: true, guide: false, trust: false }
const USES_BODY: Record<Section, boolean> = { category: false, promo: true, guide: true, trust: true }
const USES_ICON: Record<Section, boolean> = { category: true, promo: false, guide: true, trust: true }

export function ContentBlockForm({ block }: { block?: ContentBlock }) {
  const router = useRouter()
  const editing = block !== undefined

  const [section, setSection] = useState<Section>(block?.section ?? 'category')
  const [title, setTitle] = useState(block?.title ?? '')
  const [subtitle, setSubtitle] = useState(block?.subtitle ?? '')
  const [body, setBody] = useState(block?.body ?? '')
  const [href, setHref] = useState(block?.href ?? '')
  const [icon, setIcon] = useState(block?.icon ?? '')
  // Cách 10 để chèn khối vào giữa mà không phải đánh số lại cả danh sách.
  const [sortOrder, setSortOrder] = useState(String(block?.sortOrder ?? 100))
  const [active, setActive] = useState(block?.active ?? true)

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

    // Gửi chuỗi rỗng cho ô mà loại khối này không dùng: đổi loại khối xong lưu lại thì dữ liệu
    // thừa của loại cũ phải biến mất, không được nằm im trong DB rồi bật lại lúc đổi loại lần nữa.
    const payload = {
      section,
      sortOrder: order,
      title: title.trim(),
      subtitle: USES_SUBTITLE[section] ? subtitle.trim() : '',
      body: USES_BODY[section] ? body.trim() : '',
      href: href.trim(),
      icon: USES_ICON[section] ? icon.trim() : '',
      active,
    }

    try {
      const response = await fetch(
        editing ? `/api/admin/noi-dung/${block.id}` : '/api/admin/noi-dung',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )

      if (!response.ok) {
        const result = await response.json().catch(() => null)
        setError(result?.error?.message ?? 'Không lưu được khối nội dung')
        setSaving(false)
        return
      }

      router.push('/admin/noi-dung')
      // Danh sách là Server Component nên phải refresh, không thì thấy dữ liệu cũ trong cache.
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Khối nào trên trang" htmlFor="block-section" hint={SECTION_HINT[section]}>
        <select
          id="block-section"
          value={section}
          onChange={(event) => setSection(event.target.value as Section)}
          className={inputClass}
        >
          {SECTIONS.map((value) => (
            <option key={value} value={value}>
              {SECTION_LABEL[value]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tiêu đề" htmlFor="block-title">
        <input
          id="block-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      {USES_SUBTITLE[section] && (
        <Field
          label="Dòng chữ vàng"
          htmlFor="block-subtitle"
          hint='Chữ to phía trên tiêu đề, ví dụ "Giảm 20%"'
        >
          <input
            id="block-subtitle"
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            maxLength={120}
            className={inputClass}
          />
        </Field>
      )}

      {USES_BODY[section] && (
        <Field label="Mô tả" htmlFor="block-body">
          <textarea
            id="block-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            maxLength={1000}
            className={inputClass}
          />
        </Field>
      )}

      {USES_ICON[section] && (
        <Field label="Icon" htmlFor="block-icon" hint="Hình nhỏ trên thẻ">
          <select
            id="block-icon"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            className={inputClass}
          >
            <option value="">— Mặc định —</option>
            {CONTENT_ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field
        label="Đường dẫn khi bấm"
        htmlFor="block-href"
        hint="Đường dẫn nội bộ, bắt đầu bằng /. Ví dụ: /san-pham?q=sáo. Để trống thì thẻ không bấm được."
      >
        <input
          id="block-href"
          value={href}
          onChange={(event) => setHref(event.target.value)}
          maxLength={300}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Thứ tự" htmlFor="block-order" hint="Số nhỏ hiện trước. Nên cách nhau 10 để dễ chèn thêm.">
        <input
          id="block-order"
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
          {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo khối'}
        </button>
        <Link
          href="/admin/noi-dung"
          className="text-sm font-semibold text-stone-600 hover:underline dark:text-stone-400"
        >
          Huỷ
        </Link>
      </div>
    </form>
  )
}
