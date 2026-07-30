// Ô "Tài khoản" trên header. Server Component: đọc session ở server nên không nháy từ
// "Đăng nhập" sang tên người dùng sau khi hydrate như cách làm bằng client component.
//
// BA trạng thái nhìn khác nhau rõ ràng, vì ô này là chỗ duy nhất trên storefront cho biết
// mình đang đăng nhập hay không:
//   chưa đăng nhập → icon người viền mảnh, không có vòng ngoài
//   đã đăng nhập, có ảnh → chính ảnh đại diện, bọc vòng tròn
//   đã đăng nhập, chưa có ảnh → chữ viết tắt trên nền ink-950
//
// Trước 2026-07-30 cả ba dùng cùng một icon, chỉ khác `weight` fill/bold — user không nhận ra
// mình đã đăng nhập. Đừng gộp lại.
//
// Hồ sơ do SiteHeader truyền xuống chứ KHÔNG tự đọc: cạnh nó còn AdminLink cũng cần hồ sơ,
// mỗi component tự gọi getProfile() là hai lượt getUser() + hai truy vấn cho mỗi lần render.
import { UserCircle } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import type { Profile } from '@/lib/auth'
import { getAvatarUrl } from '@/lib/storage'

// Ô dự phòng khi khách chưa đặt ảnh: chữ đầu của tên đầu + tên cuối. CỐ Ý không dùng lại
// icon người chung chung ở đây — nó trùng đúng trạng thái CHƯA đăng nhập, tức là không nói
// thêm được gì. Một chữ cái riêng của mình thì nhận ra ngay.
function initials(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0].charAt(0)
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : ''
  return (first + last).toUpperCase()
}

const BASE = 'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors'

export function AccountLink({
  profile,
  className = '',
}: {
  profile: Profile | null
  className?: string
}) {
  if (!profile) {
    return (
      <Link
        href="/dang-nhap"
        title="Đăng nhập"
        aria-label="Đăng nhập"
        className={`${BASE} text-stone-600 hover:bg-stone-100 hover:text-ink-950 ${className}`}
      >
        <UserCircle size={20} weight="bold" />
      </Link>
    )
  }

  // Tên hiển thị: ưu tiên tên Google, không có thì lấy phần trước @ của email.
  const label = profile.fullName ?? profile.email?.split('@')[0] ?? 'Tài khoản'

  return (
    <Link
      href="/tai-khoan"
      title={label}
      aria-label={`Tài khoản của ${label}`}
      className={`${BASE} overflow-hidden ring-1 ring-stone-300 hover:ring-2 hover:ring-ink-950/40 ${className}`}
    >
      {profile.avatarPath ? (
        // alt rỗng vì thẻ Link đã mang aria-label: để cả hai là trình đọc màn hình đọc hai lần.
        <Image
          src={getAvatarUrl(profile.avatarPath)}
          alt=""
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center bg-ink-950 text-[11px] font-bold tracking-tight text-white">
          {initials(label)}
        </span>
      )}
    </Link>
  )
}
