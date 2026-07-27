'use client'

// Nút xoá một khối nội dung. Xoá HẲN nên phải hỏi lại — khác nút gỡ sản phẩm (xoá mềm,
// khôi phục được). Muốn giấu tạm thì admin dùng ô "Đang hiện trên web" trong form.
import { Trash } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteBlockButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    if (!window.confirm(`Xoá hẳn khối "${title}"? Không khôi phục lại được.`)) return

    setBusy(true)
    try {
      const response = await fetch(`/api/admin/noi-dung/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        window.alert(payload?.error?.message ?? 'Không xoá được khối nội dung')
        setBusy(false)
        return
      }
      // Danh sách là Server Component nên phải refresh, không thì dòng vừa xoá vẫn còn trên màn hình.
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
      aria-label={`Xoá khối ${title}`}
      className="grid h-8 w-8 place-items-center rounded-lg text-stone-500 transition-colors hover:bg-stone-100 hover:text-brand-700 disabled:opacity-50 dark:text-stone-400 dark:hover:bg-ink-800 dark:hover:text-brand-400"
    >
      <Trash size={18} />
    </button>
  )
}
