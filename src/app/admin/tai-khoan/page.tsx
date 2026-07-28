import { Crown, ShieldCheck, User } from '@phosphor-icons/react/ssr'
import { notFound } from 'next/navigation'
import { RoleButton } from '@/components/admin/RoleButton'
import { getProfile } from '@/lib/auth'
import { toDisplayName } from '@/lib/login-identifier'
import { getProfilesForOwner } from '@/lib/profiles'
import { hasOwnerAccess, ROLE_LABEL, type Role } from '@/lib/roles'
import { requireOwner } from '@/lib/supabase'

// Ngày theo múi giờ Việt Nam, không theo múi giờ máy chủ (giống trang tin nhắn liên hệ).
const formatJoinedAt = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(
    new Date(iso),
  )

const ROLE_BADGE: Record<Role, { icon: typeof Crown; className: string }> = {
  owner: {
    icon: Crown,
    className: 'bg-brand-600 text-white',
  },
  admin: {
    icon: ShieldCheck,
    className: 'bg-brand-50 text-brand-700',
  },
  user: {
    icon: User,
    className: 'bg-stone-100 text-stone-700',
  },
}

export default async function AdminAccountsPage() {
  // 404 chứ không phải 403, cùng lý do với layout /admin: admin phụ không cần biết là có
  // màn quản lý tài khoản tồn tại.
  const profile = await getProfile()
  if (!profile || !hasOwnerAccess(profile.role)) notFound()

  // Kiểm lại ở tầng dữ liệu dù đã chặn ở trên — trang này tự đọc DB nên tự chịu trách nhiệm.
  await requireOwner()

  const accounts = await getProfilesForOwner()
  const adminCount = accounts.filter((account) => account.role === 'admin').length

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
          Tài khoản ({accounts.length})
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-stone-600">
          Nâng một khách đã đăng ký lên admin phụ để họ cùng quản lý sản phẩm, danh mục, nội
          dung trang chủ và tin nhắn. Admin phụ không vào được màn hình này, nên không nâng
          thêm ai và cũng không hạ được bạn.
        </p>
      </div>

      <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {accounts.map((account) => {
          const badge = ROLE_BADGE[account.role]
          const Glyph = badge.icon
          const isOwner = account.role === 'owner'
          const name = toDisplayName(account.email)

          return (
            <li key={account.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3.5">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-ink-900">
                  {account.fullName ?? name}
                </span>
                <span className="block truncate text-xs text-stone-500">
                  {account.fullName ? `${name} · ` : ''}
                  Đăng ký {formatJoinedAt(account.createdAt)}
                </span>
              </span>

              <span
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}
              >
                <Glyph size={13} weight="bold" />
                {ROLE_LABEL[account.role]}
              </span>

              {isOwner ? (
                // Không có nút nào cho dòng chủ shop: RLS cũng chặn, nhưng hiện một nút rồi
                // báo lỗi khi bấm là thiết kế tồi.
                <span className="shrink-0 text-xs text-stone-500">
                  Không đổi được
                </span>
              ) : account.role === 'admin' ? (
                <RoleButton
                  profileId={account.id}
                  nextRole="user"
                  confirmText={`Hạ "${name}" về khách thường? Họ sẽ mất quyền vào khu quản trị ngay lập tức.`}
                />
              ) : (
                <RoleButton
                  profileId={account.id}
                  nextRole="admin"
                  confirmText={`Nâng "${name}" lên admin phụ? Họ sẽ sửa được sản phẩm, danh mục, nội dung trang chủ và thông tin shop.`}
                />
              )}
            </li>
          )
        })}
      </ul>

      {adminCount === 0 && (
        <p className="mt-4 text-sm text-stone-600">
          Hiện chưa có admin phụ nào. Một mình bạn quản trị toàn bộ web.
        </p>
      )}
    </div>
  )
}
