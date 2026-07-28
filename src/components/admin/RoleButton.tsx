'use client'

// Nút nâng một tài khoản lên admin phụ / hạ về khách. Chỉ hiện ở trang quản lý tài khoản,
// và trang đó chỉ chủ shop vào được.
//
// Tách khỏi RowActionButton vì đây là PATCH kèm body chứ không phải DELETE, và vì thao tác
// này cần nhãn chữ chứ không phải icon suông: nâng quyền là việc đáng đọc kỹ trước khi bấm.
import { ArrowDown, ArrowUp } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RoleButton({
  profileId,
  nextRole,
  confirmText,
}: {
  profileId: string
  nextRole: 'admin' | 'user'
  confirmText: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const promoting = nextRole === 'admin'

  async function handleClick() {
    if (!window.confirm(confirmText)) return

    setBusy(true)
    try {
      const response = await fetch(`/api/admin/tai-khoan/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        window.alert(payload?.error?.message ?? 'Không đổi được vai trò')
        setBusy(false)
        return
      }
      // Danh sách là Server Component nên phải refresh, không thì vai trò trên màn hình vẫn cũ.
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
      className={
        promoting
          ? 'flex shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600'
          : 'flex shrink-0 items-center gap-1.5 rounded-full border border-stone-300 px-4 py-2 text-xs font-bold text-stone-700 transition-colors hover:bg-stone-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
      }
    >
      {promoting ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
      {busy ? 'Đang lưu…' : promoting ? 'Nâng lên admin' : 'Hạ về khách'}
    </button>
  )
}
