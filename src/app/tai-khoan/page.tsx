import { Heart, SignOut, UserCircle } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/roles'
import { HOTLINE_HREF, SHOP } from '@/lib/shop'

export const metadata: Metadata = {
  title: `Tài khoản | ${SHOP.name}`,
  robots: { index: false, follow: false },
}

export default async function AccountPage() {
  // Middleware đã chặn khách chưa đăng nhập, nhưng kiểm lại ở đây: middleware chỉ là UX,
  // không phải lớp bảo mật (xem CLAUDE.md).
  const profile = await getProfile()
  if (!profile) redirect('/dang-nhap?tiep-tuc=/tai-khoan')

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl dark:text-stone-50">
        Tài khoản
      </h1>

      <div className="mt-6 flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-ink-800 dark:text-brand-400">
            <UserCircle size={26} weight="fill" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink-900 dark:text-stone-50">
              {profile.fullName ?? profile.email ?? 'Khách hàng'}
            </p>
            {profile.fullName && profile.email && (
              <p className="truncate text-sm text-stone-600 dark:text-stone-400">{profile.email}</p>
            )}
          </div>
        </div>

        {hasAdminAccess(profile.role) && (
          <Link
            href="/admin"
            className="self-start rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
          >
            Vào trang quản trị
          </Link>
        )}

        {/* form POST chứ không phải link: đăng xuất bằng GET sẽ bị prefetch (xem route handler). */}
        <form action="/auth/dang-xuat" method="post" className="border-t border-stone-200 pt-5 dark:border-ink-700">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-100 dark:border-ink-700 dark:text-stone-200 dark:hover:bg-ink-800"
          >
            <SignOut size={18} weight="bold" />
            Đăng xuất
          </button>
        </form>
      </div>

      {/* Shop chốt đơn qua Zalo/điện thoại nên ở đây không có lịch sử đơn — thứ khách cần
          giữ lại giữa các lần ghé là danh sách mẫu diều đã ưng. */}
      <Link
        href="/yeu-thich"
        className="mt-6 flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-brand-600 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-brand-400"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-ink-800 dark:text-brand-400">
          <Heart size={22} weight="fill" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold text-ink-900 dark:text-stone-50">
            Diều tôi thích
          </span>
          <span className="block text-sm text-stone-600 dark:text-stone-400">
            Danh sách đã lưu, đồng bộ giữa các thiết bị
          </span>
        </span>
      </Link>

      <p className="mt-4 rounded-xl border border-dashed border-stone-300 px-5 py-4 text-sm text-stone-600 dark:border-ink-700 dark:text-stone-400">
        Muốn đặt diều, gọi hoặc nhắn Zalo{' '}
        <a href={HOTLINE_HREF} className="font-bold text-brand-700 dark:text-brand-400">
          {SHOP.hotline}
        </a>{' '}
        để shop tư vấn mẫu và chốt đơn.
      </p>
    </div>
  )
}
