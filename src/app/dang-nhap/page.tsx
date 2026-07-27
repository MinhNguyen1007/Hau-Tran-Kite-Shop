import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { getProfile } from '@/lib/auth'
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

  // Đã đăng nhập rồi thì vào thẳng, không bắt đăng nhập lại.
  const profile = await getProfile()
  if (profile) redirect(next)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 md:py-20">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Đăng nhập
      </h1>
      <p className="mb-8 mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        Đăng nhập để theo dõi đơn hàng đã đặt tại {SHOP.name}.
      </p>

      <LoginForm next={next} callbackError={params.loi} />
    </div>
  )
}
