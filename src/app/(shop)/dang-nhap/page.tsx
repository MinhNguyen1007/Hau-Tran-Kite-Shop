import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { getProfile } from '@/lib/auth'
import { hasAdminAccess } from '@/lib/roles'
import { SHOP } from '@/lib/shop'

export const metadata: Metadata = {
  title: `Đăng nhập | ${SHOP.name}`,
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

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 md:py-20">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">
        Đăng nhập
      </h1>
      <p className="mb-8 mt-2 text-sm leading-relaxed text-stone-600">
        Đăng nhập để theo dõi đơn hàng đã đặt tại {SHOP.name}.
      </p>

      <LoginForm next={next} callbackError={params.loi} />

      <p className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
        Chưa có tài khoản?{' '}
        <Link
          href={`/dang-ky?tiep-tuc=${encodeURIComponent(next)}`}
          className="font-semibold text-ink-950 hover:underline"
        >
          Đăng ký
        </Link>
      </p>
    </div>
  )
}
