// Lối vào khu quản trị, hiện THẲNG trên header cho admin và chủ shop.
//
// Trước 2026-07-28 muốn vào /admin phải qua trang tài khoản rồi bấm thêm một nút — thừa một
// bước cho người ngày nào cũng vào đó. Ẩn với khách thường chỉ là phần nhìn: layout /admin và
// mọi route API sau nó đều tự kiểm quyền.
import { SquaresFour } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { Profile } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/roles'

export function AdminLink({ profile }: { profile: Profile | null }) {
  if (!profile || !hasAdminAccess(profile.role)) return null

  return (
    <Link
      href="/admin"
      title="Khu quản trị"
      aria-label="Khu quản trị"
      className="flex h-9 items-center gap-1.5 rounded-full bg-ink-950 px-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
    >
      <SquaresFour size={17} weight="fill" />
      <span className="hidden sm:inline">Quản trị</span>
    </Link>
  )
}
