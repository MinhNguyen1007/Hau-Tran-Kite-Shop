// Phân loại diều cho tab lọc ở trang chủ.
//
// TODO(db): GĐ1 suy ra nhóm từ slug vì bảng products chưa có cột category. Khi thêm cột thật
// (migration + RLS), đổi categoryOf() thành đọc product.category và bỏ hết keyword matching ở đây.
// Giữ id ổn định để không phải sửa UI lúc chuyển.
import type { Product } from './products'

export type CategoryId = 'canh-coc' | 'sao' | 'tre-em' | 've-tay'

export const CATEGORY_TABS: { id: CategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'canh-coc', label: 'Diều cánh cốc' },
  { id: 'sao', label: 'Diều sáo' },
  { id: 've-tay', label: 'Diều vẽ tay' },
  { id: 'tre-em', label: 'Diều trẻ em' },
]

export function categoryOf(product: Product): CategoryId {
  const slug = product.slug
  if (slug.includes('sao')) return 'sao'
  if (slug.includes('mini') || slug.includes('tre-em')) return 'tre-em'
  if (slug.includes('ve-tay')) return 've-tay'
  return 'canh-coc'
}

export function filterByCategory(products: Product[], tab: CategoryId | 'all'): Product[] {
  if (tab === 'all') return products
  return products.filter((p) => categoryOf(p) === tab)
}
