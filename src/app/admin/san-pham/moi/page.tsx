import { ProductForm } from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/categories'
import { requireAdmin } from '@/lib/supabase'

export default async function NewProductPage() {
  await requireAdmin()
  const categories = await getCategories()

  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Thêm sản phẩm
      </h1>
      <ProductForm categories={categories} />
    </div>
  )
}
