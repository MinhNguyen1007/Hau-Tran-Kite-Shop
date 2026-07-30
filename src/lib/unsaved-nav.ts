// Quyết định MỘT click trên thẻ <a> có phải là "đang rời khỏi form" hay không.
//
// Tách khỏi UnsavedGuard.tsx vì đây là phần dễ sai nhất và cũng là phần duy nhất kiểm được
// bằng unit test: phần còn lại của guard chỉ là gắn/tháo listener. Chặn quá tay thì hỏng cả
// Ctrl+click mở tab mới và link tải file; chặn thiếu thì mất dữ liệu đúng như hôm 2026-07-28.
//
// File thuần, không chạm DOM lẫn next/headers → client component import được.

export type NavClick = {
  // 0 = chuột trái. Chuột giữa (1) mở tab mới, chuột phải (2) mở menu ngữ cảnh.
  button: number
  // Ctrl/Cmd/Shift/Alt đang giữ: người dùng muốn mở tab hoặc cửa sổ mới, không rời trang này.
  modifierPressed: boolean
  // URL tuyệt đối của thẻ <a> (dùng anchor.href, không dùng getAttribute('href')).
  href: string
  // Thuộc tính target của thẻ <a>. Chuỗi rỗng nghĩa là không khai.
  anchorTarget: string
  isDownload: boolean
  // URL tuyệt đối của trang hiện tại.
  currentUrl: string
}

export function shouldWarnBeforeLeaving(click: NavClick): boolean {
  if (click.button !== 0) return false
  if (click.modifierPressed) return false
  if (click.isDownload) return false
  if (click.anchorTarget !== '' && click.anchorTarget !== '_self') return false

  let target: URL
  let current: URL
  try {
    target = new URL(click.href)
    current = new URL(click.currentUrl)
  } catch {
    // href kiểu 'mailto:', 'tel:', 'javascript:' hoặc rác: không phải điều hướng trong app.
    return false
  }

  // Ra ngoài site (kể cả link Zalo, Google) thì trình duyệt tự lo, beforeunload sẽ bắt.
  if (target.origin !== current.origin) return false

  // Cùng đường dẫn VÀ cùng query, chỉ khác #hash → nhảy trong trang, không rời form.
  // So cả query vì /admin/san-pham?danh-muc=sao là một trang khác /admin/san-pham.
  if (target.pathname === current.pathname && target.search === current.search) return false

  return true
}
