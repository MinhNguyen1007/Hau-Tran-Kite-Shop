import { PageHeader, Panel } from '@/components/admin/Panel'
import { ProductForm } from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/categories'
import { requireAdmin } from '@/lib/supabase'

export default async function NewProductPage() {
  await requireAdmin()
  const categories = await getCategories()

  return (
    <div>
      <PageHeader
        title="Thêm sản phẩm"
        backHref="/admin/san-pham"
        backLabel="Danh sách sản phẩm"
      />
      <Panel>
        <ProductForm categories={categories} />
      </Panel>
    </div>
  )
}
