'use client'

// Nút "Chat Zalo ngay" gắn với MỘT mẫu diều cụ thể (dùng trong danh sách yêu thích).
//
// ⚠ Zalo KHÔNG có tham số điền sẵn nội dung tin nhắn: `zalo.me/<số>` chỉ mở khung chat trống,
// gắn thêm ?text= cũng bị bỏ qua. Nên trước khi mở, chép sẵn câu hỏi kèm tên mẫu vào clipboard
// để khách dán một phát là xong. Chép hỏng (trình duyệt chặn) thì vẫn mở Zalo như thường —
// không chặn đường liên hệ vì một tiện ích phụ.
import { ChatCircleDots } from '@phosphor-icons/react'
import { useState } from 'react'
import { logEvent } from '@/lib/analytics'
import { zaloHref } from '@/lib/shop'

export function ZaloProductButton({
  zaloPhone,
  productId,
  productName,
}: {
  zaloPhone: string
  productId: string
  productName: string
}) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    logEvent('contact_click', {
      productId,
      properties: { channel: 'zalo', source: 'wishlist_item' },
    })

    try {
      await navigator.clipboard.writeText(`Shop ơi, cho mình hỏi mẫu "${productName}" với ạ.`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 4000)
    } catch {
      // Không có quyền clipboard (Safari, http, người dùng chặn) — im lặng bỏ qua.
    }
  }

  return (
    <span className="flex items-center gap-2">
      <a
        href={zaloHref(zaloPhone)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex items-center gap-1.5 rounded-full bg-ink-950 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
      >
        <ChatCircleDots size={14} weight="bold" />
        Chat Zalo ngay
      </a>
      {copied && (
        <span role="status" className="text-xs text-stone-600">
          Đã chép tên mẫu, dán vào Zalo nhé
        </span>
      )}
    </span>
  )
}
