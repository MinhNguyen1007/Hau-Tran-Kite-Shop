'use client'

// Cặp nút "gọi / nhắn Zalo" — đây là nút CHỐT ĐƠN của web này, thay chỗ nút thanh toán ngày
// trước. Client component vì phải bắn contact_click lúc bấm.
//
// Dùng <a> thật (tel: và https://zalo.me) chứ không preventDefault rồi tự điều hướng: log là
// fire-and-forget, chặn cú bấm lại để đợi nó là làm hỏng đúng thứ quan trọng nhất trang.
//
// Nhánh Zalo (mở app trên điện thoại / mã QR trên máy tính) nằm trong ZaloAction, dùng chung
// với nút trong danh sách yêu thích và link ở footer.
import { ChatCircleDots, Phone } from '@phosphor-icons/react'
import { logEvent } from '@/lib/analytics'
import { telHref } from '@/lib/shop'
import { ZaloAction } from './ZaloAction'

export function ContactCta({
  hotline,
  zaloPhone,
  productId,
  source,
  properties,
  stacked = false,
  className = '',
}: {
  // Truyền từ Server Component xuống chứ không tự đọc: số điện thoại nằm trong site_settings
  // (admin sửa được), mà file đọc DB kéo theo next/headers nên client không import nổi.
  hotline: string
  zaloPhone: string
  productId?: string
  // Bấm từ đâu: 'product_detail' | 'wishlist' | 'home'... Vào properties để sau này tách được
  // tỉ lệ chuyển đổi theo từng vị trí đặt nút.
  source: string
  // Ngữ cảnh thêm, vd cỡ diều khách đang chọn lúc bấm.
  properties?: Record<string, unknown>
  // true = luôn xếp dọc (cột hẹp ở sidebar). Mặc định nằm ngang từ breakpoint sm.
  stacked?: boolean
  className?: string
}) {
  // Nhánh Zalo tự lo phần log của nó trong ZaloAction; ở đây chỉ còn nút gọi điện.
  function trackPhone() {
    logEvent('contact_click', {
      productId,
      properties: { ...properties, channel: 'phone', source },
    })
  }

  return (
    <div className={`flex flex-col gap-2 ${stacked ? '' : 'sm:flex-row'} ${className}`}>
      <ZaloAction
        zaloPhone={zaloPhone}
        source={source}
        productId={productId}
        properties={properties}
        className="flex-1 items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
      >
        <ChatCircleDots size={18} weight="bold" />
        Nhắn Zalo đặt diều
      </ZaloAction>

      <a
        href={telHref(hotline)}
        onClick={trackPhone}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50"
      >
        <Phone size={18} weight="bold" />
        Gọi {hotline}
      </a>
    </div>
  )
}
