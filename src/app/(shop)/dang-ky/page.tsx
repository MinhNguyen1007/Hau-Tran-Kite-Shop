import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { getProfile } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Đăng ký',
  robots: { index: false, follow: false },
}

// Chỉ nhận đường dẫn nội bộ — cùng lý do với safeNextPath trong auth/callback/route.ts.
function safeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/tai-khoan'
  return value
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ 'tiep-tuc'?: string }>
}) {
  const params = await searchParams
  const next = safeNextPath(params['tiep-tuc'])

  // Đã đăng nhập rồi thì vào thẳng, không bắt đăng ký lại.
  const profile = await getProfile()
  if (profile) redirect(next)

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 md:py-20">
      <h1 className="text-2xl font-bold tracking-tight text-ink-950">Đăng ký</h1>
      <p className="mb-8 mt-2 text-sm leading-relaxed text-stone-600">
        Tạo tài khoản để lưu danh sách yêu thích và xem lại trên máy khác.
      </p>

      <RegisterForm next={next} />

      <p className="mt-6 border-t border-stone-200 pt-5 text-sm text-stone-600">
        Đã có tài khoản?{' '}
        <Link
          href={`/dang-nhap?tiep-tuc=${encodeURIComponent(next)}`}
          className="font-semibold text-ink-950 hover:underline"
        >
          Đăng nhập
        </Link>
      </p>
    </div>
  )
}
