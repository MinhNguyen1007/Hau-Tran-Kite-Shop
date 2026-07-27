import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { getCategoryById } from '@/lib/categories'
import { requireAdmin } from '@/lib/supabase'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) notFound()

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Sửa danh mục
      </h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-400">
        {category.archivedAt ? 'Danh mục này đang bị gỡ khỏi trang web.' : 'Đang hiện trên trang web.'}
      </p>
      <CategoryForm category={category} />
    </div>
  )
}
