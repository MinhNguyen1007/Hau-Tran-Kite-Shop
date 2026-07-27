import { redirect } from 'next/navigation'

// Chưa có dashboard số liệu; vào thẳng việc hay dùng nhất. Khi có báo cáo events thì dựng ở đây.
export default function AdminHomePage() {
  redirect('/admin/san-pham')
}
