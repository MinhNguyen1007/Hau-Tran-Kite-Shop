import { CategoryForm } from '@/components/admin/CategoryForm'
import { requireAdmin } from '@/lib/supabase'

export default async function NewCategoryPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900">
        Thêm danh mục
      </h1>
      <CategoryForm />
    </div>
  )
}
