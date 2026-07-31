import { Heart, SignOut } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SignOutForm } from '@/components/auth/SignOutForm'
import { getMyProfile } from '@/lib/profiles'
import { telHref } from '@/lib/shop'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Tài khoản',
  robots: { index: false, follow: false },
}

// Không có nút "Vào trang quản trị" ở đây nữa: admin thấy nút "Quản trị" ngay trên header và
// đăng nhập xong là vào thẳng khu quản trị (2026-07-28).
export default async function AccountPage() {
  // Middleware đã chặn khách chưa đăng nhập, nhưng kiểm lại ở đây: middleware chỉ là UX,
  // không phải lớp bảo mật (xem CLAUDE.md).
  const profile = await getMyProfile()
  if (!profile) redirect('/dang-nhap?tiep-tuc=/tai-khoan')

  // Hotline đọc từ site_settings, KHÔNG lấy hằng SHOP: admin đổi số trong /admin/cai-dat mà
  // trang này vẫn hiện số cũ thì khách gọi vào số không còn dùng.
  const settings = await getSiteSettings()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 md:text-3xl">
        Trang cá nhân
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-stone-600">
        {profile.email ?? 'Tài khoản của bạn'}
      </p>

      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5 md:p-6">
        <h2 className="mb-5 text-base font-bold text-ink-950">Thông tin cá nhân</h2>
        <ProfileForm profile={profile} />
      </section>

      {/* Shop chốt đơn qua Zalo/điện thoại nên ở đây không có lịch sử đơn — thứ khách cần
          giữ lại giữa các lần ghé là danh sách mẫu diều đã ưng. */}
      <Link
        href="/yeu-thich"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-400"
      >
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-stone-100 text-stone-600">
          <Heart size={22} weight="fill" />
        </span>
        <span className="min-w-0">
          <span className="block text-base font-bold text-ink-950">Diều tôi thích</span>
          <span className="block text-sm text-stone-600">
            Danh sách đã lưu, đồng bộ giữa các thiết bị
          </span>
        </span>
      </Link>

      <p className="mt-4 rounded-2xl border border-dashed border-stone-300 px-5 py-4 text-sm leading-relaxed text-stone-600">
        Muốn đặt diều, gọi hoặc nhắn Zalo{' '}
        <a href={telHref(settings.hotline)} className="font-bold text-ink-950">
          {settings.hotline}
        </a>{' '}
        để shop tư vấn mẫu và chốt đơn.
      </p>

      <SignOutForm className="mt-6">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-800 transition-colors hover:bg-stone-100"
        >
          <SignOut size={18} weight="bold" />
          Đăng xuất
        </button>
      </SignOutForm>
    </div>
  )
}
