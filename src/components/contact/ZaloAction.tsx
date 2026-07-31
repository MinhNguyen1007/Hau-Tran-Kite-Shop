'use client'

// Một hành động "nhắn Zalo", dùng chung cho nút lớn ở ContactCta, nút nhỏ trong danh sách yêu
// thích và link chữ ở footer.
//
// Gom một chỗ vì cả ba nơi phải xử lý cùng một chuyện: mở `zalo.me/<số>` trên trình duyệt chưa
// đăng nhập Zalo thì bị đá sang `id.zalo.me/account/login` (đo 2026-07-31), khách gặp tường
// đăng nhập chứ không phải khung chat. Nên dưới `sm` mở thẳng app, từ `sm` hiện mã QR.
//
// Chia bằng breakpoint CSS chứ KHÔNG đoán thiết bị qua user agent: đoán sai một lần là khách
// mất luôn đường chốt đơn, mà bề rộng màn hình đã đủ tốt cho việc này.
import dynamic from 'next/dynamic'
import { useCallback, useState } from 'react'
import { logEvent } from '@/lib/analytics'
import { zaloHref } from '@/lib/shop'

// Nạp muộn: qrcode.react chỉ tải khi khách thật sự bấm, không nằm trong bundle trang chủ.
const ZaloQrDialog = dynamic(() => import('./ZaloQrDialog').then((m) => m.ZaloQrDialog), {
  ssr: false,
})

// Viết thẳng chuỗi class, không ghép động: Tailwind quét mã nguồn theo văn bản nên
// `sm:${bien}` sẽ không sinh ra luật CSS nào.
const DISPLAY = {
  flex: { link: 'flex sm:hidden', button: 'hidden sm:flex' },
  inline: { link: 'inline sm:hidden', button: 'hidden sm:inline' },
} as const

export function ZaloAction({
  zaloPhone,
  source,
  productId,
  productName,
  properties,
  display = 'flex',
  className = '',
  onActivate,
  children,
}: {
  // Số lấy từ site_settings truyền xuống, không đọc DB ở đây (xem chú thích trong shop.ts).
  zaloPhone: string
  // Bấm từ đâu: 'product_detail' | 'wishlist_item' | 'footer'... để tách tỉ lệ chuyển đổi.
  source: string
  productId?: string
  // Hiện trong popup QR để khách nhớ đang hỏi mẫu nào (quét bằng điện thoại thì mất ngữ cảnh trang).
  productName?: string
  properties?: Record<string, unknown>
  display?: keyof typeof DISPLAY
  // Class dùng CHUNG cho cả hai bản; chỉ khác nhau ở chỗ hiện/ẩn theo breakpoint.
  className?: string
  // Chạy thêm lúc bấm, ở CẢ HAI nhánh (vd chép tên mẫu vào clipboard).
  onActivate?: () => void
  children: React.ReactNode
}) {
  const [qrOpen, setQrOpen] = useState(false)
  // Giữ tham chiếu ổn định cho ZaloQrDialog.
  const closeQr = useCallback(() => setQrOpen(false), [])

  // Loại event vẫn là contact_click như cũ. `via` chỉ là khoá THÊM trong properties — đổi tên
  // loại thì dữ liệu lịch sử lệch không sửa được, thêm khoá thì không sao.
  function track(via: 'app' | 'qr') {
    logEvent('contact_click', {
      productId,
      properties: { ...properties, channel: 'zalo', source, via },
    })
  }

  return (
    <>
      {/* Điện thoại: thẻ <a> thật, một chạm là vào khung chat. Không preventDefault rồi tự điều
          hướng — log là fire-and-forget, chặn cú bấm để đợi nó là hỏng đúng thứ quan trọng nhất. */}
      <a
        href={zaloHref(zaloPhone)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          track('app')
          onActivate?.()
        }}
        className={`${DISPLAY[display].link} ${className}`}
      >
        {children}
      </a>

      {/* Máy tính: mở popup mã QR. */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          track('qr')
          onActivate?.()
          setQrOpen(true)
        }}
        className={`${DISPLAY[display].button} cursor-pointer ${className}`}
      >
        {children}
      </button>

      {qrOpen && (
        <ZaloQrDialog zaloPhone={zaloPhone} productName={productName} onClose={closeQr} />
      )}
    </>
  )
}
