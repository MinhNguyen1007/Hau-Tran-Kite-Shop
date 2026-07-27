'use client'

// Form dùng chung cho tạo mới và sửa sản phẩm. Gửi lên API admin (validate + kiểm quyền ở đó),
// form này chỉ lo trải nghiệm nhập liệu.
import { WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { formatVnd } from '@/lib/format'
import type { Product } from '@/lib/products'
import { Field, inputClass } from './FormField'

// Bỏ dấu tiếng Việt rồi ép kebab-case: "Diều Cánh Cốc Lớn" -> "dieu-canh-coc-lon".
// normalize('NFD') tách dấu thành ký tự tổ hợp riêng (U+0300..U+036F) để regex dưới xoá sạch.
// Riêng đ/Đ không phải chữ d kèm dấu nên NFD không tách được, phải thay tay.
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter()
  const editing = product !== undefined

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  // Slug tự sinh theo tên CHO ĐẾN KHI admin sửa tay. Sản phẩm đã có slug thì không đụng vào:
  // đổi slug là đổi URL, mất link cũ khách đã lưu.
  const [slugTouched, setSlugTouched] = useState(editing)
  const [description, setDescription] = useState(product?.description ?? '')
  const [priceVnd, setPriceVnd] = useState(String(product?.priceVnd ?? ''))
  const [stock, setStock] = useState(String(product?.stock ?? '0'))
  const [imagePath, setImagePath] = useState(product?.imagePath ?? '')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim(),
      // Number('') là 0 nên phải chặn ô trống từ trước; ô number của trình duyệt cho cả 'e'.
      priceVnd: Number(priceVnd),
      stock: Number(stock),
      imagePath: imagePath.trim(),
    }

    if (!Number.isInteger(body.priceVnd) || !Number.isInteger(body.stock)) {
      setError('Giá và tồn kho phải là số nguyên')
      setSaving(false)
      return
    }

    try {
      const response = await fetch(
        editing ? `/api/admin/san-pham/${product.id}` : '/api/admin/san-pham',
        {
          method: editing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không lưu được sản phẩm')
        setSaving(false)
        return
      }

      router.push('/admin/san-pham')
      // Danh sách là Server Component nên phải refresh, không thì thấy dữ liệu cũ trong cache.
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  const priceNumber = Number(priceVnd)

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      <Field label="Tên sản phẩm" htmlFor="product-name">
        <input
          id="product-name"
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          required
          maxLength={200}
          className={inputClass}
        />
      </Field>

      <Field label="Slug" htmlFor="product-slug" hint="Phần hiện trên URL: /san-pham/<slug>">
        <input
          id="product-slug"
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

      <Field label="Mô tả" htmlFor="product-description">
        <textarea
          id="product-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          maxLength={5000}
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Giá (đồng)"
          htmlFor="product-price"
          hint={
            Number.isFinite(priceNumber) && priceNumber > 0 ? formatVnd(priceNumber) : 'Nhập số đồng'
          }
        >
          <input
            id="product-price"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={priceVnd}
            onChange={(event) => setPriceVnd(event.target.value)}
            required
            className={inputClass}
          />
        </Field>

        <Field label="Tồn kho" htmlFor="product-stock" hint="0 là hết hàng">
          <input
            id="product-stock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            required
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        label="Đường dẫn ảnh"
        htmlFor="product-image"
        hint="Path trong bucket 'products', ví dụ kites/canh-coc-01.webp. Để trống thì hiện ảnh mặc định."
      >
        <input
          id="product-image"
          value={imagePath}
          onChange={(event) => setImagePath(event.target.value)}
          maxLength={300}
          className={`${inputClass} font-mono`}
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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600 dark:disabled:bg-ink-800 dark:disabled:text-stone-400"
        >
          {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
        <Link
          href="/admin/san-pham"
          className="text-sm font-semibold text-stone-600 hover:underline dark:text-stone-400"
        >
          Huỷ
        </Link>
      </div>
    </form>
  )
}

