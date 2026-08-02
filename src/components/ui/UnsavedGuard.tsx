'use client'

// Chặn rời trang khi form còn thay đổi chưa lưu. Dùng ở CẢ khu admin lẫn trang khách
// (/tai-khoan) nên nằm ở ui/, đừng chuyển về admin/.
//
// Vì sao có file này: `ImageUploader` đẩy ảnh lên Storage NGAY lúc chọn file, nên ảnh hiện ra
// liền và trông như đã lưu. Nhưng dòng trong `product_images` / `categories` chỉ được ghi khi
// bấm "Lưu". Ngày 2026-07-28 đã mất một bộ 6 ảnh đúng theo đường đó: file còn nguyên trong
// bucket, DB không có dòng nào trỏ tới, và không có gì trên màn hình cho biết điều đó.
//
// `AvatarUploader` ở /tai-khoan đi đúng đường ấy (`profiles.avatar_path` cũng chỉ ghi lúc bấm
// Lưu) và đã dính thật: đo trên production 2026-08-02, thư mục avatar của một khách có 3 file
// mà chỉ 1 được trỏ tới — hai lần đổi ảnh kia rời trang trước khi lưu.
//
// Hai lớp, vì một lớp không phủ hết:
//  1. `beforeunload` — đóng tab, tải lại trang, gõ URL khác. Hộp thoại do TRÌNH DUYỆT vẽ nên
//     không đổi được chữ; đó là giới hạn của web, không phải lựa chọn thiết kế.
//  2. Bắt click trên thẻ <a> ở pha capture — điều hướng trong app (mục sidebar, nút "Huỷ")
//     KHÔNG kích `beforeunload` vì trang không tải lại. Nhánh này tự vẽ hộp thoại nên nói
//     được bằng tiếng Việt là mất cái gì.
//
// CỐ Ý không chặn nút Back của trình duyệt: muốn chặn thì phải nhồi history entry giả rồi tự
// gỡ, làm loạn lịch sử điều hướng nhiều hơn là cứu được một lần bấm nhầm.
import { WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { shouldWarnBeforeLeaving } from '@/lib/unsaved-nav'

// Câu mô tả mặc định nói về ảnh, vì đó là thứ mất đau nhất (file đã lên Storage mà không có
// dòng DB nào trỏ tới). Form không có ảnh truyền `message` riêng — cảnh báo mất ảnh ở một form
// chỉ có chữ thì người đọc dừng lại tìm cái ảnh không tồn tại.
const DEFAULT_MESSAGE =
  'Ảnh vừa chọn đã tải lên nhưng chưa gắn vào mục này. Rời trang lúc này là mất hết thay đổi, phải nhập và chọn ảnh lại từ đầu.'

export function UnsavedGuard({
  dirty,
  message = DEFAULT_MESSAGE,
}: {
  dirty: boolean
  message?: string
}) {
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  // Đọc `dirty` qua ref chứ không bắt vào dependency: listener gắn MỘT lần ở pha capture,
  // phụ thuộc `dirty` thì mỗi lần gõ một chữ lại tháo ra gắn lại.
  //
  // Đồng bộ trong effect, KHÔNG gán thẳng khi render (lint `react-hooks/refs` chặn, và đúng).
  // Effect chạy sau khi vẽ xong, còn click là hành động của người dùng nên luôn đến sau đó.
  const dirtyRef = useRef(dirty)
  useEffect(() => {
    dirtyRef.current = dirty
  }, [dirty])

  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  useEffect(() => {
    function intercept(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented) return

      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest('a')
      if (!(anchor instanceof HTMLAnchorElement)) return

      // Luật "click này có phải rời trang" nằm trong lib/unsaved-nav.ts và có test riêng.
      const leaving = shouldWarnBeforeLeaving({
        button: event.button,
        modifierPressed: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
        href: anchor.href,
        anchorTarget: anchor.target,
        isDownload: anchor.hasAttribute('download'),
        currentUrl: window.location.href,
      })
      if (!leaving) return

      event.preventDefault()
      event.stopPropagation()
      const url = new URL(anchor.href)
      setPendingHref(`${url.pathname}${url.search}${url.hash}`)
    }

    // capture = true: phải chạy TRƯỚC handler của next/link, không thì Link đã điều hướng xong.
    document.addEventListener('click', intercept, true)
    return () => document.removeEventListener('click', intercept, true)
  }, [])

  // Escape = ở lại. Khoá cuộn nền trong lúc hộp thoại mở, và luôn trả lại giá trị cũ.
  useEffect(() => {
    if (pendingHref === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPendingHref(null)
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [pendingHref])

  if (pendingHref === null) return null

  return (
    // z-[60]: trên header dính (z-50) và trên ngăn kéo sidebar admin. Thang z của dự án chỉ có
    // ba bậc — nội dung, header/drawer (50), hộp thoại (60). Đừng thêm bậc thứ tư.
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <div aria-hidden className="absolute inset-0 bg-ink-950/60" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-title"
        className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
      >
        <h2
          id="unsaved-title"
          className="flex items-center gap-2 text-base font-bold tracking-tight text-ink-950"
        >
          <WarningCircle size={20} weight="fill" className="shrink-0 text-red-600" />
          Thay đổi chưa được lưu
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">{message}</p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            autoFocus
            onClick={() => setPendingHref(null)}
            className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
          >
            Ở lại để lưu
          </button>
          <button
            type="button"
            onClick={() => {
              const href = pendingHref
              setPendingHref(null)
              // Tắt cảnh báo TRƯỚC khi đi, không thì chính lần điều hướng này bị nó chặn lại.
              dirtyRef.current = false
              router.push(href)
            }}
            className="rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            Rời đi, bỏ thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}
