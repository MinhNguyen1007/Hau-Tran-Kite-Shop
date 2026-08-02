'use client'

// Chọn ảnh đại diện → upload thẳng lên bucket 'avatars' → trả về PATH.
//
// Không dùng chung ImageUploader của khu admin: cái kia bắn vào bucket 'products' (chỉ admin
// ghi được) và làm việc với DANH SÁCH ảnh. Ở đây đúng một ảnh, và đường ghi bắt buộc nằm
// trong thư mục '<uid>/' — RLS chặn ghi ra ngoài thư mục của chính mình.
import { Trash, UploadSimple, UserCircle } from '@phosphor-icons/react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { removeAvatarFile } from '@/lib/avatar-storage'
import { getAvatarUrl } from '@/lib/storage'
import { createBrowserSupabase } from '@/lib/supabase-browser'

const BUCKET = 'avatars'
const MAX_BYTES = 2 * 1024 * 1024

// Tên file gốc hay có dấu tiếng Việt và khoảng trắng — Storage nhận nhưng URL sinh ra xấu và
// dễ lỗi khi encode. Sinh tên mới, giữ đúng phần đuôi.
function safeName(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
}

export function AvatarUploader({
  userId,
  path,
  savedPath,
  onChange,
}: {
  userId: string
  path: string | null
  // Path đang NẰM TRONG hồ sơ (đã lưu). File này tuyệt đối không xoá ở đây: khách đổi ảnh rồi
  // bỏ dở và rời trang là chuyện thường, lúc đó hồ sơ vẫn phải trỏ vào một file còn sống.
  // Nó chỉ được dọn SAU khi lưu thành công, và do server dọn (updateMyProfile).
  savedPath: string | null
  onChange: (path: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dọn file vừa bị thay chỗ TRONG lần sửa này — chọn ảnh 3 lần rồi lưu thì chỉ nên còn 1 file.
  function discardIfTemporary(previous: string | null) {
    if (previous && previous !== savedPath) void removeAvatarFile(previous)
  }

  async function handleFile(files: FileList | null) {
    const file = files?.[0]
    if (!file) return

    setError(null)

    if (!file.type.startsWith('image/')) {
      setError('Chọn tệp ảnh nhé')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('Ảnh nặng quá 2MB, chọn ảnh nhỏ hơn nhé')
      return
    }

    setBusy(true)
    const supabase = createBrowserSupabase()
    // Thư mục PHẢI là uid: policy avatars_objects_insert_self so đúng đoạn đầu của path.
    const objectPath = `${userId}/${safeName(file)}`
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
    })

    if (uploadError) {
      setError('Không tải được ảnh lên. Thử lại nhé.')
      setBusy(false)
      return
    }

    // Dọn SAU khi file mới đã lên tới nơi: xoá trước mà upload hỏng là mất cả ảnh đang có.
    discardIfTemporary(path)
    onChange(objectPath)
    setBusy(false)
    // Cho phép chọn lại đúng file vừa chọn (input giữ nguyên value thì onChange không bắn).
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink-950">Ảnh đại diện</span>

      <div className="flex items-center gap-4">
        <span className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-stone-100 text-stone-400">
          {path ? (
            <Image src={getAvatarUrl(path)} alt="" fill sizes="80px" className="object-cover" />
          ) : (
            <UserCircle size={40} weight="fill" />
          )}
        </span>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-ink-950 transition-colors hover:bg-stone-100 disabled:opacity-60"
          >
            <UploadSimple size={16} weight="bold" />
            {busy ? 'Đang tải…' : path ? 'Đổi ảnh' : 'Chọn ảnh'}
          </button>

          {path && (
            <button
              type="button"
              onClick={() => {
                discardIfTemporary(path)
                onChange(null)
              }}
              disabled={busy}
              className="flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-60"
            >
              <Trash size={16} weight="bold" />
              Gỡ ảnh
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleFile(event.target.files)}
      />

      {error && (
        <span role="alert" className="text-xs font-medium text-red-600">
          {error}
        </span>
      )}
      {/* Nói thẳng ra chuyện ảnh chưa được gắn: file lên Storage ngay lúc chọn nên ảnh hiện ra
          liền, còn `profiles.avatar_path` thì đợi nút Lưu. Không nói thì người dùng đóng tab. */}
      <span className="text-xs text-stone-600">
        Ảnh vuông đẹp nhất. Tối đa 2MB. Ảnh chỉ được gắn vào hồ sơ sau khi bấm nút lưu ở cuối
        trang.
      </span>
    </div>
  )
}
