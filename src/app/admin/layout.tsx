import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getProfile } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Quản trị',
  robots: { index: false, follow: false },
}

const ADMIN_NAV = [
  { label: 'Sản phẩm', href: '/admin/san-pham' },
  { label: 'Danh mục diều', href: '/admin/danh-muc' },
  { label: 'Nội dung trang chủ', href: '/admin/noi-dung' },
  { label: 'Thông tin shop', href: '/admin/cai-dat' },
  { label: 'Tin nhắn liên hệ', href: '/admin/lien-he' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Chốt chặn của cả khu /admin. Mỗi route API bên dưới VẪN tự requireAdmin() — layout chỉ
  // che giao diện, không bảo vệ được dữ liệu khi ai đó gọi thẳng API.
  const profile = await getProfile()
  if (!profile) redirect('/dang-nhap?tiep-tuc=/admin')

  // 404 chứ không phải 403: user thường không cần biết là có khu quản trị ở đây.
  if (profile.role !== 'admin') notFound()

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-stone-200 pb-4 dark:border-ink-700">
        <Link
          href="/admin"
          className="text-lg font-extrabold tracking-tight text-ink-900 dark:text-stone-50"
        >
          Quản trị
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-stone-600 transition-colors hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-400"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto truncate text-sm text-stone-500 dark:text-stone-400">
          {profile.email}
        </span>
      </div>

      {children}
    </div>
  )
}
