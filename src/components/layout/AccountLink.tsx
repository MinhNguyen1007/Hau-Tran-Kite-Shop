// Ô "Tài khoản" trên header. Server Component: đọc session ở server nên không nháy từ
// "Đăng nhập" sang tên người dùng sau khi hydrate như cách làm bằng client component.
//
// Chỉ còn ICON cho khớp header dạng pill; tên người dùng chuyển sang aria-label + title để
// vẫn đọc được bằng trình đọc màn hình và khi rê chuột.
//
// Hồ sơ do SiteHeader truyền xuống chứ KHÔNG tự đọc: cạnh nó còn AdminLink cũng cần hồ sơ,
// mỗi component tự gọi getProfile() là hai lượt getUser() + hai truy vấn cho mỗi lần render.
import { UserCircle } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import type { Profile } from '@/lib/auth'

export function AccountLink({
  profile,
  className = '',
}: {
  profile: Profile | null
  className?: string
}) {
  // Tên hiển thị: ưu tiên tên Google, không có thì lấy phần trước @ của email.
  const label = profile
    ? (profile.fullName ?? profile.email?.split('@')[0] ?? 'Tài khoản')
    : 'Đăng nhập'

  return (
    <Link
      href={profile ? '/tai-khoan' : '/dang-nhap'}
      title={label}
      aria-label={label}
      className={`grid h-9 w-9 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-100 hover:text-ink-950 ${className}`}
    >
      <UserCircle size={20} weight={profile ? 'fill' : 'bold'} />
    </Link>
  )
}
