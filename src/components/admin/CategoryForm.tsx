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
        hint="Hiện làm nền ô danh mục trên trang chủ. Để trống thì dùng nền cam mặc định."
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
      </div>
    </form>
  )
}
