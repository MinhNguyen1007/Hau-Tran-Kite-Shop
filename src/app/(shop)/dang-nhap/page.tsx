import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { getProfile } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/roles'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Đăng nhập',
  robots: { index: false, follow: false },
}

// Chỉ nhận đường dẫn nội bộ — cùng lý do với safeNextPath trong auth/callback/route.ts.
function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/tai-khoan'
  return value
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ 'tiep-tuc'?: string; loi?: string }>
}) {
  const params = await searchParams
  const next = safeNextPath(params['tiep-tuc'])

  // Đã đăng nhập rồi thì vào thẳng, không bắt đăng nhập lại. Admin không có đích cụ thể thì
  // về khu quản trị — cùng luật với LoginForm và auth/callback, sửa thì sửa cả ba.
  const profile = await getProfile()
  if (profile) {
    redirect(next === '/tai-khoan' && hasAdminAccess(profile.role) ? '/admin' : next)
  }

  const settings = await getSiteSettings()

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 md:py-20">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Đăng nhập
      </h1>
      {/* KHÔNG hứa "theo dõi đơn hàng": web này không nhận đơn, mọi đơn chốt qua Zalo
          (quyết định nghiệp vụ 2026-07-26). Câu cũ là chữ sót lại từ thời còn giỏ hàng. */}
      <p className="mb-8 mt-2 text-sm leading-relaxed text-stone-600">
        Đăng nhập để giữ danh sách diều yêu thích của bạn ở {settings.shopName}, xem được trên
        mọi thiết bị.
      </p>

      {/* KHÔNG còn dòng "Chưa có tài khoản? Đăng ký" (bỏ 2026-07-31): đăng ký riêng đã bỏ hẳn,
          nút Google vừa là đăng nhập vừa là đăng ký. Thêm lại link đó là dẫn khách tới 404. */}
      <LoginForm next={next} callbackError={params.loi} />
    </div>
  )
}
