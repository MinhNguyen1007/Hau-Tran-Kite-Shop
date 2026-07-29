import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { AdminShell } from '@/components/admin/AdminShell'
import { getProfile } from '@/lib/auth'
import { hasAdminAccess, hasOwnerAccess, ROLE_LABEL } from '@/lib/roles'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Quản trị',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Chốt chặn của cả khu /admin. Mỗi route API bên dưới VẪN tự requireAdmin() — layout chỉ
  // che giao diện, không bảo vệ được dữ liệu khi ai đó gọi thẳng API.
  const profile = await getProfile()
  if (!profile) redirect('/dang-nhap?tiep-tuc=/admin')

  // 404 chứ không phải 403: user thường không cần biết là có khu quản trị ở đây.
  if (!hasAdminAccess(profile.role)) notFound()

  const settings = await getSiteSettings()

  return (
    <AdminShell
      isOwner={hasOwnerAccess(profile.role)}
      shopName={settings.shopName}
      userName={profile.fullName ?? profile.email ?? 'Quản trị viên'}
      roleLabel={ROLE_LABEL[profile.role]}
    >
      {children}
    </AdminShell>
  )
}
