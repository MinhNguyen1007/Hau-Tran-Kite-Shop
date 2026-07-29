'use client'

// Xoá HẲN một mẫu diều khỏi DB. Chỉ hiện với mẫu đã gỡ — API cũng từ chối mẫu đang bán, nên
// đây là hai lớp cho cùng một luật, không phải chỉ ẩn nút.
//
// Hỏi lại bằng cách bắt GÕ ĐÚNG TÊN mẫu chứ không phải confirm() một câu: thao tác này không
// lùi lại được, mà confirm() thì bấm Enter là qua.
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string
  productName: string
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    const typed = window.prompt(
      `Xoá HẲN "${productName}"? Thao tác này không lùi lại được: mất luôn ảnh phụ và mọi lượt thả tim của mẫu này.\n\nGõ đúng tên mẫu để xác nhận:`,
    )
    if (typed === null) return
    if (typed.trim() !== productName.trim()) {
      window.alert('Tên không khớp, chưa xoá gì cả.')
      return
    }

    setBusy(true)
    try {
      const response = await fetch(`/api/admin/san-pham/${productId}?xoa-han=1`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        window.alert(payload?.error?.message ?? 'Không xoá được')
        setBusy(false)
        return
      }
      // Danh sách là Server Component nên phải refresh, không thì dòng vừa xoá vẫn nằm đó.
      router.refresh()
      setBusy(false)
    } catch {
      window.alert('Mất kết nối. Thử lại nhé.')
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="text-sm font-semibold text-red-600 transition-colors hover:text-red-700 disabled:cursor-not-allowed disabled:text-stone-400"
    >
      {busy ? '…' : 'Xoá'}
    </button>
  )
}
