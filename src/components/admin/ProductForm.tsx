'use client'

// Form dùng chung cho tạo mới và sửa sản phẩm. Gửi lên API admin (validate + kiểm quyền ở đó),
// form này chỉ lo trải nghiệm nhập liệu.
import { WarningCircle } from '@phosphor-icons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Category } from '@/lib/categories'
import type { Product } from '@/lib/products'
import { Field, inputClass } from './FormField'
import { ImageUploader } from './ImageUploader'
import { slugify } from './slugify'
import { UnsavedGuard } from './UnsavedGuard'

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
  const [priceText, setPriceText] = useState(product?.priceText ?? '')
  const [showPrice, setShowPrice] = useState(product?.showPrice ?? true)
  const [sizeNote, setSizeNote] = useState(product?.sizeNote ?? '')
  const [images, setImages] = useState<string[]>(() => {
    // Ảnh bìa đứng đầu, rồi tới bộ ảnh chi tiết. Gộp thành MỘT danh sách cho admin kéo thả
    // trực quan; lúc gửi lên mới tách lại thành imagePath + images.
    const gallery = (product?.images ?? []).map((image) => image.imagePath)
    const cover = product?.imagePath
    return cover ? [cover, ...gallery.filter((path) => path !== cover)] : gallery
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Lưu xong là hết "chưa lưu", kể cả khi router.push chưa kịp rời trang — không thì cảnh báo
  // nổ lên ngay sau một lần lưu thành công.
  const [saved, setSaved] = useState(false)

  // So sánh bằng chuỗi hoá: form này chỉ có chữ, boolean và danh sách path ảnh, không có
  // object lồng nhau nên so chuỗi là đủ và không sợ lệch thứ tự khoá.
  const snapshot = JSON.stringify([
    name,
    slug,
    description,
    categoryId,
    priceText,
    showPrice,
    sizeNote,
    images,
  ])
  // Initializer của useState chỉ chạy lần đầu → chốt đúng trạng thái lúc mở form.
  const [initialSnapshot] = useState(snapshot)
  const dirty = !saved && snapshot !== initialSnapshot

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
      priceText: priceText.trim(),
      showPrice,
      sizeNote: sizeNote.trim(),
      categoryId,
      imagePath: images[0] ?? '',
      images: images.slice(1).map((path) => ({ imagePath: path, alt: '' })),
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

      setSaved(true)
      router.push('/admin/san-pham')
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
        hint="Ảnh đầu tiên là ảnh bìa hiện ngoài lưới. Các ảnh sau hiện ở trang chi tiết. Tối đa 5MB mỗi ảnh. Ảnh chỉ được gắn vào sản phẩm sau khi bấm nút lưu ở cuối trang."
      />

      <hr className="border-stone-200" />

      <Field
        label="Kích thước làm được"
        htmlFor="product-size-note"
        hint='Viết tự do, ví dụ: "Nhận làm từ 3m đến 5m, cỡ lớn hơn liên hệ shop". Để trống thì không hiện.'
      >
        <input
          id="product-size-note"
          value={sizeNote}
          onChange={(event) => setSizeNote(event.target.value)}
          placeholder="Nhận làm từ 3m đến 5m tuỳ yêu cầu"
          maxLength={300}
          className={inputClass}
        />
      </Field>

      <Field
        label="Giá"
        htmlFor="product-price"
        hint='Viết tự do, ví dụ: "3 triệu – 5 triệu" hoặc "350.000 ₫". Không có bảng giá cố định thì cứ ghi khoảng.'
      >
        <input
          id="product-price"
          value={priceText}
          onChange={(event) => setPriceText(event.target.value)}
          placeholder="3 triệu – 5 triệu"
          maxLength={120}
          disabled={!showPrice}
          className={`${inputClass} disabled:cursor-not-allowed disabled:opacity-50`}
        />
      </Field>

      {/* Tách khỏi ô giá để admin GIỮ giá đã ghi mà vẫn tạm ẩn được, khỏi xoá rồi gõ lại. */}
      <label className="-mt-2 flex items-center gap-2.5 text-sm font-semibold text-ink-950">
        <input
          type="checkbox"
          checked={showPrice}
          onChange={(event) => setShowPrice(event.target.checked)}
          className="h-4 w-4 accent-ink-950"
        />
        Hiện giá trên trang khách
      </label>

      <p className="-mt-2 text-sm text-stone-600">
        Khách sẽ thấy:{' '}
        <strong className="font-bold text-ink-950">
          {showPrice && priceText.trim() !== '' ? priceText.trim() : 'không hiện giá'}
        </strong>
      </p>

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
          {saving ? 'Đang lưu…' : editing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
        </button>
        <Link
          href="/admin/san-pham"
          className="text-sm font-semibold text-stone-600 hover:underline"
        >
          Huỷ
        </Link>

        {/* Chấm này mang trạng thái THẬT (form đang lệch với bản đã lưu), không phải chấm
            trang trí. Cần nó vì ảnh upload xong trông y như đã lưu. */}
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
