'use client'

// Nút gỡ / khôi phục sản phẩm. Gọi DELETE /api/admin/san-pham/[id] rồi refresh danh sách
// (danh sách là Server Component, không tự biết dữ liệu đã đổi).
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ArchiveButton({
  productId,
  productName,
  archived,
}: {
  productId: string
  productName: string
  archived: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleClick() {
    // Gỡ hàng khỏi trang bán là việc khách nhìn thấy ngay, hỏi lại một câu cho chắc.
    // Khôi phục thì không cần hỏi: nó chỉ đưa mọi thứ về như cũ.
    if (!archived && !window.confirm(`Gỡ "${productName}" khỏi trang bán hàng?`)) return

    setBusy(true)
    const query = archived ? '?khoi-phuc=1' : ''
    try {
      const response = await fetch(`/api/admin/san-pham/${productId}${query}`, { method: 'DELETE' })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        window.alert(payload?.error?.message ?? 'Không thực hiện được')
        setBusy(false)
        return
      }
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
      className="text-sm font-semibold text-stone-600 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:text-stone-400 dark:text-stone-400 dark:hover:text-brand-400"
    >
      {busy ? '…' : archived ? 'Khôi phục' : 'Gỡ'}
    </button>
  )
}
