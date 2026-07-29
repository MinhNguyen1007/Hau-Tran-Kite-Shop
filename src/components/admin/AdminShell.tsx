'use client'

// Vỏ khu quản trị: sidebar tối bên trái + topbar dính + vùng nội dung nền xám.
// Chỉ giữ đúng một mẩu trạng thái (ngăn kéo trên điện thoại) nên `children` vẫn là Server
// Component — mọi trang admin bên dưới không bị kéo sang client.
import { useCallback, useState } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { AdminTopbar } from './AdminTopbar'

export function AdminShell({
  isOwner,
  shopName,
  userName,
  roleLabel,
  children,
}: {
  isOwner: boolean
  shopName: string
  userName: string
  roleLabel: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  // useCallback: AdminSidebar đóng ngăn kéo trong một useEffect phụ thuộc hàm này. Hàm mới
  // mỗi lần render sẽ làm effect đó chạy lại liên tục.
  const close = useCallback(() => setOpen(false), [])

  return (
    <div className="flex min-h-dvh w-full bg-stone-100">
      <AdminSidebar isOwner={isOwner} shopName={shopName} open={open} onClose={close} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar
          userName={userName}
          roleLabel={roleLabel}
          onOpenSidebar={() => setOpen(true)}
        />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
