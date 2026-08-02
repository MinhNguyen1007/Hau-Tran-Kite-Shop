'use client'

// Form tạo/sửa danh mục diều. Gửi lên /api/admin/danh-muc (validate + kiểm quyền ở đó).
import { WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Category } from '@/lib/categories'
import { Field, inputClass } from './FormField'
import { ImageUploader } from './ImageUploader'
import { slugify } from './slugify'
import { UnsavedGuard } from '../ui/UnsavedGuard'

export function CategoryForm({ category }: { category?: Category }) {
  const router = useRouter()
  const editing = category !== undefined

  const [name, setName] = useState(category?.name ?? '')
  const [slug, setSlug] = useState(category?.slug ?? '')
  // Slug tự sinh theo tên CHO ĐẾN KHI admin sửa tay. Danh mục đã có slug thì không đụng vào:
  // slug nằm trong URL lọc /san-pham?danh-muc=<slug>, đổi là mất link cũ.
  const [slugTouched, setSlugTouched] = useState(editing)
  const [description, setDescription] = useState(category?.description ?? '')
  const [imagePath, setImagePath] = useState<string[]>(category?.imagePath ? [category.imagePath] : [])
  const [sortOrder, setSortOrder] = useState(String(category?.sortOrder ?? 100))

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Xem ghi chú cùng tên trong ProductForm: lưu xong là hết "chưa lưu".
  const [saved, setSaved] = useState(false)

  const snapshot = JSON.stringify([name, slug, description, imagePath, sortOrder])
  const [initialSnapshot] = useState(snapshot)
  const dirty = !saved && snapshot !== initialSnapshot

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
        editing ? `/api/admin/danh-muc/${category.id}` : '/api/admin/danh-muc',
        {
          method: editing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: slug.trim(),
            name: name.trim(),
            description: description.trim(),
            imagePath: imagePath[0] ?? '',
            sortOrder: order,
          }),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không lưu được danh mục')
        setSaving(false)
        return
      }

      setSaved(true)
      router.push('/admin/danh-muc')
      // Danh sách là Server Component nên phải refresh, không thì thấy dữ liệu cũ trong cache.
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <UnsavedGuard dirty={dirty} />
      <Field label="Tên danh mục" htmlFor="category-name" hint="Ví dụ: Diều cánh cốc, Diều đuôi cá">
        <input
          id="category-name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            if (!slugTouched) setSlug(slugify(event.target.value))
          }}
          required
          maxLength={120}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="category-slug" hint="Phần hiện trên URL lọc: /san-pham?danh-muc=<slug>">
        <input
          id="category-slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true)
            setSlug(event.target.value)
          }}
          required
          maxLength={120}
          className={`${inputClass} font-mono`}
        />
      </Field>

      <Field label="Mô tả" htmlFor="category-description" hint="Không bắt buộc">
        <textarea
          id="category-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          maxLength={1000}
          className={inputClass}
        />
      </Field>

      <ImageUploader
        paths={imagePath}
        onChange={setImagePath}
        label="Ảnh danh mục"
        hint="Hiện làm nền ô danh mục trên trang chủ. Để trống thì dùng nền mặc định. Ảnh chỉ được gắn vào danh mục sau khi bấm nút lưu ở cuối trang."
      />

      <Field label="Thứ tự" htmlFor="category-order" hint="Số nhỏ hiện trước. Nên cách nhau 10 để dễ chèn thêm.">
        <input
          id="category-order"
          type="number"
          inputMode="numeric"
          step={1}
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          required
          className={inputClass}
        />
      </Field>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm font-medium text-red-600"
        >
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
          {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo danh mục'}
        </button>
        <Link
          href="/admin/danh-muc"
          className="text-sm font-semibold text-stone-600 hover:underline"
        >
          Huỷ
        </Link>

        {dirty && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Chưa lưu
          </span>
        )}
      </div>
    </form>
  )
}
