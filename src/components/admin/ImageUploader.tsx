'use client'

// Chọn ảnh từ máy → upload thẳng lên Supabase Storage bucket 'products' → trả về PATH.
//
// Upload TỪ TRÌNH DUYỆT chứ không qua API route: file ảnh đi thẳng tới Storage, không phải
// nhét vào body request rồi chuyển tiếp qua server Next. Quyền do RLS của storage.objects lo
// (chỉ is_admin() được insert — xem migration 20260726160000).
//
// DB chỉ lưu path (vd 'kites/1738.webp'), không lưu full URL — xem skill product-card.
import { Trash, UploadSimple } from '@phosphor-icons/react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { getProductImageUrl } from '@/lib/storage'
import { createBrowserSupabase } from '@/lib/supabase-browser'

const BUCKET = 'products'
const MAX_BYTES = 5 * 1024 * 1024

// Tên file gốc hay có dấu tiếng Việt và khoảng trắng — Storage nhận nhưng URL sinh ra xấu và
// dễ lỗi khi encode. Sinh tên mới, giữ đúng phần đuôi.
function safeName(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export function ImageUploader({
  paths,
  onChange,
  multiple = false,
  label = 'Ảnh',
  hint,
}: {
  paths: string[]
  onChange: (paths: string[]) => void
  multiple?: boolean
  label?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setBusy(true)
    setError(null)

    const supabase = createBrowserSupabase()
    const uploaded: string[] = []

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setError(`"${file.name}" nặng quá 5MB, nén lại giúp shop nhé.`)
        continue
      }

      const path = `kites/${safeName(file)}`
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '31536000',
        upsert: false,
      })

      if (uploadError) {
        // Hay gặp nhất: tài khoản đang đăng nhập không phải admin nên RLS chặn insert.
        setError('Không tải được ảnh lên. Kiểm tra bạn đang đăng nhập bằng tài khoản admin.')
        continue
      }
      uploaded.push(path)
    }

    if (uploaded.length > 0) {
      onChange(multiple ? [...paths, ...uploaded] : uploaded.slice(-1))
    }

    setBusy(false)
    // Dọn input để chọn lại đúng file vừa xoá vẫn kích hoạt onChange.
    if (inputRef.current) inputRef.current.value = ''
  }

  // CỐ Ý không xoá file khỏi Storage khi admin gỡ ảnh: sản phẩm khác có thể đang dùng lại
  // đúng path đó. File thừa trong bucket rẻ hơn nhiều so với ảnh vỡ trên trang khách.
  function removeAt(index: number) {
    onChange(paths.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink-900 dark:text-stone-100">{label}</span>

      {paths.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {paths.map((path, index) => (
            <li key={path} className="relative">
              <span className="relative block h-24 w-24 overflow-hidden rounded-xl border border-stone-200 dark:border-ink-700">
                <Image
                  src={getProductImageUrl(path)}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized
                />
              </span>
              {index === 0 && multiple && (
                <span className="absolute left-1 top-1 rounded bg-ink-950/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  Ảnh bìa
                </span>
              )}
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`Gỡ ảnh ${index + 1}`}
                className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-stone-600 shadow ring-1 ring-stone-200 transition-colors hover:text-brand-700 dark:bg-ink-800 dark:text-stone-300 dark:ring-ink-700"
              >
                <Trash size={13} weight="bold" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => handleFiles(event.target.files)}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-fit items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-100 disabled:opacity-60 dark:border-ink-700 dark:text-stone-200 dark:hover:bg-ink-800"
      >
        <UploadSimple size={16} weight="bold" />
        {busy ? 'Đang tải lên…' : paths.length > 0 && !multiple ? 'Đổi ảnh' : 'Chọn ảnh từ máy'}
      </button>

      {hint && <span className="text-xs text-stone-600 dark:text-stone-400">{hint}</span>}
      {error && (
        <span role="alert" className="text-xs font-medium text-brand-700 dark:text-brand-400">
          {error}
        </span>
      )}
    </div>
  )
}
