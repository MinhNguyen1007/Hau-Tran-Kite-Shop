'use client'

// Popup mã QR Zalo, CHỈ dành cho khách dùng máy tính.
//
// Lý do tồn tại (đo được 2026-07-31): mở `zalo.me/<số>` trên trình duyệt chưa đăng nhập Zalo
// thì bị đá sang `id.zalo.me/account/login` — khách gặp tường đăng nhập chứ không phải khung
// chat. Quét QR bằng app trên điện thoại đi vòng qua chỗ đó. Trên điện thoại `ContactCta` vẫn
// mở thẳng app như cũ, KHÔNG qua popup này (bắt khách chạm thêm một lần là làm chậm đúng thứ
// quan trọng nhất trang).
//
// Nạp bằng next/dynamic từ ContactCta nên qrcode.react không nằm trong bundle trang chủ.
import { ChatCircleDots, X } from '@phosphor-icons/react'
import { QRCodeSVG } from 'qrcode.react'
import { useCallback, useEffect, useRef } from 'react'
import { zaloHref } from '@/lib/shop'

export function ZaloQrDialog({
  zaloPhone,
  productName,
  onClose,
}: {
  // Số lấy từ site_settings truyền xuống, không đọc DB ở đây (xem chú thích trong shop.ts).
  zaloPhone: string
  // Quét QR bằng điện thoại là rời khỏi trang đang xem, nên nhắc lại tên mẫu ở đây cho khách
  // khỏi phải quay lại tra. Chỗ nào không gắn với mẫu cụ thể (footer, trang liên hệ) thì bỏ trống.
  productName?: string
  onClose: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const link = zaloHref(zaloPhone)

  // MỌI đường đóng đi qua đây. Cố ý KHÔNG dựa vào sự kiện `close` của <dialog> (hay prop
  // onClose của React): sự kiện đó xếp vào "user interaction task source" nên bị hoãn khi tab
  // nằm ở nền, và lúc đó state ở component cha kẹt lại — đóng xong bấm nút thì popup không mở
  // lại nữa. Gọi thẳng thì không phải đoán sự kiện có bắn hay không.
  const handleClose = useCallback(() => {
    ref.current?.close()
    onClose()
  }, [onClose])

  useEffect(() => {
    const el = ref.current
    // showModal() lo sẵn bẫy focus + lớp nền mờ, khỏi tự viết lại mấy thứ dễ sai đó.
    if (el && !el.open) el.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      // Esc: chặn đường đóng mặc định của trình duyệt để tự đóng, cùng một lối với hai nút kia.
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return
        event.preventDefault()
        handleClose()
      }}
      // Bấm ra vùng nền: target chính là thẻ <dialog>, vì nền không có phần tử con nào hứng cú bấm.
      onClick={(event) => {
        if (event.target === ref.current) handleClose()
      }}
      aria-labelledby="zalo-qr-title"
      className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-stone-200 bg-white p-6 text-ink-950 backdrop:bg-ink-950/50"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 id="zalo-qr-title" className="text-lg font-bold tracking-tight">
          Quét mã để nhắn Zalo
        </h2>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Đóng"
          className="-mt-1 -mr-1 rounded-full p-1.5 text-stone-500 transition-colors hover:bg-stone-100 hover:text-ink-950"
        >
          <X size={18} weight="bold" />
        </button>
      </div>

      <p className="mt-1 text-sm text-stone-600">
        Mở Zalo trên điện thoại, bấm biểu tượng quét mã rồi hướng vào ô dưới đây.
      </p>

      {productName && (
        <p className="mt-3 rounded-xl bg-stone-100 px-3 py-2 text-sm text-stone-600">
          Đang hỏi mẫu <span className="font-semibold text-ink-950">{productName}</span>
        </p>
      )}

      <div className="mt-5 flex justify-center rounded-2xl border border-stone-200 bg-white p-4">
        {/* fgColor là stone-900 chứ không phải đen tuyệt đối: vẫn thừa tương phản để máy đọc,
            mà hợp tông trung tính của storefront. marginSize giữ vùng trắng quanh mã cho dễ quét. */}
        <QRCodeSVG value={link} size={180} level="M" marginSize={2} bgColor="#ffffff" fgColor="#1c1917" />
      </div>

      <p className="mt-4 text-center text-sm text-stone-600">
        Hoặc tìm số{' '}
        <span className="font-semibold text-ink-950">{zaloPhone}</span> trên Zalo
      </p>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
      >
        <ChatCircleDots size={18} weight="bold" />
        Mở Zalo trên máy này
      </a>
      <p className="mt-2 text-center text-xs text-stone-400">
        Cách này cần trình duyệt đã đăng nhập Zalo
      </p>
    </dialog>
  )
}
