'use client'

// Form dùng chung cho tạo mới và sửa sản phẩm. Gửi lên API admin (validate + kiểm quyền ở đó),
// form này chỉ lo trải nghiệm nhập liệu.
import { Plus, Trash, WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Category } from '@/lib/categories'
import { formatVnd } from '@/lib/format'
import { formatPriceRange } from '@/lib/product-shared'
import type { Product } from '@/lib/products'
import { Field, inputClass } from './FormField'
import { ImageUploader } from './ImageUploader'
import { slugify } from './slugify'

// Dòng cỡ giữ giá dạng CHUỖI trong lúc nhập: ô number cho phép rỗng và ký tự 'e',
// ép sang số ngay sẽ biến ô trống thành 0 và admin không xoá đi được để gõ lại.
type SizeRow = { label: string; price: string }

export function ProductForm({
  product,
  categories,
}: {
  product?: Product
  categories: Category[]
}) {
  const router = useRouter()
  const editing = product !== undefined

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  // Slug tự sinh theo tên CHO ĐẾN KHI admin sửa tay. Sản phẩm đã có slug thì không đụng vào:
  // đổi slug là đổi URL, mất link cũ khách đã lưu.
  const [slugTouched, setSlugTouched] = useState(editing)
  const [description, setDescription] = useState(product?.description ?? '')
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? '')
  const [priceVnd, setPriceVnd] = useState(String(product?.priceVnd ?? ''))
  const [images, setImages] = useState<string[]>(() => {
    // Ảnh bìa đứng đầu, rồi tới bộ ảnh chi tiết. Gộp thành MỘT danh sách cho admin kéo thả
    // trực quan; lúc gửi lên mới tách lại thành imagePath + images.
    const gallery = (product?.images ?? []).map((image) => image.imagePath)
    const cover = product?.imagePath
    return cover ? [cover, ...gallery.filter((path) => path !== cover)] : gallery
  })
  const [sizes, setSizes] = useState<SizeRow[]>(
    () => product?.sizes.map((size) => ({ label: size.label, price: String(size.priceVnd) })) ?? [],
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleNameChange(value: string) {
    setName(value)
    if (!slugTouched) setSlug(slugify(value))
  }

  function updateSize(index: number, patch: Partial<SizeRow>) {
    setSizes((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    const parsedSizes = sizes
      .filter((row) => row.label.trim() !== '')
      .map((row) => ({ label: row.label.trim(), priceVnd: Number(row.price) }))

    if (parsedSizes.some((size) => !Number.isInteger(size.priceVnd))) {
      setError('Giá của mỗi cỡ phải là số nguyên đồng')
      setSaving(false)
      return
    }

    // Mẫu không khai cỡ nào thì bắt buộc phải có giá chung, không thì trang khách trống trơn.
    const basePrice = Number(priceVnd)
    if (parsedSizes.length === 0 && !Number.isInteger(basePrice)) {
      setError('Nhập giá cho sản phẩm, hoặc thêm ít nhất một cỡ kèm giá')
      setSaving(false)
      return
    }

    const body = {
      slug: slug.trim(),
      name: name.trim(),
      description: description.trim(),
      // Có bảng cỡ thì giá chung không hiện ra đâu cả — gửi 0 cho khỏi bắt admin nhập thừa.
      priceVnd: parsedSizes.length > 0 ? (Number.isInteger(basePrice) ? basePrice : 0) : basePrice,
      categoryId,
      imagePath: images[0] ?? '',
      images: images.slice(1).map((path) => ({ imagePath: path, alt: '' })),
      sizes: parsedSizes,
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

  // Xem trước đúng chuỗi giá khách sẽ thấy trên card.
  const sizePrices = sizes.map((row) => Number(row.price)).filter((price) => Number.isFinite(price) && price > 0)
  const basePriceNumber = Number(priceVnd)
  const pricePreview =
    sizePrices.length > 0
      ? formatPriceRange(Math.min(...sizePrices), Math.max(...sizePrices))
      : Number.isFinite(basePriceNumber) && basePriceNumber > 0
        ? formatVnd(basePriceNumber)
        : null

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

      <Field
        label="Danh mục"
        htmlFor="product-category"
        hint="Quản lý danh sách ở mục Danh mục diều"
      >
        <select
          id="product-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className={inputClass}
        >
          <option value="">— Chưa xếp danh mục —</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
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

      <ImageUploader
        paths={images}
        onChange={setImages}
        multiple
        label="Ảnh sản phẩm"
        hint="Ảnh đầu tiên là ảnh bìa hiện ngoài lưới. Các ảnh sau hiện ở trang chi tiết. Tối đa 5MB mỗi ảnh."
      />

      <hr className="border-stone-200 dark:border-ink-700" />

      <div className="flex flex-col gap-3">
        <span className="text-sm font-semibold text-ink-900 dark:text-stone-100">
          Giá theo kích thước
        </span>
        <p className="-mt-1 text-xs text-stone-600 dark:text-stone-400">
          Mỗi sải cánh một giá, ví dụ &quot;3 mét&quot; · 1.000.000. Khách thấy khoảng giá ngoài
          lưới và danh sách đầy đủ ở trang chi tiết. Để trống nếu mẫu này bán một mức duy nhất.
        </p>

        {sizes.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            <input
              value={row.label}
              onChange={(event) => updateSize(index, { label: event.target.value })}
              placeholder="3 mét"
              maxLength={60}
              aria-label={`Tên cỡ thứ ${index + 1}`}
              className={`${inputClass} flex-1`}
            />
            <input
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={row.price}
              onChange={(event) => updateSize(index, { price: event.target.value })}
              placeholder="1000000"
              aria-label={`Giá cỡ thứ ${index + 1}`}
              className={`${inputClass} w-40`}
            />
            <button
              type="button"
              onClick={() => setSizes((rows) => rows.filter((_, i) => i !== index))}
              aria-label={`Xoá cỡ thứ ${index + 1}`}
              className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-brand-700 dark:text-stone-400 dark:hover:bg-ink-800"
            >
              <Trash size={18} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setSizes((rows) => [...rows, { label: '', price: '' }])}
          className="flex w-fit items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-100 dark:border-ink-700 dark:text-stone-200 dark:hover:bg-ink-800"
        >
          <Plus size={16} weight="bold" />
          Thêm cỡ
        </button>
      </div>

      <Field
        label="Giá chung (đồng)"
        htmlFor="product-price"
        hint={
          sizes.length > 0
            ? 'Không dùng đến vì mẫu này đã có bảng cỡ ở trên'
            : 'Dùng cho mẫu bán một mức duy nhất (vải, dây, phụ kiện)'
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
          disabled={sizes.length > 0}
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
        />
      </Field>

      {pricePreview && (
        <p className="-mt-2 text-sm text-stone-600 dark:text-stone-400">
          Khách sẽ thấy:{' '}
          <strong className="font-bold text-brand-700 dark:text-brand-400">{pricePreview}</strong>
        </p>
      )}

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
