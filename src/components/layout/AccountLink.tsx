// Ô "Tài khoản" trên header. Server Component: đọc session ở server nên không nháy từ
// "Đăng nhập" sang tên người dùng sau khi hydrate như cách làm bằng client component.
import { UserCircle } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { getProfile } from '@/lib/auth'

export async function AccountLink({ className = '' }: { className?: string }) {
  const profile = await getProfile()

  // Tên hiển thị: ưu tiên tên Google, không có thì lấy phần trước @ của email.
  const label = profile
    ? (profile.fullName ?? profile.email?.split('@')[0] ?? 'Tài khoản')
    : 'Đăng nhập'

  return (
    <Link
      href={profile ? '/tai-khoan' : '/dang-nhap'}
      className={`items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-ink-800 ${className}`}
    >
      <UserCircle size={22} weight={profile ? 'fill' : 'regular'} />
      <span className="max-w-28 truncate">{label}</span>
    </Link>
  )
}
