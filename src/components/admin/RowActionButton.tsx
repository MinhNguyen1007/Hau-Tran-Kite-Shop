'use client'

// Nút thao tác trên một dòng danh sách admin (xoá hẳn / gỡ / khôi phục).
// Gom một chỗ vì ba màn quản trị đều cần đúng luồng này: hỏi lại → gọi API → refresh.
import { ArrowCounterClockwise, EyeSlash, Trash } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ICONS = {
  delete: Trash,
  archive: EyeSlash,
  restore: ArrowCounterClockwise,
}

export function RowActionButton({
  endpoint,
  label,
  confirmText,
  action,
}: {
  // Đường dẫn API đầy đủ, kèm cả query string nếu cần (vd '?khoi-phuc=1').
  endpoint: string
  label: string
  // Bỏ trống = làm luôn, không hỏi. Thao tác khôi phục thì không cần hỏi.
  confirmText?: string
  action: keyof typeof ICONS
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const Glyph = ICONS[action]

  async function handleClick() {
    if (confirmText && !window.confirm(confirmText)) return

    setBusy(true)
    try {
      const response = await fetch(endpoint, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        window.alert(payload?.error?.message ?? 'Thao tác không thành công')
        setBusy(false)
        return
      }
      // Danh sách là Server Component nên phải refresh, không thì màn hình vẫn là dữ liệu cũ.
      router.refresh()
    } catch {
      window.alert('Mất kết nối. Thử lại nhé.')
    }
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-brand-700 disabled:opacity-50"
    >
      <Glyph size={18} />
    </button>
  )
}
