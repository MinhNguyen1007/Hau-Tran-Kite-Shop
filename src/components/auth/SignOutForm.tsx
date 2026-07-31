'use client'

// Vỏ bọc nút đăng xuất. Lý do tồn tại: /auth/dang-xuat là route SERVER, nó xoá được cookie
// phiên nhưng không với tới localStorage — mà danh sách yêu thích nằm ở đó. Không dọn thì
// người đăng nhập sau trên cùng máy thấy diều người trước đã thích.
//
// Vẫn là form POST như cũ (link GET bị prefetch, xem route handler). onSubmit chạy đồng bộ
// trước khi trình duyệt gửi request, mà localStorage là API đồng bộ, nên dọn xong mới đi.
//
// MỌI đường đăng xuất phải đi qua đây — thêm form POST thẳng tới /auth/dang-xuat ở chỗ khác
// là dựng lại đúng cái bug này.
import type { ReactNode } from 'react'
import { clearWishlist } from '@/lib/wishlist-store'

export function SignOutForm({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <form action="/auth/dang-xuat" method="post" className={className} onSubmit={clearWishlist}>
      {children}
    </form>
  )
}
