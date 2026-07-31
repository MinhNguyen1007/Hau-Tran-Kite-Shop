import { Crown, ShieldCheck, User } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CopyId } from '@/components/admin/CopyId'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { RoleButton } from '@/components/admin/RoleButton'
import { SearchField } from '@/components/admin/SearchField'
import { getProfile } from '@/lib/auth'
import { getProfilesForOwner } from '@/lib/profiles'
import { hasOwnerAccess, ROLE_LABEL, type Role } from '@/lib/roles'
import { getAvatarUrl } from '@/lib/storage'
import { requireOwner } from '@/lib/supabase'

// Ngày theo múi giờ Việt Nam, không theo múi giờ máy chủ.
const formatJoinedAt = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(
    new Date(iso),
  )

const ROLE_BADGE: Record<Role, { icon: typeof Crown; className: string }> = {
  owner: { icon: Crown, className: 'bg-ink-950 text-white' },
  admin: { icon: ShieldCheck, className: 'bg-stone-100 text-ink-950' },
  user: { icon: User, className: 'bg-stone-100 text-stone-700' },
}

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ tim?: string }>
}) {
  // 404 chứ không phải 403, cùng lý do với layout /admin: admin phụ không cần biết là có
  // màn quản lý tài khoản tồn tại.
  const profile = await getProfile()
  if (!profile || !hasOwnerAccess(profile.role)) notFound()

  // Kiểm lại ở tầng dữ liệu dù đã chặn ở trên — trang này tự đọc DB nên tự chịu trách nhiệm.
  await requireOwner()

  const [accounts, params] = await Promise.all([getProfilesForOwner(), searchParams])
  const adminCount = accounts.filter((account) => account.role === 'admin').length

  // Tìm theo email, mã tài khoản hoặc họ tên. Lọc trong bộ nhớ: danh sách này là toàn bộ
  // khách đã đăng ký, còn lâu mới tới mức phải phân trang.
  const keyword = (params.tim ?? '').trim().toLowerCase()
  const rows =
    keyword === ''
      ? accounts
      : accounts.filter(
          (account) =>
            (account.email ?? '').toLowerCase().includes(keyword) ||
            (account.fullName ?? '').toLowerCase().includes(keyword) ||
            account.id.toLowerCase().includes(keyword),
        )

  return (
    <div>
      <PageHeader
        title={`Tài khoản (${accounts.length})`}
        description="Nâng một khách đã đăng ký lên admin phụ để họ cùng quản lý sản phẩm, danh mục và thông tin shop. Admin phụ không vào được màn hình này, nên không nâng thêm ai và cũng không hạ được bạn."
      />

      <div className="mb-4">
        <SearchField
          action="/admin/tai-khoan"
          name="tim"
          defaultValue={params.tim ?? ''}
          label="Tìm tài khoản"
          placeholder="Tìm theo email, mã tài khoản hoặc họ tên..."
        />
      </div>

      <Panel bodyClassName="">
        {rows.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm text-stone-600">
              Không có tài khoản nào khớp với “{params.tim}”.
            </p>
          </div>
        ) : (
          // Bảng chứ không phải danh sách xếp chồng: mỗi tài khoản là MỘT hàng ngang, mỗi
          // thông tin một cột. Dồn tên / ngày / mã thành ba tầng trong một ô là phí sạch chiều
          // ngang và làm mắt phải quét dọc từng dòng để so sánh.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-bold md:px-5">Tài khoản</th>
                  <th className="px-4 py-3 font-bold">Họ tên</th>
                  <th className="px-4 py-3 font-bold">Mã</th>
                  <th className="whitespace-nowrap px-4 py-3 font-bold">Đăng ký</th>
                  <th className="px-4 py-3 font-bold">Vai trò</th>
                  <th className="px-4 py-3 text-right font-bold md:px-5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {rows.map((account) => {
                  const badge = ROLE_BADGE[account.role]
                  const Glyph = badge.icon
                  const isOwner = account.role === 'owner'
                  // Mọi tài khoản giờ đều đăng nhập bằng Google nên email LÀ tên đăng nhập,
                  // không còn email nội bộ nào phải rút gọn lại thành tên tài khoản.
                  const login = account.email ?? '(chưa có email)'
                  // `?? ` không đủ: form hồ sơ lưu chuỗi RỖNG khi khách bỏ trống ô họ tên, mà
                  // chuỗi rỗng thì `??` cho qua và ô hiện ra trắng trơn.
                  const fullName = account.fullName?.trim()

                  return (
                    <tr key={account.id} className="transition-colors hover:bg-stone-50">
                      <td className="px-4 py-3 md:px-5">
                        <div className="flex items-center gap-3">
                          <Avatar path={account.avatarPath} label={login} />
                          <span className="truncate font-semibold text-ink-950">{login}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-700">
                        {fullName || <span className="text-stone-400">Chưa đặt</span>}
                      </td>
                      <td className="px-4 py-3">
                        <CopyId id={account.id} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-stone-600">
                        {formatJoinedAt(account.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}
                        >
                          <Glyph size={13} weight="bold" />
                          {ROLE_LABEL[account.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 md:px-5">
                        <div className="flex justify-end">
                          {isOwner ? (
                            // Không có nút nào cho dòng chủ shop: RLS cũng chặn, nhưng hiện một
                            // nút rồi báo lỗi khi bấm là thiết kế tồi.
                            <span className="whitespace-nowrap text-xs text-stone-500">
                              Không đổi được
                            </span>
                          ) : account.role === 'admin' ? (
                            <RoleButton
                              profileId={account.id}
                              nextRole="user"
                              confirmText={`Hạ "${login}" về khách thường? Họ sẽ mất quyền vào khu quản trị ngay lập tức.`}
                            />
                          ) : (
                            <RoleButton
                              profileId={account.id}
                              nextRole="admin"
                              confirmText={`Nâng "${login}" lên admin phụ? Họ sẽ sửa được sản phẩm, danh mục và thông tin shop.`}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {adminCount === 0 && (
        <p className="mt-4 text-sm text-stone-600">
          Hiện chưa có admin phụ nào. Một mình bạn quản trị toàn bộ web.
        </p>
      )}
    </div>
  )
}

// Ảnh đại diện khách tự tải lên ở /tai-khoan. Chưa có ảnh thì hiện chữ cái đầu chứ KHÔNG
// phải icon người chung chung: cả cột toàn icon giống hệt nhau thì mắt không bám được dòng.
function Avatar({ path, label }: { path: string | null; label: string }) {
  if (!path) {
    // Bỏ ký tự mở đầu không phải chữ/số, vì tài khoản thiếu email hiện là "(chưa có email)"
    // và lấy thẳng ký tự đầu sẽ ra dấu ngoặc.
    const initial = label.trim().replace(/^[^\p{L}\p{N}]+/u, '').slice(0, 1) || '?'
    return (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-stone-100 text-xs font-bold uppercase text-stone-600">
        {initial}
      </span>
    )
  }

  return (
    <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-stone-100">
      <Image src={getAvatarUrl(path)} alt="" fill sizes="36px" className="object-cover" />
    </span>
  )
}
